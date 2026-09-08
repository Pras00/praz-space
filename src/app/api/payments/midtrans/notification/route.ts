import { NextResponse } from "next/server";
import { handleMidtransNotification } from "@/services/payment.service";
import type { MidtransNotificationPayload } from "@/lib/payments/midtrans";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as MidtransNotificationPayload;

    if (!payload.order_id || !payload.signature_key || !payload.status_code) {
      return NextResponse.json(
        { message: "Payload notifikasi tidak lengkap." },
        { status: 400 }
      );
    }

    const result = await handleMidtransNotification(payload);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Webhook processing error";
    console.error("Midtrans Webhook Error:", message);

    if (message.startsWith("INVALID_SIGNATURE")) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    if (message.startsWith("ORDER_NOT_FOUND")) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
