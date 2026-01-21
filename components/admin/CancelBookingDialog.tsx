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

interface CancelBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  airports?: Map<number, AirportResponse>;
  onSuccess?: () => void;
}

export function CancelBookingDialog({
  open,
  onOpenChange,
  booking,
  airports,
  onSuccess,
}: CancelBookingDialogProps) {
  const [isCancelling, setIsCancelling] = React.useState(false);

  const handleCancel = async () => {
    if (!booking || !booking.flight) return;

    setIsCancelling(true);

    try {
      const flight = booking.flight;
      const flightId = flight.id;

      await BookingService.cancelBooking(booking.id, flightId);

      toast.success("Booking cancelled", {
        description: `Booking #${booking.id} has been cancelled successfully.`,
      });
      setIsCancelling(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      setIsCancelling(false);

      if (error instanceof AxiosError) {
        const errorMessage =
          (error.response?.data as any)?.detail ||
          (error.response?.data as any)?.message ||
          "Failed to cancel booking";
        toast.error("Error", {
          description: errorMessage,
        });
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while cancelling the booking.",
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
          <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel <strong>{route}</strong>? This will change the booking status to CANCELLED.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCancelling}>No, Keep Booking</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isCancelling}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isCancelling ? "Cancelling..." : "Yes, Cancel Booking"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
