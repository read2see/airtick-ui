export interface Booking {
  id: number;
  flightId?: number;
  flightNumber?: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  arrivalDate?: string;
  status: string;
  totalPrice?: number;
  bookingDate?: string;
  passengers?: Passenger[];
  [key: string]: any; // Allow for additional fields
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
