"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, LogOut } from "lucide-react";
import type { AuthenticatedUserResponse } from "@/types/auth";
import { getImagePath } from "@/lib/imageUtils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navItems: NavItem[];
  pathname: string;
  isAuthenticated: boolean;
  user: AuthenticatedUserResponse | null;
  onLogout: () => void;
}

export function MobileMenu({
  open,
  onOpenChange,
  navItems,
  pathname,
  isAuthenticated,
  user,
  onLogout,
}: MobileMenuProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0 flex flex-col">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>

        {navItems.length > 0 && (
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== "/" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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

        <div className="border-t p-4 space-y-2">
          {isAuthenticated ? (
            <>
              <Link
                href="/profile"
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4" />
                    </div>
                  );
                })()}
                <span className="truncate">{user?.email}</span>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={onLogout}
                type="button"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <div className="space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login" onClick={() => onOpenChange(false)}>
                  Login
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/register" onClick={() => onOpenChange(false)}>
                  Register
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
