import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/apiRoutes";
import { Booking, BookingResponse } from "@/types/booking";
import { PaginationParams } from "@/types/PaginationParams";

export interface CreateBookingRequest {
  flightId: number;
  status?: "CONFIRMED" | "PENDING" | "CANCELLED";
}

export interface BookingResponseData {
  id: number;
  userId: number;
  status: string;
  flightId: number;
  bookedAt: string;
  updatedAt: string;
}

export interface UpdateBookingRequest {
  flightId: number;
  status?: "CONFIRMED" | "PENDING" | "CANCELLED";
}

export const BookingService = {
  /**
   * Create a new booking
   * POST /api/bookings
   */
  async createBooking(payload: CreateBookingRequest): Promise<BookingResponseData> {
    const requestPayload = {
      flight_id: payload.flightId,
      status: payload.status,
    };
    const { data } = await apiClient.post(API_ROUTES.bookings.base, requestPayload);
    return data;
  },

  /**
   * Update booking status
   * PUT /api/bookings/{bookingId}
   */
  async updateBooking(
    bookingId: number | string,
    payload: UpdateBookingRequest
  ): Promise<BookingResponseData> {
    const requestPayload = {
      flight_id: payload.flightId,
      status: payload.status,
    };
    const { data } = await apiClient.put(API_ROUTES.bookings.byId(bookingId), requestPayload);
    return data;
  },

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
    // Normalize response to handle both snake_case and camelCase
    return {
      ...data,
      flightId: data.flightId ?? data.flight_id,
      bookingDate: data.bookingDate ?? data.booked_at ?? data.bookedAt,
      status: data.status ?? "PENDING",
    };
  },
};
