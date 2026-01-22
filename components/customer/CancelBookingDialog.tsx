"use client";

import * as React from "react";
import axios from "axios";
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

interface CancelBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onSuccess?: () => void;
}

export function CancelBookingDialog({
  open,
  onOpenChange,
  booking,
  onSuccess,
}: CancelBookingDialogProps) {
  const [isCancelling, setIsCancelling] = React.useState(false);

  const handleCancel = async () => {
    if (!booking) return;

    let flight = booking.flight;
    if (!flight || !flight.id) {
      toast.error("Error", {
        description: "Cannot cancel booking: Flight information is missing.",
      });
      return;
    }

    const priceValue =
      typeof flight.price === "object" && flight.price !== null && "parsedValue" in flight.price
        ? flight.price.parsedValue
        : typeof flight.price === "number"
        ? flight.price
        : 0;

    setIsCancelling(true);

    try {
      await BookingService.cancelBooking(booking.id, flight.id);
      
      flight = booking.flight;
      const route = flight
        ? `Flight #${flight.id}`
        : `Booking ${booking.id}`;

      toast.success("Booking cancelled", {
        description: `Booking ${booking.id} (${route}) has been cancelled successfully.`,
      });
      setIsCancelling(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      setIsCancelling(false);

      if (axios.isAxiosError(error)) {
        const errorMessage =
          (error.response?.data as SimpleErrorResponse)?.detail ||
          (error.response?.data as SimpleErrorResponse)?.message ||
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
  const route = flight
    ? `Flight #${flight.id}`
    : `Booking ${booking.id}`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel booking <strong>#{booking.id}</strong> ({route})? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCancelling}>Keep Booking</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isCancelling}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isCancelling ? "Cancelling..." : "Cancel Booking"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
