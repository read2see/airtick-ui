"use client";

import * as React from "react";
import { AirportResponse } from "@/types/airport";
import { Combobox } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

interface AirportSelectProps {
  airports: AirportResponse[];
  value?: number;
  onChange: (airportId: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

export function AirportSelect({
  airports,
  value,
  onChange,
  placeholder = "Select airport...",
  disabled = false,
  error = false,
}: AirportSelectProps) {
  const options = React.useMemo(
    () =>
      airports.map((airport) => ({
        value: airport.id,
        label: `${airport.code} - ${airport.name}`,
        searchableText: `${airport.code} ${airport.name} ${airport.country}`.toLowerCase(),
        airport,
      })),
    [airports]
  );

  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Search airports..."
      emptyText="No airports found."
      disabled={disabled}
      error={error}
      className={cn(
        "h-9 w-full",
        error && "border-destructive"
      )}
      renderOption={(option) => {
        const airport = (option as any).airport as AirportResponse;
        return (
          <div className="flex flex-col">
            <div className="font-medium">{airport.code}</div>
            <div className="text-xs text-muted-foreground">
              {airport.name}, {airport.country}
            </div>
          </div>
        );
      }}
    />
  );
}
