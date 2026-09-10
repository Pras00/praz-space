import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ||
    "praz_space_super_secure_auth_secret_key_2026_cafe_system_token"
);

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/payments/midtrans/notification",
  "/favicon.ico",
];

const OWNER_ONLY_PATHS = ["/users", "/settings"];
const MANAGEMENT_PATHS = ["/dashboard", "/reports", "/products", "/categories", "/transactions"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static Next.js assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons")
  ) {
    return NextResponse.next();
  }

  // If already authenticated and trying to access /login, redirect directly to dashboard or pos
  if (pathname === "/login") {
    const token = request.cookies.get("praz_space_session")?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = (payload.role as string) || "CASHIER";
        return NextResponse.redirect(
          new URL(role === "CASHIER" ? "/pos" : "/dashboard", request.url)
        );
      } catch {
        // Token invalid, allow accessing login page
      }
    }
    return NextResponse.next();
  }

  // Public API paths
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("praz_space_session")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = (payload.role as string) || "CASHIER";

    // Enforce role restrictions
    if (OWNER_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
      if (role !== "OWNER") {
        return NextResponse.redirect(new URL("/pos", request.url));
      }
    }

    if (MANAGEMENT_PATHS.some((path) => pathname.startsWith(path))) {
      if (role !== "OWNER" && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/pos", request.url));
      }
    }

    return NextResponse.next();
  } catch {
    // Invalid or expired token
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("praz_space_session");
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/payments/midtrans/notification (handled in condition)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
