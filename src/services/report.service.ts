import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/permissions/rbac";
import { OrderStatus } from "@prisma/client";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

let dashboardCache: CacheEntry<any> | null = null;
let categoryReportCache: CacheEntry<any> | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

export function invalidateDashboardCache() {
  dashboardCache = null;
  categoryReportCache = null;
}

export async function getDashboardMetrics() {
  await requireRole(["OWNER", "ADMIN"]);

  // Return from in-memory cache if fresh
  const nowMs = Date.now();
  if (dashboardCache && nowMs - dashboardCache.timestamp < CACHE_TTL_MS) {
    return dashboardCache.data;
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  const successfulStatuses: OrderStatus[] = [OrderStatus.PAID, OrderStatus.COMPLETED];

  // Execute ALL queries concurrently via Promise.all
  const [
    todayOrders,
    [totalOrdersAllTime, totalTransactionsAllTime],
    topOrderItems,
    recentTransactions,
    paymentMethodsGroup,
    pastOrders,
  ] = await Promise.all([
    // 1. Today's orders
    prisma.order.findMany({
      where: {
        createdAt: { gte: startOfToday },
      },
      select: {
        id: true,
        status: true,
        total: true,
      },
    }),
    // 2. All-time counts
    Promise.all([
      prisma.order.count(),
      prisma.transaction.count(),
    ]),
    // 3. Best Selling Products
    prisma.orderItem.groupBy({
      by: ["productId", "productNameSnapshot"],
      _sum: {
        quantity: true,
        subtotal: true,
      },
      where: {
        order: {
          status: { in: successfulStatuses },
        },
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    }),
    // 4. Recent Transactions
    prisma.transaction.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            orderNumber: true,
            customer: { select: { name: true } },
            cashier: { select: { name: true } },
          },
        },
      },
    }),
    // 5. Payment method distribution
    prisma.transaction.groupBy({
      by: ["paymentMethod"],
      _count: { id: true },
      _sum: { amount: true },
    }),
    // 6. Last 7 Days Revenue Trend
    prisma.order.findMany({
      where: {
        createdAt: { gte: startOfWeek },
        status: { in: successfulStatuses },
      },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  let todayRevenue = 0;
  let completedTodayCount = 0;
  let pendingTodayCount = 0;
  let cancelledTodayCount = 0;

  for (const o of todayOrders) {
    if (successfulStatuses.includes(o.status)) {
      todayRevenue += Number(o.total);
      completedTodayCount++;
    } else if (o.status === OrderStatus.PENDING_PAYMENT) {
      pendingTodayCount++;
    } else if (o.status === OrderStatus.CANCELLED) {
      cancelledTodayCount++;
    }
  }

  // Safe Average Order Value (AOV) preventing division by zero
  const averageOrderValue =
    completedTodayCount > 0 ? Math.round(todayRevenue / completedTodayCount) : 0;

  const bestSellingProducts = topOrderItems.map((item) => ({
    productId: item.productId,
    name: item.productNameSnapshot,
    totalQuantity: item._sum.quantity || 0,
    totalRevenue: Number(item._sum.subtotal || 0),
  }));

  const paymentDistribution = paymentMethodsGroup.map((pm) => ({
    method: pm.paymentMethod,
    count: pm._count.id,
    totalAmount: Number(pm._sum.amount || 0),
  }));

  // Safe local date formatting helper (YYYY-MM-DD)
  function getLocalDateKey(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const trendMap = new Map<
    string,
    {
      date: string;
      dayName: string;
      fullDate: string;
      revenue: number;
      orderCount: number;
      isToday: boolean;
    }
  >();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = getLocalDateKey(d);
    const date = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
    }).format(d);
    const dayName = new Intl.DateTimeFormat("id-ID", {
      weekday: "short",
    }).format(d);
    const fullDate = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);

    trendMap.set(key, {
      date,
      dayName,
      fullDate,
      revenue: 0,
      orderCount: 0,
      isToday: i === 0,
    });
  }

  for (const o of pastOrders) {
    const key = getLocalDateKey(new Date(o.createdAt));
    const item = trendMap.get(key);
    if (item) {
      item.revenue += Number(o.total);
      item.orderCount += 1;
    }
  }

  const weeklyTrend = Array.from(trendMap.values());

  const result = {
    todayRevenue,
    todayOrdersCount: todayOrders.length,
    completedTodayCount,
    pendingTodayCount,
    cancelledTodayCount,
    averageOrderValue,
    totalOrdersAllTime,
    totalTransactionsAllTime,
    bestSellingProducts,
    recentTransactions,
    paymentDistribution,
    weeklyTrend,
  };

  dashboardCache = {
    data: result,
    timestamp: Date.now(),
  };

  return result;
}

export async function getCategoryPerformance() {
  await requireRole(["OWNER", "ADMIN"]);

  const nowMs = Date.now();
  if (categoryReportCache && nowMs - categoryReportCache.timestamp < CACHE_TTL_MS) {
    return categoryReportCache.data;
  }

  const categories = await prisma.category.findMany({
    include: {
      products: {
        include: {
          orderItems: {
            where: {
              order: {
                status: { in: [OrderStatus.PAID, OrderStatus.COMPLETED] },
              },
            },
            select: {
              quantity: true,
              subtotal: true,
            },
          },
        },
      },
    },
  });

  const result = categories.map((cat) => {
    let totalQuantity = 0;
    let totalRevenue = 0;

    for (const prod of cat.products) {
      for (const item of prod.orderItems) {
        totalQuantity += item.quantity;
        totalRevenue += Number(item.subtotal);
      }
    }

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      slug: cat.slug,
      productCount: cat.products.length,
      totalQuantitySold: totalQuantity,
      totalRevenue,
    };
  });

  categoryReportCache = {
    data: result,
    timestamp: Date.now(),
  };

  return result;
}
