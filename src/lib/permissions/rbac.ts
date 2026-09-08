import { getSession } from "@/lib/auth/session";
import type { Role, SessionPayload } from "@/lib/auth/jwt";

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: Sesi tidak ditemukan atau telah berakhir.");
  }
  return session;
}

export async function requireRole(allowedRoles: Role[]): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    throw new Error(
      `FORBIDDEN: Peran ${session.role} tidak memiliki hak akses untuk tindakan ini.`
    );
  }
  return session;
}

export function canAccessManagement(role: Role): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canAccessSystemSettings(role: Role): boolean {
  return role === "OWNER";
}

export function canManageUsers(role: Role): boolean {
  return role === "OWNER";
}

export function canAccessPOS(role: Role): boolean {
  return ["OWNER", "ADMIN", "CASHIER"].includes(role);
}
