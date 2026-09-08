import { NextResponse } from "next/server";
import { initiateMidtransPayment } from "@/services/payment.service";

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

    const snapData = await initiateMidtransPayment(orderId);
    return NextResponse.json(snapData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menginisiasi pembayaran Midtrans";
    return NextResponse.json({ message }, { status: 400 });
  }
}
