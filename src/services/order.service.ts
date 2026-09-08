import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/permissions/rbac";
import { generateOrderNumber } from "@/lib/utils";
import type { CreateOrderInput } from "@/lib/validations/order";
import { Prisma, OrderStatus } from "@prisma/client";

export async function createOrder(input: CreateOrderInput) {
  const session = await requireAuth();

  if (!input.items || input.items.length === 0) {
    throw new Error("Pesanan harus memiliki minimal 1 item produk.");
  }

  // 1. Fetch products from database using IDs sent from client
  const productIds = input.items.map((i) => i.productId);
  const dbProducts = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
  });

  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  // 2. Validate availability and calculate line items server-side
  let subtotalAmount = 0;
  const orderItemsData: Array<{
    productId: string;
    productNameSnapshot: string;
    unitPrice: Prisma.Decimal;
    quantity: number;
    subtotal: Prisma.Decimal;
  }> = [];

  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);
    }

    if (!product.isActive) {
      throw new Error(`Produk '${product.name}' saat ini sedang habis / tidak aktif.`);
    }

    if (item.quantity <= 0) {
      throw new Error(`Jumlah pesanan untuk '${product.name}' tidak valid.`);
    }

    const unitPrice = Number(product.price);
    const lineSubtotal = unitPrice * item.quantity;
    subtotalAmount += lineSubtotal;

    orderItemsData.push({
      productId: product.id,
      productNameSnapshot: product.name,
      unitPrice: product.price,
      quantity: item.quantity,
      subtotal: new Prisma.Decimal(lineSubtotal),
    });
  }

  // 3. Server-side discount & tax calculation
  const discountPercent = Math.max(0, Math.min(100, input.discountPercent || 0));
  const discountAmount = Math.round((subtotalAmount * discountPercent) / 100);
  const taxableAmount = Math.max(0, subtotalAmount - discountAmount);
  // PB1 Cafe Tax: 10%
  const taxAmount = Math.round(taxableAmount * 0.1);
  const grandTotalAmount = taxableAmount + taxAmount;

  const orderNumber = generateOrderNumber();

  // 4. Atomic database transaction with increased timeout for Supabase connection pooler
  const newOrder = await prisma.$transaction(
    async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: input.customerId || null,
          cashierId: session.userId,
          status: OrderStatus.PENDING_PAYMENT,
          subtotal: new Prisma.Decimal(subtotalAmount),
          discount: new Prisma.Decimal(discountAmount),
          tax: new Prisma.Decimal(taxAmount),
          total: new Prisma.Decimal(grandTotalAmount),
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { imageUrl: true, category: { select: { name: true } } },
              },
            },
          },
          customer: true,
          cashier: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return order;
    },
    {
      maxWait: 15000,
      timeout: 25000,
    }
  );

  // Non-blocking audit log creation
  prisma.auditLog
    .create({
      data: {
        userId: session.userId,
        action: "ORDER_CREATED",
        entity: "ORDER",
        entityId: newOrder.id,
        details: {
          orderNumber: newOrder.orderNumber,
          total: grandTotalAmount,
          itemCount: orderItemsData.length,
          cashier: session.name,
        },
      },
    })
    .catch((err) => console.warn("Failed to create order audit log:", err));

  return newOrder;
}

export async function getOrderById(orderId: string) {
  await requireAuth();

  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      customer: true,
      cashier: {
        select: { id: true, name: true, email: true },
      },
      payments: true,
      transaction: true,
    },
  });
}

export async function getOrders(options: {
  status?: OrderStatus;
  search?: string;
  limit?: number;
  page?: number;
} = {}) {
  await requireAuth();

  const { status, search, limit = 50, page = 1 } = options;
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: "insensitive" } },
            { customer: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: true,
        customer: true,
        cashier: {
          select: { id: true, name: true },
        },
        transaction: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, page, totalPages: Math.ceil(total / limit) };
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const session = await requireAuth();

  const currentOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!currentOrder) {
    throw new Error("Pesanan tidak ditemukan.");
  }

  // State Machine Validation
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    DRAFT: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED],
    PENDING_PAYMENT: [OrderStatus.PAID, OrderStatus.CANCELLED],
    PAID: [OrderStatus.COMPLETED, OrderStatus.REFUNDED],
    COMPLETED: [],
    CANCELLED: [],
    REFUNDED: [],
  };

  const allowed = validTransitions[currentOrder.status];
  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Perubahan status dari '${currentOrder.status}' ke '${newStatus}' tidak diperbolehkan.`
    );
  }

  // If refund or cancel is attempted by a non-manager/owner, enforce RBAC
  if ((newStatus === OrderStatus.CANCELLED || newStatus === OrderStatus.REFUNDED) && session.role === "CASHIER") {
    throw new Error("Kasir tidak memiliki wewenang untuk membatalkan atau me-refund pesanan.");
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
    include: {
      items: true,
      customer: true,
      cashier: { select: { id: true, name: true } },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: "ORDER_STATUS_CHANGED",
      entity: "ORDER",
      entityId: orderId,
      details: {
        orderNumber: currentOrder.orderNumber,
        oldStatus: currentOrder.status,
        newStatus,
        performedBy: session.email,
      },
    },
  });

  return updatedOrder;
}

