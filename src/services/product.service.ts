import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/permissions/rbac";
import type { ProductInput } from "@/lib/validations/product";
import { Prisma } from "@prisma/client";

export interface ProductFilterOptions {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export async function getProducts(options: ProductFilterOptions = {}) {
  const { search, categoryId, isActive, page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(categoryId && categoryId !== "all" ? { categoryId } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { orderItems: true },
        },
      },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
}

export async function createProduct(input: ProductInput) {
  const currentSession = await requireRole(["OWNER", "ADMIN"]);

  const existingSlug = await prisma.product.findUnique({
    where: { slug: input.slug.toLowerCase().trim() },
  });

  if (existingSlug) {
    throw new Error(`Menu dengan slug '${input.slug}' sudah ada.`);
  }

  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
  });

  if (!category) {
    throw new Error("Kategori yang dipilih tidak valid.");
  }

  const product = await prisma.product.create({
    data: {
      name: input.name.trim(),
      slug: input.slug.toLowerCase().trim(),
      description: input.description?.trim() || null,
      price: new Prisma.Decimal(input.price),
      imageUrl: input.imageUrl?.trim() || null,
      categoryId: input.categoryId,
      isActive: input.isActive ?? true,
    },
    include: {
      category: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: currentSession.userId,
      action: "PRODUCT_CREATED",
      entity: "PRODUCT",
      entityId: product.id,
      details: {
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        category: product.category.name,
        createdBy: currentSession.email,
      },
    },
  });

  return product;
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const currentSession = await requireRole(["OWNER", "ADMIN"]);

  const currentProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!currentProduct) {
    throw new Error("Produk tidak ditemukan.");
  }

  if (input.slug) {
    const existingSlug = await prisma.product.findFirst({
      where: {
        slug: input.slug.toLowerCase().trim(),
        id: { not: id },
      },
    });

    if (existingSlug) {
      throw new Error(`Slug '${input.slug}' sudah digunakan oleh produk lain.`);
    }
  }

  const isPriceChanged =
    input.price !== undefined &&
    Number(currentProduct.price) !== Number(input.price);

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.slug ? { slug: input.slug.toLowerCase().trim() } : {}),
      ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
      ...(input.price !== undefined ? { price: new Prisma.Decimal(input.price) } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl?.trim() || null } : {}),
      ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
    include: {
      category: true,
    },
  });

  // Track price change in audit log explicitly
  if (isPriceChanged) {
    await prisma.auditLog.create({
      data: {
        userId: currentSession.userId,
        action: "PRODUCT_PRICE_CHANGED",
        entity: "PRODUCT",
        entityId: id,
        details: {
          productName: updated.name,
          oldPrice: Number(currentProduct.price),
          newPrice: Number(updated.price),
          updatedBy: currentSession.email,
        },
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: currentSession.userId,
      action: "PRODUCT_UPDATED",
      entity: "PRODUCT",
      entityId: id,
      details: {
        changes: input,
        updatedBy: currentSession.email,
      },
    },
  });

  return updated;
}

export async function toggleProductAvailability(id: string, isActive: boolean) {
  const currentSession = await requireRole(["OWNER", "ADMIN"]);

  const updated = await prisma.product.update({
    where: { id },
    data: { isActive },
    include: { category: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: currentSession.userId,
      action: isActive ? "PRODUCT_ACTIVATED" : "PRODUCT_DEACTIVATED",
      entity: "PRODUCT",
      entityId: id,
      details: {
        productName: updated.name,
        newStatus: isActive ? "AVAILABLE" : "UNAVAILABLE",
        updatedBy: currentSession.email,
      },
    },
  });

  return updated;
}

export async function archiveProduct(id: string) {
  // Soft delete to protect historical order items!
  return toggleProductAvailability(id, false);
}
