import { NextResponse } from "next/server";
import { updateCategory } from "@/services/category.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateCategory(id, body);
    return NextResponse.json({
      message: "Kategori berhasil diperbarui",
      category: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui kategori";
    const status = message.startsWith("UNAUTHORIZED")
      ? 401
      : message.startsWith("FORBIDDEN")
      ? 403
      : 400;
    return NextResponse.json({ message }, { status });
  }
}
