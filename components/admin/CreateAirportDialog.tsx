"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AirportService, CreateAirportRequest } from "@/services/AirportService";

const formSchema = z.object({
  name: z.string().min(1, "Name is required.").min(2, "Name must be at least 2 characters."),
  code: z
    .string()
    .min(1, "Code is required.")
    .length(3, "Airport code must be exactly 3 characters."),
  country: z.string().min(1, "Country is required.").min(2, "Country must be at least 2 characters."),
});

interface CreateAirportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateAirportDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAirportDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [keepOpen, setKeepOpen] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      country: "",
    },
  });

  React.useEffect(() => {
    if (!open) {
      form.reset();
      setIsSubmitting(false);
      setKeepOpen(false);
    }
  }, [open, form]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const payload: CreateAirportRequest = {
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        country: data.country.trim(),
      };

      await AirportService.createAirport(payload);

      toast.success("Airport created", {
        description: `${payload.name} (${payload.code}) has been created successfully.`,
      });

      setIsSubmitting(false);
      form.reset();
      onSuccess?.();

      if (!keepOpen) {
        onOpenChange(false);
      }
    } catch (error) {
      setIsSubmitting(false);

      if (error instanceof AxiosError) {
        const response = error.response;

        if (response?.status === 422) {
          const errorData = response.data as any;

          if (errorData?.detail) {
            if (Array.isArray(errorData.detail)) {
              errorData.detail.forEach((err: any) => {
                const field = err.loc?.[err.loc.length - 1];
                if (field === "name") {
                  form.setError("name", {
                    type: "server",
                    message: err.msg || "Invalid name.",
                  });
                } else if (field === "code") {
                  form.setError("code", {
                    type: "server",
                    message: err.msg || "Invalid airport code.",
                  });
                } else if (field === "country") {
                  form.setError("country", {
                    type: "server",
                    message: err.msg || "Invalid country.",
                  });
                }
              });
            } else if (typeof errorData.detail === "string") {
              toast.error("Validation error", {
                description: errorData.detail,
              });
            }
          } else {
            toast.error("Validation error", {
              description: "Please check your input and try again.",
            });
          }
          return;
        }

        if (response?.status === 409) {
          const errorMessage =
            (response.data as any)?.detail ||
            (response.data as any)?.message ||
            "An airport with this code already exists.";
          form.setError("code", {
            type: "server",
            message: errorMessage,
          });
          toast.error("Airport code exists", {
            description: errorMessage,
          });
          return;
        }

        const errorMessage =
          (response?.data as any)?.detail ||
          (response?.data as any)?.message ||
          "Failed to create airport";
        toast.error("Error", {
          description: errorMessage,
        });
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while creating the airport.",
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Airport</DialogTitle>
          <DialogDescription>
            Add a new airport to the system. All fields are required.
          </DialogDescription>
        </DialogHeader>
        <form id="create-airport-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    aria-invalid={fieldState.invalid}
                    placeholder="John F. Kennedy International Airport"
                    autoComplete="off"
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="code">Code</FieldLabel>
                  <Input
                    {...field}
                    id="code"
                    aria-invalid={fieldState.invalid}
                    placeholder="JFK"
                    autoComplete="off"
                    maxLength={3}
                    className="uppercase"
                    disabled={isSubmitting}
                    onChange={(e) => {
                      field.onChange(e.target.value.toUpperCase());
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="country"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="country">Country</FieldLabel>
                  <Input
                    {...field}
                    id="country"
                    aria-invalid={fieldState.invalid}
                    placeholder="United States"
                    autoComplete="off"
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Field orientation="horizontal" className="items-center">
              <input
                type="checkbox"
                id="keep-open"
                checked={keepOpen}
                onChange={(e) => setKeepOpen(e.target.checked)}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border border-input bg-background text-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <FieldLabel htmlFor="keep-open" className="cursor-pointer font-normal">
                Keep modal open to create multiple airports
              </FieldLabel>
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-airport-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Airport"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
