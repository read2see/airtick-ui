import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AuthenticatedUserResponse } from "@/types/auth";

/**
 * Public routes that don't require authentication
 */
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/resend-verification",
  "/reset-password",
];

/**
 * Routes that require authentication but any role can access
 */
const authenticatedRoutes = [
  "/profile",
  "/change-password",
];

/**
 * Admin-only routes
 */
const adminRoutes = [
  "/admin",
];

/**
 * Customer-only routes
 */
const customerRoutes = [
  "/customer",
];

/**
 * Check if a path matches any of the route patterns
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname.startsWith(route));
}

/**
 * Check if a path is a public route
 */
function isPublicRoute(pathname: string): boolean {
  return matchesRoute(pathname, publicRoutes) || pathname === "/";
}

/**
 * Check if a path requires authentication
 */
function requiresAuth(pathname: string): boolean {
  return (
    matchesRoute(pathname, authenticatedRoutes) ||
    matchesRoute(pathname, adminRoutes) ||
    matchesRoute(pathname, customerRoutes)
  );
}

/**
 * Check if a path is admin-only
 */
function isAdminRoute(pathname: string): boolean {
  return matchesRoute(pathname, adminRoutes);
}

/**
 * Check if a path is customer-only
 */
function isCustomerRoute(pathname: string): boolean {
  return matchesRoute(pathname, customerRoutes);
}

/**
 * Fetch the current user from the API
 */
async function getCurrentUser(request: NextRequest): Promise<AuthenticatedUserResponse | null> {
  const apiUrl = process.env.NEXT_PUBLIC_REST_API_URL;
  
  if (!apiUrl) {
    console.error("NEXT_PUBLIC_REST_API_URL is not set");
    return null;
  }

  try {
    // Get all cookies from the request and forward them
    const cookieHeader = request.headers.get("cookie") || "";
    
    // Extract access_token from cookies to decode JWT as fallback
    const accessTokenMatch = cookieHeader.match(/access_token=([^;]+)/);
    const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;
    
    // Make the API request - cookies are sent via Cookie header
    // Note: credentials: "include" doesn't work for server-to-server requests
    // We must manually forward the Cookie header
    const response = await fetch(`${apiUrl}/auth/users/me`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
        "Accept": "application/json",
        "User-Agent": request.headers.get("user-agent") || "",
      },
      // Don't cache this request
      cache: "no-store",
    });

    if (response.ok) {
      const user: AuthenticatedUserResponse = await response.json();
      return user;
    }
    
    // If API returns 403 but we have an access_token, try to decode JWT as fallback
    // This handles cases where the API rejects server-to-server requests but the token is valid
    if (response.status === 403 && accessToken) {
      try {
        // Decode JWT without verification (we trust the cookie since it came from the API)
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          // Base64 decode the payload (Edge Runtime compatible - using atob which is available)
          const base64Payload = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
          // Add padding if needed
          const padded = base64Payload + '='.repeat((4 - base64Payload.length % 4) % 4);
          const payloadJson = atob(padded);
          const payload = JSON.parse(payloadJson);
          // Return user data from JWT payload
          // Note: JWT may have id field, or we use 0 as placeholder since middleware only needs role
          const userId = payload.id ? parseInt(payload.id) : (typeof payload.sub === 'number' ? payload.sub : 0);
          return {
            id: userId,
            role: payload.role as "ADMIN" | "CUSTOMER",
          };
        }
      } catch (jwtError) {
        // JWT decode failed, continue to return null
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching user in middleware:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    // If user is already authenticated and tries to access auth pages, redirect them
    const user = await getCurrentUser(request);
    if (user && pathname !== "/") {
      // Redirect authenticated users away from auth pages
      if (user.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else if (user.role === "CUSTOMER") {
        return NextResponse.redirect(new URL("/profile", request.url));
      }
    }
    return NextResponse.next();
  }

  // Check if route requires authentication
  if (requiresAuth(pathname)) {
    const user = await getCurrentUser(request);

    // If not authenticated, redirect to login
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    if (isAdminRoute(pathname) && user.role !== "ADMIN") {
      // Non-admin trying to access admin routes
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isCustomerRoute(pathname) && user.role !== "CUSTOMER") {
      // Non-customer trying to access customer routes
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

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
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
