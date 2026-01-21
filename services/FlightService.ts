import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/apiRoutes";
import { FlightResponse } from "@/types/flight";
import { PaginatedResponse } from "@/types/pagination";
import { PaginationParams } from "@/types/PaginationParams";

export interface FlightSearchParams extends PaginationParams {
  id?: number;
  flightNo?: string;
  originAirportId?: number;
  originAirportName?: string;
  destinationAirportId?: number;
  destinationAirportName?: string;
  price?: number;
  search?: string;
}

export interface FlightBrowseParams extends PaginationParams {
  originAirportId?: number;
  destinationAirportId?: number;
  departureTimeFrom?: string;
  departureTimeTo?: string;
  arrivalTimeFrom?: string;
  arrivalTimeTo?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface CreateFlightRequest {
  origin_airport_id: number;
  destination_airport_id: number;
  departure_time: string;
  arrival_time: string;
  price: number;
}

export type UpdateFlightRequest = CreateFlightRequest;

export const FlightService = {
  /**
   * Get paginated list of flights
   * GET /api/flights
   */
  async getFlights(
    params?: FlightSearchParams
  ): Promise<PaginatedResponse<FlightResponse>> {
    const response = await apiClient.get(API_ROUTES.flights.base, {
      params,
    });
    const data = response.data;
    
    if (data && typeof data === "object" && !Array.isArray(data)) {
      if (data.data && Array.isArray(data.data)) {
        return data;
      }
      const flightsArray = Object.values(data).filter(
        (item): item is FlightResponse => typeof item === "object" && item !== null && "id" in item
      ) as FlightResponse[];
      return {
        data: flightsArray,
        meta: data.meta || {
          currentPage: 0,
          perPage: 10,
          total: flightsArray.length,
          totalPages: 1,
          nextPage: null,
          prevPage: null,
        },
      };
    }
    
    return data;
  },

  /**
   * Get flight by ID
   * GET /api/flights/:id
   */
  async getFlightById(
    flightId: number | string
  ): Promise<FlightResponse> {
    const { data } = await apiClient.get(API_ROUTES.flights.byId(flightId));
    return data;
  },

  /**
   * Create new flight
   * POST /api/flights
   */
  async createFlight(
    payload: CreateFlightRequest
  ): Promise<FlightResponse> {
    const { data } = await apiClient.post(
      API_ROUTES.flights.base,
      payload
    );
    return data;
  },

  /**
   * Update existing flight
   * PUT /api/flights/:id
   */
  async updateFlight(
    flightId: number | string,
    payload: UpdateFlightRequest
  ): Promise<FlightResponse> {
    const { data } = await apiClient.put(
      API_ROUTES.flights.byId(flightId),
      payload
    );
    return data;
  },

  /**
   * Delete flight
   * DELETE /api/flights/:id
   */
  async deleteFlight(flightId: number | string): Promise<void> {
    await apiClient.delete(API_ROUTES.flights.byId(flightId));
  },

  /**
   * Browse flights with advanced filters
   * GET /api/flights/browse
   */
  async browseFlights(
    params?: FlightBrowseParams
  ): Promise<PaginatedResponse<FlightResponse>> {
    const response = await apiClient.get(API_ROUTES.flights.browse, {
      params,
    });
    const data = response.data;
    
    if (data && typeof data === "object" && !Array.isArray(data)) {
      if (data.data && Array.isArray(data.data)) {
        return data;
      }
      const flightsArray = Object.values(data).filter(
        (item): item is FlightResponse => typeof item === "object" && item !== null && "id" in item
      ) as FlightResponse[];
      return {
        data: flightsArray,
        meta: data.meta || {
          currentPage: 0,
          perPage: 10,
          total: flightsArray.length,
          totalPages: 1,
          nextPage: null,
          prevPage: null,
        },
      };
    }
    
    return data;
  },
};
