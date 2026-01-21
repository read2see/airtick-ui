import { FlightResponse } from "./flight";
import { UserResponse } from "./user";

export interface Booking {
  id: number;
  user_id?: number;
  userId?: number;
  status: "CONFIRMED" | "PENDING" | "CANCELLED" | "COMPLETED" | string;
  booked_at?: string;
  bookedAt?: string;
  updated_at?: string;
  updatedAt?: string;
  flight?: FlightResponse;
  flightId?: number;
  flight_id?: number;
  user?: UserResponse;
  total_price?: number | {
    source: string;
    parsedValue: number;
  };
  totalPrice?: number | {
    source: string;
    parsedValue: number;
  };
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
