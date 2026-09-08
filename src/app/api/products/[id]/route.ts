import { NextResponse } from "next/server";
import {
  getProductById,
  updateProduct,
  archiveProduct,
  toggleProductAvailability,
} from "@/services/product.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (Object.keys(body).length === 1 && "isActive" in body) {
      const updated = await toggleProductAvailability(id, body.isActive);
      return NextResponse.json({
        message: "Ketersediaan menu berhasil diperbarui",
        product: updated,
      });
    }

    const updated = await updateProduct(id, body);
    return NextResponse.json({
      message: "Menu berhasil diperbarui",
      product: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui menu";
    const status = message.startsWith("UNAUTHORIZED")
      ? 401
      : message.startsWith("FORBIDDEN")
      ? 403
      : 400;
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const archived = await archiveProduct(id);
    return NextResponse.json({
      message: "Menu berhasil diarsipkan (soft-deleted)",
      product: archived,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal mengarsipkan menu";
    const status = message.startsWith("UNAUTHORIZED")
      ? 401
      : message.startsWith("FORBIDDEN")
      ? 403
      : 400;
    return NextResponse.json({ message }, { status });
  }
}
