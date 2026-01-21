"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex flex-col items-center justify-center gap-8 px-4 py-16">
        <Image
          src="/airtick.svg"
          alt="AirTick logo"
          width={200}
          height={200}
          priority
          className="w-48 h-48 sm:w-56 sm:h-56"
        />
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            AirTick
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Book a Barebones Flight
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <Link href="/browse-flights" className="w-full">
            <Button size="lg" className="w-full border-2 border-primary bg-primary hover:bg-primary/90 font-semibold ring-2 ring-primary/50 ring-offset-2 ring-offset-background">
              Browse Flights
            </Button>
          </Link>
          {!isAuthenticated && (
            <div className="flex gap-3 w-full">
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button variant="outline" className="w-full">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
