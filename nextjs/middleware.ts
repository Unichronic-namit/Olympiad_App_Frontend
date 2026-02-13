import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/exams",
  "/performance",
  "/profile",
  "/practice",
  "/notes",
];

// Define auth routes that don't require authentication
const authRoutes = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Redirect /exams to /exams?type=syllabus if no type parameter is present
  if (pathname === "/exams" && !searchParams.has("type")) {
    const syllabusUrl = new URL("/exams?type=syllabus", request.url);
    return NextResponse.redirect(syllabusUrl);
  }

  // Redirect /performance to /performance?type=syllabus if no type parameter is present
  if (pathname === "/performance" && !searchParams.has("type")) {
    const syllabusUrl = new URL("/performance?type=syllabus", request.url);
    return NextResponse.redirect(syllabusUrl);
  }

  // Get authentication status from cookies
  const isAuthenticated =
    request.cookies.get("authenticated")?.value === "true";
  const sessionUserId = request.cookies.get("session_userid")?.value;

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  // If accessing protected route without authentication, redirect to login
  if (isProtectedRoute && !isAuthenticated && !sessionUserId) {
    const loginUrl = new URL("/login", request.url);
    // Add the current path as a redirect parameter
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated user tries to access login/signup, redirect to dashboard
  if (isAuthRoute && isAuthenticated && sessionUserId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
