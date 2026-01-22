"use client";

import * as React from "react";
import { FlightResponse } from "@/types/flight";
import { AirportResponse } from "@/types/airport";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Plane, Clock, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface FlightCardProps {
  flight: FlightResponse;
  originAirport?: AirportResponse;
  destinationAirport?: AirportResponse;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) {
    return "N/A";
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return format(date, "MMM dd, yyyy HH:mm");
  } catch {
    return "Invalid date";
  }
};

const calculateDuration = (departure: string, arrival: string): string => {
  try {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    if (isNaN(dep.getTime()) || isNaN(arr.getTime())) {
      return "N/A";
    }
    const diffMs = arr.getTime() - dep.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  } catch {
    return "N/A";
  }
};

export function FlightCard({ flight, originAirport, destinationAirport }: FlightCardProps) {
  const router = useRouter();
  const { user } = useAuth();

  const priceValue =
    typeof flight.price === "object" && flight.price !== null && "parsedValue" in flight.price
      ? flight.price.parsedValue
      : typeof flight.price === "number"
      ? flight.price
      : 0;

  const handleBookFlight = () => {
    router.push(`/customer/bookings/new?flightId=${flight.id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-semibold text-lg">
                    {originAirport?.code || `ID: ${flight.origin_airport_id}`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {originAirport?.name || "Unknown"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-bold capitalize">from</div>
                </div>
              </div>
              <Plane className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-semibold text-lg">
                    {destinationAirport?.code || `ID: ${flight.destination_airport_id}`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {destinationAirport?.name || "Unknown"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-bold capitalize">to</div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatCurrency(priceValue)}</div>
            <div className="text-sm text-muted-foreground">per person</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Departure</div>
            <div className="font-medium">{formatDateTime(flight.departure_time ?? flight.departureTime)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Arrival</div>
            <div className="font-medium">{formatDateTime(flight.arrival_time ?? flight.arrivalTime)}</div>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Duration: {calculateDuration(
                  flight.departure_time ?? flight.departureTime ?? "",
                  flight.arrival_time ?? flight.arrivalTime ?? ""
                )}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      {
      user?.role == "CUSTOMER" &&
      <CardFooter className="border-t pt-4">
        <Button onClick={handleBookFlight} className="w-full">
          Book Flight
        </Button>
      </CardFooter>
      }
    </Card>
  );
}
