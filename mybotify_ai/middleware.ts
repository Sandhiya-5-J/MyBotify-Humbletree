import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Edge Middleware for route protection.
 *
 * This runs BEFORE any page renders. If a user tries to access a protected
 * route without a valid token cookie, they are instantly redirected to the
 * home page — no page bundle is downloaded, no flash of loading UI.
 *
 * Public routes (home, signup, about-us) are always accessible.
 */

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/account",
  "/admin",
  "/chat",
  "/analytics",
  "/campaign",
  "/domain",
  "/store",
  "/website",
  "/profile",
];

// Routes that should redirect to /account if the user IS logged in
const AUTH_ROUTES = ["/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("mybotify_token")?.value;

  // Check if the current path matches a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Check if the current path is an auth route (signup/login pages)
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // If accessing a protected route without a token, redirect to home
  if (isProtectedRoute && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // If already logged in and trying to access signup, redirect to account
  if (isAuthRoute && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/account";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Only run middleware on page routes, not on API routes, static files, etc.
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.ico$).*)",
  ],
};
