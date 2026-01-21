"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { AxiosError } from "axios";
import * as z from "zod";
import { Loader2, ArrowLeft, Plane, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { FlightService } from "@/services/FlightService";
import { BookingService } from "@/services/BookingService";
import { AirportService } from "@/services/AirportService";
import { FlightResponse } from "@/types/flight";
import { AirportResponse } from "@/types/airport";
import Link from "next/link";

const formSchema = z.object({
  confirm: z.boolean().refine((val) => val === true, {
    message: "Please confirm your booking.",
  }),
});

export default function NewBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flightId = searchParams.get("flightId");

  const [flight, setFlight] = useState<FlightResponse | null>(null);
  const [originAirport, setOriginAirport] = useState<AirportResponse | null>(null);
  const [destinationAirport, setDestinationAirport] = useState<AirportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confirm: false,
    },
  });

  useEffect(() => {
    if (!flightId) {
      toast.error("Error", {
        description: "No flight selected. Please select a flight to book.",
      });
      router.push("/customer/flights");
      return;
    }

    const fetchFlight = async () => {
      try {
        setLoading(true);
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
        if (error instanceof AxiosError) {
          const errorMessage =
            (error.response?.data as any)?.detail ||
            (error.response?.data as any)?.message ||
            "Failed to load flight details";
          toast.error("Error", {
            description: errorMessage,
          });
        } else {
          toast.error("Error", {
            description: "An unexpected error occurred while loading flight details.",
          });
        }
        router.push("/customer/flights");
      } finally {
        setLoading(false);
      }
    };

    fetchFlight();
  }, [flightId, router]);

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

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!flight || !flightId) {
      return;
    }

    setSubmitting(true);

    try {
      const booking = await BookingService.createBooking({
        flightId: parseInt(flightId),
        status: "PENDING",
      });

      toast.success("Booking created!", {
        description: `Redirecting to booking details...`,
        duration: 2000,
      });

      setTimeout(() => {
        router.push(`/customer/bookings/${booking.id}`);
      }, 1000);
    } catch (error) {
      setSubmitting(false);

      if (error instanceof AxiosError) {
        const errorMessage =
          (error.response?.data as any)?.detail ||
          (error.response?.data as any)?.message ||
          "Failed to create booking";
        toast.error("Error", {
          description: errorMessage,
        });
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while creating your booking.",
        });
      }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!flight) {
    return null;
  }

  const priceValue =
    typeof flight.price === "object" && flight.price !== null && "parsedValue" in flight.price
      ? flight.price.parsedValue
      : typeof flight.price === "number"
      ? flight.price
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
            <h1 className="text-3xl font-bold">Book Flight</h1>
            <p className="text-muted-foreground mt-2">
              Review your flight details and confirm your booking
            </p>
          </div>
        </div>

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

        <Card>
          <CardHeader>
            <CardTitle>Confirm Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="booking-form" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="confirm"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="confirm"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-input bg-transparent text-primary focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                          aria-invalid={fieldState.invalid}
                        />
                        <div className="flex-1">
                          <FieldLabel htmlFor="confirm" className="cursor-pointer">
                            I confirm that I want to book this flight
                          </FieldLabel>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </div>
                      </div>
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/customer/flights">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              form="booking-form"
              disabled={submitting || !form.watch("confirm")}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
