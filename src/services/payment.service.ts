import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/permissions/rbac";
import { generateTransactionNumber } from "@/lib/utils";
import {
  createSnapToken,
  verifyMidtransSignature,
  type MidtransNotificationPayload,
} from "@/lib/payments/midtrans";
import { OrderStatus, PaymentStatus, PaymentMethod, Prisma } from "@prisma/client";
import { invalidateDashboardCache } from "@/services/report.service";

function mapMidtransPaymentType(paymentType: string): PaymentMethod {
  switch (paymentType?.toLowerCase()) {
    case "qris":
      return PaymentMethod.QRIS;
    case "gopay":
      return PaymentMethod.GOPAY;
    case "shopeepay":
      return PaymentMethod.SHOPEEPAY;
    case "bank_transfer":
    case "echannel":
      return PaymentMethod.BANK_TRANSFER;
    case "credit_card":
      return PaymentMethod.CREDIT_CARD;
    default:
      return PaymentMethod.QRIS;
  }
}

/**
 * 1. Initiates a Midtrans Snap transaction
 */
export async function initiateMidtransPayment(orderId: string) {
  const session = await requireAuth();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      customer: true,
    },
  });

  if (!order) {
    throw new Error("Pesanan tidak ditemukan.");
  }

  if (order.status !== OrderStatus.PENDING_PAYMENT && order.status !== OrderStatus.DRAFT) {
    throw new Error(`Pesanan tidak dalam status menunggu pembayaran (Status: ${order.status}).`);
  }

  // Request Snap Token
  const snapResult = await createSnapToken({
    orderId: order.orderNumber,
    grossAmount: Number(order.total),
    customer: order.customer
      ? {
          name: order.customer.name,
          phone: order.customer.phone || undefined,
          email: order.customer.email || undefined,
        }
      : null,
    items: order.items.map((i) => ({
      id: i.productId,
      name: i.productNameSnapshot,
      price: Number(i.unitPrice),
      quantity: i.quantity,
    })),
  });

  // Record initial Payment attempt
  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: "MIDTRANS",
      paymentMethod: PaymentMethod.QRIS,
      amount: order.total,
      status: PaymentStatus.PENDING,
      rawResponse: { snapToken: snapResult.token },
    },
  });

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    total: Number(order.total),
    token: snapResult.token,
    redirectUrl: snapResult.redirect_url,
    paymentId: payment.id,
  };
}

/**
 * 2. Processes Cash payment at POS cashier
 */
export async function processCashPayment(orderId: string, cashReceived: number) {
  const session = await requireAuth();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, customer: true },
  });

  if (!order) {
    throw new Error("Pesanan tidak ditemukan.");
  }

  if (order.status === OrderStatus.PAID || order.status === OrderStatus.COMPLETED) {
    throw new Error("Pesanan ini telah lunas sebelumnya.");
  }

  const orderTotal = Number(order.total);
  if (cashReceived < orderTotal) {
    throw new Error(
      `Uang tunai yang diterima (Rp ${cashReceived.toLocaleString("id-ID")}) kurang dari total tagihan (Rp ${orderTotal.toLocaleString("id-ID")}).`
    );
  }

  const change = cashReceived - orderTotal;
  const transactionNumber = generateTransactionNumber();
  const now = new Date();

  // Execute atomic financial transaction with custom timeout for connection pooler
  const result = await prisma.$transaction(
    async (tx) => {
      // 1. Create Payment record
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          provider: "CASH",
          paymentMethod: PaymentMethod.CASH,
          amount: order.total,
          status: PaymentStatus.SETTLEMENT,
          rawResponse: {
            received: cashReceived,
            change,
            cashierId: session.userId,
          },
          paidAt: now,
        },
      });

      // 2. Update Order status to PAID
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
        },
      });

      // 3. Create Immutable Transaction ledger entry
      const transaction = await tx.transaction.create({
        data: {
          transactionNumber,
          orderId: order.id,
          paymentId: payment.id,
          amount: order.total,
          paymentMethod: PaymentMethod.CASH,
          status: "SUCCESS",
          paidAt: now,
        },
      });

      return {
        order: updatedOrder,
        payment,
        transaction,
        change,
      };
    },
    {
      maxWait: 15000,
      timeout: 25000,
    }
  );

  // Non-blocking audit log
  prisma.auditLog
    .create({
      data: {
        userId: session.userId,
        action: "ORDER_PAID_CASH",
        entity: "ORDER",
        entityId: order.id,
        details: {
          orderNumber: order.orderNumber,
          transactionNumber,
          total: orderTotal,
          cashReceived,
          change,
          cashier: session.name,
        },
      },
    })
    .catch((err) => console.warn("Failed to create cash payment audit log:", err));

  invalidateDashboardCache();
  return result;
}

/**
 * 3. Midtrans Webhook Notification Handler (Idempotent)
 */
