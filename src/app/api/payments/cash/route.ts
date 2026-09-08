import { NextResponse } from "next/server";
import { processCashPayment } from "@/services/payment.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, cashReceived } = body;

    if (!orderId || typeof cashReceived !== "number") {
      return NextResponse.json(
        { message: "Data pembayaran tunai tidak lengkap." },
        { status: 400 }
      );
    }

    const result = await processCashPayment(orderId, cashReceived);
    return NextResponse.json({
      message: "Pembayaran tunai berhasil diproses",
      ...result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal memproses pembayaran tunai";
    return NextResponse.json({ message }, { status: 400 });
  }
}
