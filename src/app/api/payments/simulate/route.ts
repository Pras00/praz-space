import { NextResponse } from "next/server";
import { simulateDevPaymentSuccess } from "@/services/payment.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { message: "ID pesanan wajib disertakan." },
        { status: 400 }
      );
    }

    const result = await simulateDevPaymentSuccess(orderId);
    return NextResponse.json({
      message: "Simulasi pembayaran Midtrans berhasil diselesaikan.",
      ...result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal simulasi pembayaran";
    return NextResponse.json({ message }, { status: 400 });
  }
}