export async function handleMidtransNotification(
  payload: MidtransNotificationPayload
) {
  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    transaction_id,
    payment_type,
    settlement_time,
  } = payload;

  // 1. Verify cryptographic signature
  const isValidSignature = verifyMidtransSignature(
    order_id,
    status_code,
    gross_amount,
    signature_key
  );

  if (!isValidSignature) {
    console.error("Midtrans signature verification failed for order:", order_id);
    throw new Error("INVALID_SIGNATURE: Tanda tangan notifikasi Midtrans tidak valid.");
  }

  // 2. Locate order in database
  const order = await prisma.order.findUnique({
    where: { orderNumber: order_id },
  });

  if (!order) {
    console.error("Order not found for Midtrans notification:", order_id);
    throw new Error(`ORDER_NOT_FOUND: Pesanan ${order_id} tidak ditemukan.`);
  }

  // 3. Idempotency Check: if order is already PAID/COMPLETED, return immediately
  if (order.status === OrderStatus.PAID || order.status === OrderStatus.COMPLETED) {
    return {
      status: "ALREADY_PROCESSED",
      message: `Pesanan ${order_id} telah berstatus ${order.status}. Notifikasi duplikat diabaikan dengan aman.`,
    };
  }

  const paymentMethod = mapMidtransPaymentType(payment_type);
  const now = settlement_time ? new Date(settlement_time) : new Date();

  // 4. State transition handling
  if (transaction_status === "capture" || transaction_status === "settlement") {
    // Payment Successful
    const transactionNumber = generateTransactionNumber();

    await prisma.$transaction(
      async (tx) => {
        // Find or create payment entry
        let payment = await tx.payment.findFirst({
          where: { orderId: order.id, provider: "MIDTRANS" },
        });

        if (payment) {
          payment = await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.SETTLEMENT,
              providerTransactionId: transaction_id,
              paymentMethod,
              paidAt: now,
              rawResponse: payload as unknown as Prisma.InputJsonValue,
            },
          });
        } else {
          payment = await tx.payment.create({
            data: {
              orderId: order.id,
              provider: "MIDTRANS",
              providerTransactionId: transaction_id,
              paymentMethod,
              amount: order.total,
              status: PaymentStatus.SETTLEMENT,
              paidAt: now,
              rawResponse: payload as unknown as Prisma.InputJsonValue,
            },
          });
        }

        // Mark Order as PAID
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.PAID },
        });

        // Create Immutable Transaction
        await tx.transaction.create({
          data: {
            transactionNumber,
            orderId: order.id,
            paymentId: payment.id,
            amount: order.total,
            paymentMethod,
            status: "SUCCESS",
            paidAt: now,
          },
        });

        // Audit Log
        await tx.auditLog.create({
          data: {
            action: "ORDER_PAID_MIDTRANS",
            entity: "ORDER",
            entityId: order.id,
            details: {
              orderNumber: order.orderNumber,
              transactionNumber,
              providerTransactionId: transaction_id,
              paymentMethod,
              amount: Number(order.total),
            },
          },
        });
      },
      {
        maxWait: 15000,
        timeout: 25000,
      }
    );

    invalidateDashboardCache();
    return { status: "SUCCESS", message: `Pesanan ${order_id} berhasil diverifikasi dan lunas.` };
  } else if (transaction_status === "expire") {
    // Payment Expired
    await prisma.$transaction(
      async (tx) => {
        await tx.payment.updateMany({
          where: { orderId: order.id, provider: "MIDTRANS" },
          data: { status: PaymentStatus.EXPIRE },
        });
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CANCELLED },
        });
      },
      {
        maxWait: 15000,
        timeout: 25000,
      }
    );
    return { status: "EXPIRED", message: `Pesanan ${order_id} kadaluwarsa.` };
  } else if (transaction_status === "cancel" || transaction_status === "deny") {
    // Payment Cancelled
    await prisma.$transaction(
      async (tx) => {
        await tx.payment.updateMany({
          where: { orderId: order.id, provider: "MIDTRANS" },
          data: { status: PaymentStatus.CANCEL },
        });
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CANCELLED },
        });
      },
      {
        maxWait: 15000,
        timeout: 25000,
      }
    );
    return { status: "CANCELLED", message: `Pesanan ${order_id} dibatalkan.` };
  }

  return { status: "PENDING", message: `Status pesanan ${order_id}: ${transaction_status}.` };
}

/**
 * 4. Development simulation for Midtrans QRIS payment success (Sandbox testing)
 */
export async function simulateDevPaymentSuccess(orderId: string) {
  const session = await requireAuth();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) throw new Error("Pesanan tidak ditemukan.");
  if (order.status === OrderStatus.PAID || order.status === OrderStatus.COMPLETED) {
    return { status: "ALREADY_PAID" };
  }

  const transactionNumber = generateTransactionNumber();
  const now = new Date();

  const result = await prisma.$transaction(
    async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          provider: "MIDTRANS_SIMULATOR",
          providerTransactionId: `sim-${Date.now()}`,
          paymentMethod: PaymentMethod.QRIS,
          amount: order.total,
          status: PaymentStatus.SETTLEMENT,
          paidAt: now,
          rawResponse: { simulated: true, cashier: session.email },
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PAID },
      });

      const transaction = await tx.transaction.create({
        data: {
          transactionNumber,
          orderId: order.id,
          paymentId: payment.id,
          amount: order.total,
          paymentMethod: PaymentMethod.QRIS,
          status: "SUCCESS",
          paidAt: now,
        },
      });

      return {
        order: updatedOrder,
        transaction,
        payment,
      };
    },
    {
      maxWait: 15000,
      timeout: 25000,
    }
  );

  prisma.auditLog
    .create({
      data: {
        userId: session.userId,
        action: "ORDER_PAID_SIMULATION",
        entity: "ORDER",
        entityId: order.id,
        details: {
          orderNumber: order.orderNumber,
          transactionNumber,
          simulatedBy: session.email,
        },
      },
    })
    .catch((err) => console.warn("Failed to create simulation audit log:", err));

  invalidateDashboardCache();
  return result;
}
