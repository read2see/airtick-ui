import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/apiRoutes";
import { AirportResponse } from "@/types/airport";
import { PaginatedResponse } from "@/types/pagination";
import { PaginationParams } from "@/types/PaginationParams";

export interface AirportSearchParams extends PaginationParams {
  search?: string;
  country?: string;
}

export interface CreateAirportRequest {
  name: string;
  code: string;
  country: string;
}

export interface UpdateAirportRequest {
  name?: string;
  code?: string;
  country?: string;
}

export const AirportService = {
  /**
   * Get paginated list of airports
   * GET /api/airports
   */
  async getAirports(
    params?: AirportSearchParams
  ): Promise<PaginatedResponse<AirportResponse>> {
    const response = await apiClient.get(API_ROUTES.airports.base, {
      params,
    });
    return response.data;
  },

  /**
   * Get airport by ID
   * GET /api/airports/:id
   */
  async getAirportById(
    airportId: number | string
  ): Promise<AirportResponse> {
    const { data } = await apiClient.get(API_ROUTES.airports.byId(airportId));
    return data;
  },

  /**
   * Create new airport
   * POST /api/airports
   */
  async createAirport(
    payload: CreateAirportRequest
  ): Promise<AirportResponse> {
    const { data } = await apiClient.post(
      API_ROUTES.airports.base,
      payload
    );
    return data;
  },

  /**
   * Update airport
   * PUT /api/airports/:id
   */
  async updateAirport(
    airportId: number | string,
    payload: UpdateAirportRequest
  ): Promise<AirportResponse> {
    const { data } = await apiClient.put(
      API_ROUTES.airports.byId(airportId),
      payload
    );
    return data;
  },

  /**
   * Delete airport
   * DELETE /api/airports/:id
   */
  async deleteAirport(airportId: number | string): Promise<void> {
    await apiClient.delete(API_ROUTES.airports.byId(airportId));
  },
};
