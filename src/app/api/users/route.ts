import { NextResponse } from "next/server";
import {
  getStaffUsers,
  createStaffUser,
  toggleUserActiveStatus,
  updateUserRole,
  updateStaffUser,
} from "@/services/user.service";
import {
  createUserSchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
  updateUserSchema,
} from "@/lib/validations/user";
import { getSession, setSessionCookie } from "@/lib/auth/session";

export async function GET() {
  try {
    const users = await getStaffUsers();
    return NextResponse.json({ users });
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Data pengguna tidak valid",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const newUser = await createStaffUser(parsed.data);
    return NextResponse.json(
      { message: "Pengguna berhasil ditambahkan", user: newUser },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menambahkan pengguna";
    const status = message.startsWith("UNAUTHORIZED")
      ? 401
      : message.startsWith("FORBIDDEN")
      ? 403
      : 400;
    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    if ("name" in body || "email" in body || "password" in body) {
      const parsed = updateUserSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            message: "Data pembaruan staf tidak valid",
            errors: parsed.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }
      const updated = await updateStaffUser(parsed.data);

      // If the current logged-in user edited their own profile, refresh session cookie
      try {
        const currentSession = await getSession();
        if (currentSession && currentSession.userId === updated.id) {
          await setSessionCookie({
            userId: updated.id,
            email: updated.email,
            name: updated.name,
            role: updated.role,
          });
        }
      } catch (cookieErr) {
        console.warn("Could not refresh session cookie:", cookieErr);
      }

      return NextResponse.json({
        message: "Data staf berhasil diperbarui",
        user: updated,
      });
    }

    if ("isActive" in body) {
      const parsed = updateUserStatusSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { message: "Data status tidak valid" },
          { status: 400 }
        );
      }
      const updated = await toggleUserActiveStatus(
        parsed.data.userId,
        parsed.data.isActive
      );
      return NextResponse.json({
        message: "Status pengguna berhasil diperbarui",
        user: updated,
      });
    }

    if ("role" in body) {
      const parsed = updateUserRoleSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { message: "Data peran tidak valid" },
          { status: 400 }
        );
      }
      const updated = await updateUserRole(
        parsed.data.userId,
        parsed.data.role
      );
      return NextResponse.json({
        message: "Peran pengguna berhasil diperbarui",
        user: updated,
      });
    }

    return NextResponse.json(
      { message: "Aksi tidak dikenali" },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui pengguna";
    const status = message.startsWith("UNAUTHORIZED")
      ? 401
      : message.startsWith("FORBIDDEN")
      ? 403
      : 400;
    return NextResponse.json({ message }, { status });
  }
}
