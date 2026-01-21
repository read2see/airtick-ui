import { AuthenticatedUserResponse } from "@/types/auth";

/**
 * User roles in the system
 */
export type UserRole = "ADMIN" | "CUSTOMER";

/**
 * Check if a user has a specific role
 */
export function hasRole(user: AuthenticatedUserResponse | null, role: UserRole): boolean {
  return user?.role === role;
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: AuthenticatedUserResponse | null): boolean {
  return hasRole(user, "ADMIN");
}

/**
 * Check if a user is a customer
 */
export function isCustomer(user: AuthenticatedUserResponse | null): boolean {
  return hasRole(user, "CUSTOMER");
}

/**
 * Check if a user is authenticated
 */
export function isAuthenticated(user: AuthenticatedUserResponse | null): boolean {
  return user !== null;
}

/**
 * Get the default redirect path for a user based on their role
 */
export function getDefaultRedirectPath(role: UserRole | undefined): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "CUSTOMER":
      return "/browse-flights";
    default:
      return "/";
  }
}

/**
 * Validate if a redirect path is safe and appropriate for a user role
 * Prevents open redirects and ensures role-based access
 */
export function isValidRedirectPath(
  path: string | null | undefined,
  userRole: UserRole | undefined
): boolean {
  if (!path) return false;

  // Prevent open redirects - only allow relative paths
  if (!path.startsWith("/")) return false;

  // Prevent redirects to auth pages after login
  const authPages = ["/login", "/register", "/forgot-password", "/resend-verification", "/reset-password"];
  if (authPages.some((page) => path.startsWith(page))) return false;

  // Validate role-based access
  if (path.startsWith("/admin") && userRole !== "ADMIN") return false;
  if (path.startsWith("/customer") && userRole !== "CUSTOMER") return false;

  return true;
}

/**
 * Get the appropriate redirect path for a user after login
 * Uses the provided redirect if valid, otherwise falls back to default
 */
export function getRedirectPath(
  redirectParam: string | null | undefined,
  userRole: UserRole | undefined
): string {
  if (isValidRedirectPath(redirectParam, userRole)) {
    return redirectParam!;
  }
  return getDefaultRedirectPath(userRole);
}
