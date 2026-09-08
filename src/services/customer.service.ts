import { prisma } from "@/lib/db/prisma";

export async function getCustomers(search?: string) {
  return prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
    take: 50,
  });
}

export async function createQuickCustomer(data: {
  name: string;
  phone?: string;
  email?: string;
}) {
  return prisma.customer.create({
    data: {
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
    },
  });
}
