import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/apiRoutes";

export interface DashboardStats {
  totalBookings: number;
  totalFlights: number;
  totalUsers: number;
  totalRevenue: number;
}

export const AdminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const { data } = await apiClient.get(API_ROUTES.admin.stats);
      // Map snake_case API response to camelCase interface
      return {
        totalBookings: data.total_bookings ?? 0,
        totalFlights: data.total_flights ?? 0,
        totalUsers: data.total_users ?? 0,
        totalRevenue: data.total_revenue ?? 0,
      };
    } catch (error) {
      console.warn("Admin stats endpoint not available, using mock data");
      return {
        totalBookings: 0,
        totalFlights: 0,
        totalUsers: 0,
        totalRevenue: 0,
      };
    }
  },
};
