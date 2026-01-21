"use client";

import * as React from "react";
import { Booking } from "@/types/booking";
import { AirportResponse } from "@/types/airport";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface ViewBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  airports?: Map<number, AirportResponse>;
}

const formatCurrency = (amount: number | { source: string; parsedValue: number } | undefined) => {
  if (!amount) {
    return "N/A";
  }
  const value = typeof amount === "object" && amount !== null && "parsedValue" in amount
    ? amount.parsedValue
    : typeof amount === "number"
    ? amount
    : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
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
    return format(date, "MMM dd, yyyy 'at' HH:mm");
  } catch {
    return "Invalid date";
  }
};

const getStatusBadge = (status: string) => {
  const statusLower = status?.toLowerCase() || "";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
        statusLower === "confirmed"
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : statusLower === "pending"
          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          : statusLower === "cancelled"
          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          : statusLower === "completed"
          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      }`}
    >
      {status}
    </span>
  );
};

export function ViewBookingDialog({
  open,
  onOpenChange,
  booking,
  airports,
}: ViewBookingDialogProps) {
  if (!booking) return null;

  const user = booking.user;
  const flight = booking.flight;

  let originCode = "N/A";
  let originName = "";
  let destinationCode = "N/A";
  let destinationName = "";

  if (flight) {
    const originAirportObj = flight.originAirport || flight.origin_airport;
    const destinationAirportObj = flight.destinationAirport || flight.destination_airport;
    
    if (originAirportObj && typeof originAirportObj === "object") {
      originCode = originAirportObj.code || "N/A";
      originName = originAirportObj.name || "";
    } else {
      const originAirportId = flight.origin_airport_id ?? flight.originAirportId;
      const originAirport = airports?.get(originAirportId);
      if (originAirport) {
        originCode = originAirport.code;
        originName = originAirport.name;
      }
    }
    
    if (destinationAirportObj && typeof destinationAirportObj === "object") {
      destinationCode = destinationAirportObj.code || "N/A";
      destinationName = destinationAirportObj.name || "";
    } else {
      const destinationAirportId = flight.destination_airport_id ?? flight.destinationAirportId;
      const destinationAirport = airports?.get(destinationAirportId);
      if (destinationAirport) {
        destinationCode = destinationAirport.code;
        destinationName = destinationAirport.name;
      }
    }
  }

  const userEmail = user?.email_address ?? user?.emailAddress ?? user?.email ?? "N/A";
  const firstName = user?.user_profile?.first_name ?? user?.user_profile?.firstName ?? user?.userProfile?.first_name ?? user?.userProfile?.firstName;
  const lastName = user?.user_profile?.last_name ?? user?.user_profile?.lastName ?? user?.userProfile?.last_name ?? user?.userProfile?.lastName;
  const userName = firstName || lastName ? `${firstName || ""} ${lastName || ""}`.trim() : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            View detailed information about booking #{booking.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Booking Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Booking Information
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Booking ID</span>
                <span className="text-sm font-medium">#{booking.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(booking.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Booking Date</span>
                <span className="text-sm font-medium">
                  {formatDateTime(booking.bookedAt ?? booking.booked_at)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="text-sm font-medium">
                  {formatCurrency(
                    flight && flight.price
                      ? typeof flight.price === "object" && flight.price !== null && "parsedValue" in flight.price
                        ? flight.price.parsedValue
                        : typeof flight.price === "number"
                        ? flight.price
                        : undefined
                      : booking.totalPrice ?? booking.total_price
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Customer Information
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">User ID</span>
                <span className="text-sm font-medium">
                  {user?.id ?? booking.userId ?? booking.user_id ?? "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium">{userEmail}</span>
              </div>
              {userName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <span className="text-sm font-medium">{userName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Flight Information */}
          {flight && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Flight Information
              </h3>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Flight ID</span>
                  <span className="text-sm font-medium">#{flight.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Route</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {originCode} → {destinationCode}
                    </div>
                    {(originName || destinationName) && (
                      <div className="text-xs text-muted-foreground">
                        {originName && destinationName
                          ? `${originName} to ${destinationName}`
                          : originName || destinationName}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Departure</span>
                  <span className="text-sm font-medium">
                    {formatDateTime(flight.departure_time ?? flight.departureTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Arrival</span>
                  <span className="text-sm font-medium">
                    {formatDateTime(flight.arrival_time ?? flight.arrivalTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Flight Price</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(
                      typeof flight.price === "object" && flight.price !== null && "parsedValue" in flight.price
                        ? flight.price.parsedValue
                        : typeof flight.price === "number"
                        ? flight.price
                        : undefined
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!flight && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Flight Information
              </h3>
              <div className="text-sm text-muted-foreground">
                Flight ID: {booking.flightId ?? booking.flight_id ?? "N/A"}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
