import { FlightResponse } from "./flight";

export interface Booking {
  id: number;
  user_id?: number;
  userId?: number;
  status: "CONFIRMED" | "PENDING" | "CANCELLED" | string;
  booked_at?: string;
  bookedAt?: string;
  updated_at?: string;
  updatedAt?: string;
  flight?: FlightResponse;
  flightId?: number;
  [key: string]: any;
}

export interface Passenger {
  id?: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  [key: string]: any;
}

export interface BookingResponse {
  data: Booking[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
