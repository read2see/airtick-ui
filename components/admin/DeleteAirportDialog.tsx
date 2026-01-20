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
import { AirportService } from "@/services/AirportService";
import { AirportResponse } from "@/types/airport";

interface DeleteAirportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  airport: AirportResponse | null;
  onSuccess?: () => void;
}

export function DeleteAirportDialog({
  open,
  onOpenChange,
  airport,
  onSuccess,
}: DeleteAirportDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!airport) return;

    setIsDeleting(true);

    try {
      await AirportService.deleteAirport(airport.id);
      toast.success("Airport deleted", {
        description: `${airport.name} has been deleted successfully.`,
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
          "Failed to delete airport";
        toast.error("Error", {
          description: errorMessage,
        });
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while deleting the airport.",
        });
      }
    }
  };

  if (!airport) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Airport</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{airport.name}</strong> (
            <strong>{airport.code}</strong>)? This action cannot be undone.
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
