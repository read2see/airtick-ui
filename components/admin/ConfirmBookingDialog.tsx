"use client";

import * as React from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BookingService } from "@/services/BookingService";
import { Booking } from "@/types/booking";
import { AirportResponse } from "@/types/airport";

interface ConfirmBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  airports?: Map<number, AirportResponse>;
  onSuccess?: () => void;
}

export function ConfirmBookingDialog({
  open,
  onOpenChange,
  booking,
  airports,
  onSuccess,
}: ConfirmBookingDialogProps) {
  const [isConfirming, setIsConfirming] = React.useState(false);

  const handleConfirm = async () => {
    if (!booking || !booking.flight) return;

    setIsConfirming(true);

    try {
      const flight = booking.flight;
      const flightId = flight.id;

      await BookingService.confirmBooking(booking.id, flightId);

      toast.success("Booking confirmed", {
        description: `Booking #${booking.id} has been confirmed successfully.`,
      });
      setIsConfirming(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      setIsConfirming(false);

      if (error instanceof AxiosError) {
        const errorMessage =
          (error.response?.data as any)?.detail ||
          (error.response?.data as any)?.message ||
          "Failed to confirm booking";
        toast.error("Error", {
          description: errorMessage,
        });
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while confirming the booking.",
        });
      }
    }
  };

  if (!booking) return null;

  const flight = booking.flight;
  const originAirport = flight
    ? airports?.get(flight.origin_airport_id ?? flight.originAirportId ?? 0)
    : undefined;
  const destinationAirport = flight
    ? airports?.get(flight.destination_airport_id ?? flight.destinationAirportId ?? 0)
    : undefined;
  const route = originAirport && destinationAirport
    ? `${originAirport.code} to ${destinationAirport.code}`
    : `Booking #${booking.id}`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to confirm <strong>{route}</strong>? This will change the booking status to CONFIRMED.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isConfirming}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? "Confirming..." : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
