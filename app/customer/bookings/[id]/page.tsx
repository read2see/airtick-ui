"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Loader2, ArrowLeft, Plane, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookingService } from "@/services/BookingService";
import { FlightService } from "@/services/FlightService";
import { AirportService } from "@/services/AirportService";
import { Booking } from "@/types/booking";
import { FlightResponse } from "@/types/flight";
import { AirportResponse } from "@/types/airport";
import Link from "next/link";

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params?.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [flight, setFlight] = useState<FlightResponse | null>(null);
  const [originAirport, setOriginAirport] = useState<AirportResponse | null>(null);
  const [destinationAirport, setDestinationAirport] = useState<AirportResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      toast.error("Error", {
        description: "No booking ID provided.",
      });
      router.push("/customer/flights");
      return;
    }

    const fetchBooking = async () => {
      try {
        setLoading(true);
        const bookingData = await BookingService.getBookingById(bookingId);
        setBooking(bookingData);

        const flightId = bookingData.flightId ?? bookingData.flight_id;
        if (flightId) {
          try {
            const flightData = await FlightService.getFlightById(flightId);
            setFlight(flightData);

            if (flightData.origin_airport_id) {
              try {
                const origin = await AirportService.getAirportById(flightData.origin_airport_id);
                setOriginAirport(origin);
              } catch (error) {
                console.error("Failed to load origin airport:", error);
              }
            }

            if (flightData.destination_airport_id) {
              try {
                const destination = await AirportService.getAirportById(flightData.destination_airport_id);
                setDestinationAirport(destination);
              } catch (error) {
                console.error("Failed to load destination airport:", error);
              }
            }
          } catch (error) {
            console.error("Failed to load flight:", error);
          }
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          const errorMessage =
            (error.response?.data as any)?.detail ||
            (error.response?.data as any)?.message ||
            "Failed to load booking details";
          toast.error("Error", {
            description: errorMessage,
          });
        } else {
          toast.error("Error", {
            description: "An unexpected error occurred while loading booking details.",
          });
        }
        router.push("/customer/flights");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, router]);

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

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "confirmed") {
      return "text-green-600 dark:text-green-400";
    }
    if (statusLower === "pending") {
      return "text-yellow-600 dark:text-yellow-400";
    }
    if (statusLower === "cancelled") {
      return "text-red-600 dark:text-red-400";
    }
    return "text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <p className="text-muted-foreground">Booking not found</p>
          <Link href="/customer/flights">
            <Button>Back to Flights</Button>
          </Link>
        </div>
      </div>
    );
  }

  const priceValue = flight
    ? (typeof flight.price === "object" && flight.price !== null && "parsedValue" in flight.price
        ? flight.price.parsedValue
        : typeof flight.price === "number"
        ? flight.price
        : 0)
    : 0;

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <Link href="/customer/flights" className="inline-block mb-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Flights
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Booking Details</h1>
            <p className="text-muted-foreground mt-2">
              View your booking information and status
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Booking ID</div>
                <div className="font-medium text-lg">#{booking.id}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <div className={`font-medium text-lg capitalize ${getStatusColor(booking.status)}`}>
                  {booking.status?.toLowerCase() || "Pending"}
                </div>
                {booking.status?.toLowerCase() === "pending" && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Your booking is pending admin confirmation.
                  </div>
                )}
              </div>
              {(booking.bookingDate || booking.booked_at || booking.bookedAt) && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Booking Date</div>
                  <div className="font-medium">{formatDateTime(booking.bookingDate ?? booking.booked_at ?? booking.bookedAt)}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {flight ? (
          <Card>
            <CardHeader>
              <CardTitle>Flight Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Departure</div>
                    <div className="font-medium">
                      {formatDateTime(flight.departure_time ?? flight.departureTime)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Arrival</div>
                    <div className="font-medium">
                      {formatDateTime(flight.arrival_time ?? flight.arrivalTime)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Duration</div>
                    <div className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {calculateDuration(
                        flight.departure_time ?? flight.departureTime ?? "",
                        flight.arrival_time ?? flight.arrivalTime ?? ""
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Price</div>
                    <div className="text-2xl font-bold">{formatCurrency(priceValue)}</div>
                    <div className="text-sm text-muted-foreground">per person</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Flight Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Flight information is not available.</p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Link href="/customer/flights">
            <Button>
              Back to Flights
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
