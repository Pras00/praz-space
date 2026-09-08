import { NextResponse } from "next/server";
import { getCustomers, createQuickCustomer } from "@/services/customer.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const customers = await getCustomers(search);
    return NextResponse.json({ customers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || body.name.trim().length < 2) {
      return NextResponse.json(
        { message: "Nama pelanggan minimal 2 karakter" },
        { status: 400 }
      );
    }
    const customer = await createQuickCustomer(body);
    return NextResponse.json(
      { message: "Pelanggan berhasil didaftarkan", customer },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal mendaftarkan pelanggan";
    return NextResponse.json({ message }, { status: 400 });
  }
}
