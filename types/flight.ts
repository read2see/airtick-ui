export interface FlightResponse {
  id: number;
  departure_time: string;
  arrival_time: string;
  price: {
    source: string;
    parsedValue: number;
  } | number; // Can be object or number depending on API version
  origin_airport_id: number;
  destination_airport_id: number;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
  // Allow for additional fields that might be present in actual API response
  [key: string]: any;
}
