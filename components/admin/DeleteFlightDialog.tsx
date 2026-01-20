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
import { FlightService } from "@/services/FlightService";
import { FlightResponse } from "@/types/flight";
import { AirportResponse } from "@/types/airport";

interface DeleteFlightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flight: FlightResponse | null;
  airports?: Map<number, AirportResponse>;
  onSuccess?: () => void;
}

function extractPrice(price: FlightResponse["price"]): number {
  if (typeof price === "number") {
    return price;
  }
  if (price && typeof price === "object" && "parsedValue" in price) {
    return price.parsedValue;
  }
  return 0;
}

export function DeleteFlightDialog({
  open,
  onOpenChange,
  flight,
  airports,
  onSuccess,
}: DeleteFlightDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!flight) return;

    setIsDeleting(true);

    try {
      await FlightService.deleteFlight(flight.id);
      
      const originAirport = airports?.get(flight.origin_airport_id);
      const destinationAirport = airports?.get(flight.destination_airport_id);
      const flightRoute = originAirport && destinationAirport
        ? `${originAirport.code} to ${destinationAirport.code}`
        : `Flight ${flight.id}`;

      toast.success("Flight deleted", {
        description: `Flight ${flightRoute} has been deleted successfully.`,
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
          "Failed to delete flight";
        toast.error("Error", {
          description: errorMessage,
        });
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while deleting the flight.",
        });
      }
    }
  };

  if (!flight) return null;

  const originAirport = airports?.get(flight.origin_airport_id);
  const destinationAirport = airports?.get(flight.destination_airport_id);
  const flightRoute = originAirport && destinationAirport
    ? `${originAirport.code} to ${destinationAirport.code}`
    : `Flight ${flight.id}`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Flight</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{flightRoute}</strong>? This action cannot be undone.
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
