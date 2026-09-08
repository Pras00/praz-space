import { NextResponse } from "next/server";
import { getAllCategories, createCategory } from "@/services/category.service";
import { categorySchema } from "@/lib/validations/product";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";
    const categories = await getAllCategories(!activeOnly);
    return NextResponse.json({ categories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Data kategori tidak valid",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const category = await createCategory(parsed.data);
    return NextResponse.json(
      { message: "Kategori berhasil dibuat", category },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal membuat kategori";
    const status = message.startsWith("UNAUTHORIZED")
      ? 401
      : message.startsWith("FORBIDDEN")
      ? 403
      : 400;
    return NextResponse.json({ message }, { status });
  }
}
