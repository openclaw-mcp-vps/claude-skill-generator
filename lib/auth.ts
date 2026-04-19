import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const ACCESS_COOKIE_NAME = "csg_paid";
const ACCESS_COOKIE_VALUE = "active";

export function hasPaidAccess(request: NextRequest): boolean {
  return request.cookies.get(ACCESS_COOKIE_NAME)?.value === ACCESS_COOKIE_VALUE;
}

export function attachPaidCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: ACCESS_COOKIE_VALUE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 31
  });
  return response;
}

export function clearPaidCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return response;
}
