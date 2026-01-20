"use client";

import { useEffect, useState, useCallback } from "react";
import { StatsCard } from "@/components/admin/StatsCard";
import { AdminService, DashboardStats } from "@/services/AdminService";
import { Ticket, Plane, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";

// Move formatCurrency outside component to prevent recreation on every render
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    // Prevent multiple fetches
    if (hasFetched) {
      return;
    }

    async function fetchStats() {
      try {
        setLoading(true);
        setHasFetched(true);
        const data = await AdminService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [hasFetched]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome to the admin dashboard
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border bg-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your flight booking system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Bookings"
          value={stats?.totalBookings ?? 0}
          icon={Ticket}
          description="All time bookings"
        />
        <StatsCard
          title="Total Flights"
          value={stats?.totalFlights ?? 0}
          icon={Plane}
          description="Active flights"
        />
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          description="Registered users"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          icon={DollarSign}
          description="All time revenue"
        />
      </div>
    </div>
  );
}
