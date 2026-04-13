import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "ds-session";
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const PROTECTED_PATTERNS = [
  "/dashboard",
  "/admin",
  "/auth/setup-account/method",
  "/auth/setup-account/additional",
];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PATTERNS.some(
    (pattern) => pathname === pattern || pathname.startsWith(`${pattern}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  if (DEMO_MODE) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE_NAME);

  if (session?.value) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admissions/login", request.url);
  loginUrl.searchParams.set("returnTo", pathname + request.nextUrl.search);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/auth/setup-account/method",
    "/auth/setup-account/additional",
  ],
};
