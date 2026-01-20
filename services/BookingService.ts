import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/apiRoutes";
import { Booking, BookingResponse } from "@/types/booking";
import { PaginationParams } from "@/types/PaginationParams";

export const BookingService = {
  /**
   * Get user's bookings
   * GET /api/bookings
   */
  async getUserBookings(params?: PaginationParams): Promise<BookingResponse> {
    const { data } = await apiClient.get(API_ROUTES.bookings.base, {
      params,
    });
    return data;
  },

  /**
   * Get booking by ID
   * GET /api/bookings/{bookingId}
   */
  async getBookingById(bookingId: number | string): Promise<Booking> {
    const { data } = await apiClient.get(API_ROUTES.bookings.byId(bookingId));
    return data;
  },
};
