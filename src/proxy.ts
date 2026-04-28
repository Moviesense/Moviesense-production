import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authRoutes = ["/login", "/signup"];
const publicRoutes = ["/home", "/search"];
const protectedRoutes = ["/profile", "/watchlist", "/downloads"];

function normalizePath(path: string): string {
  const trimmed = path.trim();
  return trimmed.endsWith("/") && trimmed.length > 1
    ? trimmed.slice(0, -1)
    : trimmed;
}

function isAuthPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return authRoutes.some(
    (route) => path === route || path.startsWith(route + "/"),
  );
}

function isProtectedPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return protectedRoutes.some(
    (route) => path === route || path.startsWith(route + "/"),
  );
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  const isAuthRoute = isAuthPath(pathname);
  const isProtectedRoute = isProtectedPath(pathname);

  // If authenticated and trying to access auth routes, redirect to home
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // If not authenticated and trying to access protected routes, redirect to login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|manifest.json|icon.png).*)",
  ],
};
