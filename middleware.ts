import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/auth";

const PROTECTED_PATHS = ["/generate", "/api/generate-skill"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const hasAccess = request.cookies.get(ACCESS_COOKIE_NAME)?.value === "active";
  if (hasAccess) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Payment required." }, { status: 402 });
  }

  const redirectUrl = new URL("/", request.url);
  redirectUrl.searchParams.set("paywall", "locked");
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/generate/:path*", "/api/generate-skill"]
};
