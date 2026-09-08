import { NextResponse } from "next/server";
import { getCategoryPerformance } from "@/services/report.service";

export async function GET() {
  try {
    const performance = await getCategoryPerformance();
    return NextResponse.json({ categories: performance });
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
