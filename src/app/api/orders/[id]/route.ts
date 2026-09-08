import { NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/services/order.service";
import type { OrderStatus } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json(
        { message: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan";
    const status = message.startsWith("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { message: "Status pesanan wajib disertakan" },
        { status: 400 }
      );
    }

    const updated = await updateOrderStatus(id, status as OrderStatus);
    return NextResponse.json({
      message: "Status pesanan berhasil diperbarui",
      order: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui status";
    const status = message.startsWith("UNAUTHORIZED")
      ? 401
      : message.startsWith("FORBIDDEN")
      ? 403
      : 400;
    return NextResponse.json({ message }, { status });
  }
}
