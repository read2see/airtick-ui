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
import { AirportSelect } from "@/components/admin/AirportSelect";
import { FlightService, UpdateFlightRequest } from "@/services/FlightService";
import { FlightResponse } from "@/types/flight";
import { AirportResponse } from "@/types/airport";

const formSchema = z
  .object({
    originAirportId: z
      .union([z.number(), z.undefined()])
      .refine((val) => val !== undefined && val > 0, {
        message: "Origin airport is required.",
      }),
    destinationAirportId: z
      .union([z.number(), z.undefined()])
      .refine((val) => val !== undefined && val > 0, {
        message: "Destination airport is required.",
      }),
    departureTime: z.string().min(1, "Departure time is required."),
    arrivalTime: z.string().min(1, "Arrival time is required."),
    price: z
      .string()
      .min(1, "Price is required.")
      .transform((val) => parseFloat(val))
      .refine((val) => !isNaN(val) && val > 0, "Price must be a positive number."),
  })
  .refine(
    (data) => {
      if (data.originAirportId === undefined || data.destinationAirportId === undefined) {
        return true;
      }
      return data.originAirportId !== data.destinationAirportId;
    },
    {
      message: "Origin and destination airports must be different.",
      path: ["destinationAirportId"],
    }
  )
  .refine(
    (data) => {
      const departure = new Date(data.departureTime);
      const arrival = new Date(data.arrivalTime);
      return arrival > departure;
    },
    {
      message: "Arrival time must be after departure time.",
      path: ["arrivalTime"],
    }
  );

interface EditFlightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  flight: FlightResponse | null;
  airports: AirportResponse[];
}

function formatDateTimeForInput(dateString: string | null | undefined): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
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

export function EditFlightDialog({
  open,
  onOpenChange,
  onSuccess,
  flight,
  airports,
}: EditFlightDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      originAirportId: undefined,
      destinationAirportId: undefined,
      departureTime: "",
      arrivalTime: "",
      price: "",
    },
  });

  React.useEffect(() => {
    if (open && flight) {
      const priceValue = extractPrice(flight.price);
      form.reset({
        originAirportId: flight.origin_airport_id,
        destinationAirportId: flight.destination_airport_id,
        departureTime: formatDateTimeForInput(flight.departure_time),
        arrivalTime: formatDateTimeForInput(flight.arrival_time),
        price: priceValue > 0 ? priceValue.toString() : "",
      });
    } else if (!open) {
      form.reset();
      setIsSubmitting(false);
    }
  }, [open, flight, form]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!flight) return;

    setIsSubmitting(true);

    try {
      const payload: UpdateFlightRequest = {
        origin_airport_id: data.originAirportId!,
        destination_airport_id: data.destinationAirportId!,
        departure_time: new Date(data.departureTime).toISOString(),
        arrival_time: new Date(data.arrivalTime).toISOString(),
        price: data.price,
      };

      await FlightService.updateFlight(flight.id, payload);

      const originAirport = airports.find((a) => a.id === data.originAirportId);
      const destinationAirport = airports.find(
        (a) => a.id === data.destinationAirportId
      );

      toast.success("Flight updated", {
        description: `Flight from ${originAirport?.code || "N/A"} to ${
          destinationAirport?.code || "N/A"
        } has been updated successfully.`,
      });

      setIsSubmitting(false);
      onSuccess?.();
      onOpenChange(false);
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
                if (field === "originAirportId" || field === "origin_airport_id") {
                  form.setError("originAirportId", {
                    type: "server",
                    message: err.msg || "Invalid origin airport.",
                  });
                } else if (field === "destinationAirportId" || field === "destination_airport_id") {
                  form.setError("destinationAirportId", {
                    type: "server",
                    message: err.msg || "Invalid destination airport.",
                  });
                } else if (field === "departureTime" || field === "departure_time") {
                  form.setError("departureTime", {
                    type: "server",
                    message: err.msg || "Invalid departure time.",
                  });
                } else if (field === "arrivalTime" || field === "arrival_time") {
                  form.setError("arrivalTime", {
                    type: "server",
                    message: err.msg || "Invalid arrival time.",
                  });
                } else if (field === "price") {
                  form.setError("price", {
                    type: "server",
                    message: err.msg || "Invalid price.",
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

        const errorMessage =
          (response?.data as any)?.detail ||
          (response?.data as any)?.message ||
          "Failed to update flight";
        toast.error("Error", {
          description: errorMessage,
        });
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while updating the flight.",
        });
      }
    }
  }

  if (!flight) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Flight</DialogTitle>
          <DialogDescription>
            Update flight information. All fields are required.
          </DialogDescription>
        </DialogHeader>
        <form id="edit-flight-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="originAirportId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="originAirportId">Origin Airport</FieldLabel>
                  <AirportSelect
                    airports={airports}
                    value={field.value}
                    onChange={(airportId) => {
                      field.onChange(airportId);
                      const currentDestination = form.getValues("destinationAirportId");
                      if (currentDestination === airportId) {
                        form.setValue("destinationAirportId", undefined);
                      }
                    }}
                    placeholder="Select origin airport"
                    disabled={isSubmitting}
                    error={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="destinationAirportId"
              control={form.control}
              render={({ field, fieldState }) => {
                const originAirportId = form.watch("originAirportId");
                const availableDestinationAirports = React.useMemo(
                  () => {
                    if (!originAirportId) return airports;
                    return airports.filter((airport) => airport.id !== originAirportId);
                  },
                  [airports, originAirportId]
                );

                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="destinationAirportId">
                      Destination Airport
                    </FieldLabel>
                    <AirportSelect
                      airports={availableDestinationAirports}
                      value={field.value}
                      onChange={(airportId) => field.onChange(airportId)}
                      placeholder="Select destination airport"
                      disabled={isSubmitting}
                      error={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                );
              }}
            />
            <Controller
              name="departureTime"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="departureTime">Departure Time</FieldLabel>
                  <Input
                    {...field}
                    id="departureTime"
                    type="datetime-local"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="arrivalTime"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="arrivalTime">Arrival Time</FieldLabel>
                  <Input
                    {...field}
                    id="arrivalTime"
                    type="datetime-local"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="price"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="price">Price (USD)</FieldLabel>
                  <Input
                    {...field}
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    aria-invalid={fieldState.invalid}
                    placeholder="0.00"
                    autoComplete="off"
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
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
            form="edit-flight-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Flight"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
