import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/apiRoutes";

export interface DashboardStats {
  totalBookings: number;
  totalFlights: number;
  totalUsers: number;
  totalRevenue: number;
}

export const AdminService = {
  /**
   * Get dashboard statistics
   * GET /api/admin/stats (or similar endpoint)
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const { data } = await apiClient.get(API_ROUTES.admin.stats);
      return data;
    } catch (error) {
      // If endpoint doesn't exist yet, return mock data
      // This allows the UI to work while the backend is being developed
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
