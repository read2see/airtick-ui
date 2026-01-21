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

interface DeleteBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  airports?: Map<number, AirportResponse>;
  onSuccess?: () => void;
}

export function DeleteBookingDialog({
  open,
  onOpenChange,
  booking,
  airports,
  onSuccess,
}: DeleteBookingDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!booking) return;

    setIsDeleting(true);

    try {
      await BookingService.deleteBooking(booking.id);

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

      toast.success("Booking deleted", {
        description: `Booking ${route} has been deleted successfully.`,
      });
      setIsDeleting(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      setIsDeleting(false);

      if (error instanceof AxiosError) {
        const errorMessage =
          (error.response?.data as any)?.detail ||
          (error.response?.data as any)?.message ||
          "Failed to delete booking";
        toast.error("Error", {
          description: errorMessage,
        });
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while deleting the booking.",
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
          <AlertDialogTitle>Delete Booking</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{route}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
