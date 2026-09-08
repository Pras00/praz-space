import { SignJWT, jwtVerify } from "jose";

export type Role = "OWNER" | "ADMIN" | "CASHIER";

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: Role;
  [key: string]: unknown;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "praz_space_super_secure_auth_secret_key_2026_cafe_system_token"
);

const SESSION_EXPIRATION = "7d"; // 7 days session

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRATION)
    .sign(JWT_SECRET);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
