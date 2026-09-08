import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/permissions/rbac";
import { OrderStatus } from "@prisma/client";

export async function getDashboardMetrics() {
  await requireRole(["OWNER", "ADMIN"]);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  // 1. Today's orders & revenue
  const todayOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startOfToday },
    },
    select: {
      id: true,
      status: true,
      total: true,
    },
  });

  const successfulStatuses: OrderStatus[] = [OrderStatus.PAID, OrderStatus.COMPLETED];

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

  // 2. All-time counts for overview
  const [totalOrdersAllTime, totalTransactionsAllTime] = await Promise.all([
    prisma.order.count(),
    prisma.transaction.count(),
  ]);

  // 3. Best Selling Products (Aggregated from OrderItems of paid/completed orders)
  const topOrderItems = await prisma.orderItem.groupBy({
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
  });

  const bestSellingProducts = topOrderItems.map((item) => ({
    productId: item.productId,
    name: item.productNameSnapshot,
    totalQuantity: item._sum.quantity || 0,
    totalRevenue: Number(item._sum.subtotal || 0),
  }));

  // 4. Recent Transactions
  const recentTransactions = await prisma.transaction.findMany({
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
  });

  // 5. Payment method distribution
  const paymentMethodsGroup = await prisma.transaction.groupBy({
    by: ["paymentMethod"],
    _count: { id: true },
    _sum: { amount: true },
  });

  const paymentDistribution = paymentMethodsGroup.map((pm) => ({
    method: pm.paymentMethod,
    count: pm._count.id,
    totalAmount: Number(pm._sum.amount || 0),
  }));

  // 6. Last 7 Days Revenue Trend
  const pastOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startOfWeek },
      status: { in: successfulStatuses },
    },
    select: {
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by day name (e.g. "08 Sep")
  const trendMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const label = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
    }).format(d);
    trendMap.set(label, 0);
  }

  for (const o of pastOrders) {
    const label = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
    }).format(o.createdAt);
    const curr = trendMap.get(label) || 0;
    trendMap.set(label, curr + Number(o.total));
  }

  const weeklyTrend = Array.from(trendMap.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  return {
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
}

export async function getCategoryPerformance() {
  await requireRole(["OWNER", "ADMIN"]);

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

  return categories.map((cat) => {
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
}
