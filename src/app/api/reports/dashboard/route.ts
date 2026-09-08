import { NextResponse } from "next/server";
import { getDashboardMetrics } from "@/services/report.service";

export async function GET() {
  try {
    const metrics = await getDashboardMetrics();
    return NextResponse.json(metrics);
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
