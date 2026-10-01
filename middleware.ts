import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "smartscribe_auth_token";
const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "smartscribe_super_secret_clinical_jwt_key_2026";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

// Public paths that require NO authentication
const PUBLIC_PATHS = ["/login", "/register", "/api/auth"];

// Role-to-home mapping
const ROLE_HOME: Record<string, string> = {
  doctor: "/",
  patient: "/patient/dashboard",
  admin: "/admin/dashboard",
};

// Paths each role is NOT allowed to visit
const ROLE_BLOCKED: Record<string, string[]> = {
  patient: ["/", "/consultation/new", "/admin"],
  doctor: ["/admin", "/patient"],
  admin: ["/patient"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow public auth API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const isPublicPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  const token = req.cookies.get(COOKIE_NAME)?.value;

  // ── If user visits a public page (login/register) ──
  if (isPublicPage) {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = (payload.role as string) || "doctor";
        // Already authenticated → redirect to their home
        return NextResponse.redirect(new URL(ROLE_HOME[role] || "/", req.url));
      } catch {
        // Invalid token → let them through to login/register
      }
    }
    return NextResponse.next();
  }

  // ── All other pages require authentication ──
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = (payload.role as string) || "doctor";
    const blocked = ROLE_BLOCKED[role] || [];

    // Check if this path is blocked for this role
    const isBlocked = blocked.some((blockedPath) =>
      pathname === blockedPath || pathname.startsWith(blockedPath + "/")
    );

    if (isBlocked) {
      return NextResponse.redirect(new URL(ROLE_HOME[role] || "/", req.url));
    }

    return NextResponse.next();
  } catch {
    // Token expired or tampered → clear and redirect to login
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.set({
      name: COOKIE_NAME,
      value: "",
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
