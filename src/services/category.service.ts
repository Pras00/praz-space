import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/permissions/rbac";
import type { CategoryInput } from "@/lib/validations/product";

export async function getAllCategories(includeInactive: boolean = true) {
  return prisma.category.findMany({
    where: includeInactive ? undefined : { isActive: true },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(input: CategoryInput) {
  const currentSession = await requireRole(["OWNER", "ADMIN"]);

  const existing = await prisma.category.findUnique({
    where: { slug: input.slug.toLowerCase().trim() },
  });

  if (existing) {
    throw new Error(`Kategori dengan slug '${input.slug}' sudah ada.`);
  }

  const category = await prisma.category.create({
    data: {
      name: input.name.trim(),
      slug: input.slug.toLowerCase().trim(),
      isActive: input.isActive ?? true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: currentSession.userId,
      action: "CATEGORY_CREATED",
      entity: "CATEGORY",
      entityId: category.id,
      details: {
        name: category.name,
        slug: category.slug,
        createdBy: currentSession.email,
      },
    },
  });

  return category;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  const currentSession = await requireRole(["OWNER", "ADMIN"]);

  if (input.slug) {
    const existing = await prisma.category.findFirst({
      where: {
        slug: input.slug.toLowerCase().trim(),
        id: { not: id },
      },
    });

    if (existing) {
      throw new Error(`Slug '${input.slug}' sudah digunakan oleh kategori lain.`);
    }
  }

  const updated = await prisma.category.update({
    where: { id },
    data: {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.slug ? { slug: input.slug.toLowerCase().trim() } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: currentSession.userId,
      action: "CATEGORY_UPDATED",
      entity: "CATEGORY",
      entityId: updated.id,
      details: {
        changes: input,
        updatedBy: currentSession.email,
      },
    },
  });

  return updated;
}
