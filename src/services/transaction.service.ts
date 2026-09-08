import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/permissions/rbac";
import { PaymentMethod, Prisma } from "@prisma/client";

export interface TransactionFilterOptions {
  search?: string;
  paymentMethod?: PaymentMethod | "ALL";
  page?: number;
  limit?: number;
}

export async function getTransactions(options: TransactionFilterOptions = {}) {
  await requireAuth();

  const { search, paymentMethod, page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  const where: Prisma.TransactionWhereInput = {
    ...(search
      ? {
          OR: [
            { transactionNumber: { contains: search, mode: "insensitive" } },
            { order: { orderNumber: { contains: search, mode: "insensitive" } } },
            { order: { customer: { name: { contains: search, mode: "insensitive" } } } },
          ],
        }
      : {}),
    ...(paymentMethod && paymentMethod !== "ALL" ? { paymentMethod } : {}),
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        order: {
          include: {
            customer: true,
            cashier: { select: { id: true, name: true, email: true } },
            items: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getTransactionById(id: string) {
  await requireAuth();

  return prisma.transaction.findFirst({
    where: {
      OR: [{ id }, { transactionNumber: id }],
    },
    include: {
      order: {
        include: {
          customer: true,
          cashier: { select: { id: true, name: true, email: true } },
          items: true,
        },
      },
      payment: true,
    },
  });
}
