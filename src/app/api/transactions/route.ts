import { NextResponse } from "next/server";
import { getTransactions } from "@/services/transaction.service";
import type { PaymentMethod } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const methodParam = searchParams.get("paymentMethod");
    const paymentMethod = methodParam as PaymentMethod | "ALL" | undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const result = await getTransactions({ search, paymentMethod, page, limit });
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan";
    const status = message.startsWith("UNAUTHORIZED")
      ? 401
      : message.startsWith("FORBIDDEN")
      ? 403
      : 500;
    return NextResponse.json({ message }, { status });
  }
}
