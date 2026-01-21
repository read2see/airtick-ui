import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/apiRoutes";
import { Booking, BookingResponse } from "@/types/booking";
import { PaginationParams } from "@/types/PaginationParams";
import { PaginatedResponse } from "@/types/pagination";

export interface CreateBookingRequest {
  flight_id: number;
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

export type UpdateBookingRequest = CreateBookingRequest;

export const BookingService = {
  /**
   * Create a new booking
   * POST /api/bookings
   */
  async createBooking(payload: CreateBookingRequest): Promise<BookingResponseData> {
    const { data } = await apiClient.post(API_ROUTES.bookings.base, payload);
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
    const { data } = await apiClient.put(API_ROUTES.bookings.byId(bookingId), payload);
    return data;
  },

  /**
   * Get user's bookings with pagination
   * GET /api/bookings
   */
  async getUserBookings(params?: PaginationParams): Promise<PaginatedResponse<Booking>> {
    const response = await apiClient.get(API_ROUTES.bookings.base, {
      params,
    });
    const data = response.data;

    if (data && typeof data === "object" && !Array.isArray(data)) {
      if (data.data && Array.isArray(data.data)) {
        return {
          data: data.data,
          meta: data.meta || {
            currentPage: 0,
            perPage: 10,
            total: data.data.length,
            totalPages: 1,
            nextPage: null,
            prevPage: null,
          },
        };
      }
      if (data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
        const bookingsArray = Object.values(data.data).filter(
          (item): item is Booking => typeof item === "object" && item !== null && "id" in item
        ) as Booking[];
        return {
          data: bookingsArray,
          meta: data.meta || {
            currentPage: 0,
            perPage: 10,
            total: bookingsArray.length,
            totalPages: 1,
            nextPage: null,
            prevPage: null,
          },
        };
      }
      const bookingsArray = Object.values(data).filter(
        (item): item is Booking => typeof item === "object" && item !== null && "id" in item
      ) as Booking[];
      return {
        data: bookingsArray,
        meta: data.meta || {
          currentPage: 0,
          perPage: 10,
          total: bookingsArray.length,
          totalPages: 1,
          nextPage: null,
          prevPage: null,
        },
      };
    }

    return {
      data: Array.isArray(data) ? data : [],
      meta: {
        currentPage: 0,
        perPage: 10,
        total: Array.isArray(data) ? data.length : 0,
        totalPages: 1,
        nextPage: null,
        prevPage: null,
      },
    };
  },

  /**
   * Cancel booking (update status to CANCELLED)
   * PUT /api/bookings/{bookingId}
   */
  async cancelBooking(bookingId: number | string, flightId: number): Promise<BookingResponseData> {
    const requestPayload = {
      flight_id: flightId,
      status: "CANCELLED" as const,
    };
    const { data } = await apiClient.put(API_ROUTES.bookings.byId(bookingId), requestPayload);
    return data;
  },

  /**
   * Get booking by ID
   * GET /api/bookings/{bookingId}
   */
  async getBookingById(bookingId: number | string): Promise<Booking> {
    const { data } = await apiClient.get(API_ROUTES.bookings.byId(bookingId));
    return {
      ...data,
      flightId: data.flight?.id ?? data.flightId ?? data.flight_id,
      bookedAt: data.booked_at ?? data.bookedAt,
      updatedAt: data.updated_at ?? data.updatedAt,
      status: data.status ?? "PENDING",
    };
  },
};
