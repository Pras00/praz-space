import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Data yang dimasukkan tidak valid",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Direct Supabase lookup
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Email atau kata sandi tidak sesuai" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { message: "Akun ini telah dinonaktifkan. Hubungi pemilik cafe." },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { message: "Email atau kata sandi tidak sesuai" },
        { status: 401 }
      );
    }

    // Set secure HTTP-only cookie with JWT
    await setSessionCookie({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Create Audit Log for successful login
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "USER_LOGIN_SUCCESS",
          entity: "USER",
          entityId: user.id,
          details: {
            email: user.email,
            role: user.role,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (auditError) {
      console.warn("Failed to create login audit log:", auditError);
    }

    return NextResponse.json({
      message: "Berhasil masuk",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}
