"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./MobileMenu";
import { Menu, User, LogOut, Plane, LayoutDashboard, Ticket, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { getImagePath } from "@/lib/imageUtils";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
  roles?: ("ADMIN" | "CUSTOMER")[];
}

const publicNavItems: NavItem[] = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
];

const authenticatedNavItems: NavItem[] = [
  {
    title: "My Bookings",
    href: "/customer/bookings",
    icon: Ticket,
    requiresAuth: true,
    roles: ["CUSTOMER"],
  },
  {
    title: "Browse Flights",
    href: "/browse-flights",
    icon: Plane,
    requiresAuth: true,
    roles: ["CUSTOMER"],
  },
  {
    title: "Admin Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    requiresAuth: true,
    roles: ["ADMIN"],
  },
];

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout, isAdmin, isCustomer } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdminPage = pathname.startsWith("/admin");

  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Filter navigation items based on auth status and role
  // Guests (unauthenticated users) see no navigation items, only Login/Register
  // On admin pages, show minimal navigation since admin sidebar handles admin nav
  const getNavItems = () => {
    // Guests see no navigation items
    if (!isAuthenticated) {
      return [];
    }
    
    const items: NavItem[] = [];
    
    // On admin pages, only show home link
    if (isAdminPage) {
      items.push(...publicNavItems);
      return items;
    }
    
    // On other pages, show full navigation for authenticated users
    items.push(...publicNavItems);
    
    authenticatedNavItems.forEach((item) => {
      if (item.requiresAuth) {
        if (!item.roles || item.roles.length === 0) {
          items.push(item);
        } else if (item.roles.includes("ADMIN") && isAdmin()) {
          items.push(item);
        } else if (item.roles.includes("CUSTOMER") && isCustomer()) {
          items.push(item);
        }
      }
    });
    
    return items;
  };

  const navItems = useMemo(() => getNavItems(), [isAuthenticated, isAdminPage, isAdmin, isCustomer]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-2">
            <Plane className="h-6 w-6" />
            <span className="text-xl font-semibold">AirTick</span>
          </Link>

          {/* Desktop Navigation - Only show for authenticated users */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.href !== "/" && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === "/profile"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {(() => {
                    const imageUrl = getImagePath(user?.profile_img);
                    return imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={user.email || "Profile"}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4" />
                    </div>
                    );
                  })()}
                  <span className="text-sm">{user?.email}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button - Show for all users except on admin pages */}
          {!isAdminPage && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </header>

      {/* Mobile Menu - Show for all users on non-admin pages */}
      {!isAdminPage && (
        <MobileMenu
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
          navItems={navItems}
          pathname={pathname}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
