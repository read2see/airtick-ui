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
import { UserService } from "@/services/UserService";
import { UserResponse } from "@/types/user";

interface ReactivateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse | null;
  onSuccess?: () => void;
}

export function ReactivateUserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: ReactivateUserDialogProps) {
  const [isReactivating, setIsReactivating] = React.useState(false);

  const handleReactivate = async () => {
    if (!user) return;

    setIsReactivating(true);

    try {
      await UserService.reactivateUser(user.id);
      
      const userEmail = user.email_address || user.emailAddress || user.email || `User ${user.id}`;

      toast.success("User reactivated", {
        description: `User ${userEmail} has been reactivated successfully.`,
      });
      setIsReactivating(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      setIsReactivating(false);

      if (error instanceof AxiosError) {
        const errorMessage =
          (error.response?.data as any)?.detail ||
          (error.response?.data as any)?.message ||
          "Failed to reactivate user";
        toast.error("Error", {
          description: errorMessage,
        });
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while reactivating the user.",
        });
      }
    }
  };

  if (!user) return null;

  const userEmail = user.email_address || user.emailAddress || user.email || `User ${user.id}`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reactivate User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reactivate <strong>{userEmail}</strong>? This action will restore the user account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isReactivating}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReactivate}
            disabled={isReactivating}
          >
            {isReactivating ? "Reactivating..." : "Reactivate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
