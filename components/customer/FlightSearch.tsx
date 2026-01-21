"use client";

import * as React from "react";
import { AirportResponse } from "@/types/airport";
import { AirportSelect } from "@/components/admin/AirportSelect";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, ChevronDown, ChevronUp, Filter } from "lucide-react";

export interface FlightSearchFilters {
  originAirportId?: number;
  destinationAirportId?: number;
  minPrice?: number;
  maxPrice?: number;
  departureDateFrom?: string;
  departureDateTo?: string;
  sortBy?: "price" | "departure_time" | "duration";
  sortOrder?: "asc" | "desc";
}

interface FlightSearchProps {
  airports: AirportResponse[];
  filters: FlightSearchFilters;
  onFiltersChange: (filters: FlightSearchFilters) => void;
  onSearch: () => void;
  loading?: boolean;
}

export function FlightSearch({
  airports,
  filters,
  onFiltersChange,
  onSearch,
  loading = false,
}: FlightSearchProps) {
  const [isFiltersVisible, setIsFiltersVisible] = React.useState(true);

  const handleFilterChange = (key: keyof FlightSearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      sortBy: "departure_time",
      sortOrder: "asc",
    });
  };

  const hasActiveFilters = 
    filters.originAirportId ||
    filters.destinationAirportId ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.departureDateFrom ||
    filters.departureDateTo;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Search Flights</h2>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                className="text-muted-foreground"
                aria-label={isFiltersVisible ? "Hide filters" : "Show filters"}
              >
                <Filter className="h-4 w-4 mr-1" />
                {isFiltersVisible ? (
                  <>
                    <span className="hidden sm:inline">Hide Filters</span>
                    <ChevronUp className="h-4 w-4 sm:ml-1" />
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Show Filters</span>
                    <ChevronDown className="h-4 w-4 sm:ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {isFiltersVisible && (
            <FieldGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Origin Airport</FieldLabel>
                <AirportSelect
                  airports={airports}
                  value={filters.originAirportId}
                  onChange={(value) => handleFilterChange("originAirportId", value)}
                  placeholder="Select origin..."
                />
              </Field>

              <Field>
                <FieldLabel>Destination Airport</FieldLabel>
                <AirportSelect
                  airports={airports}
                  value={filters.destinationAirportId}
                  onChange={(value) => handleFilterChange("destinationAirportId", value)}
                  placeholder="Select destination..."
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Departure Date From</FieldLabel>
                <Input
                  type="date"
                  value={filters.departureDateFrom || ""}
                  onChange={(e) => handleFilterChange("departureDateFrom", e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel>Departure Date To</FieldLabel>
                <Input
                  type="date"
                  value={filters.departureDateTo || ""}
                  onChange={(e) => handleFilterChange("departureDateTo", e.target.value)}
                  min={filters.departureDateFrom || undefined}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Min Price ($)</FieldLabel>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.minPrice || ""}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                />
              </Field>

              <Field>
                <FieldLabel>Max Price ($)</FieldLabel>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.maxPrice || ""}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Sort By</FieldLabel>
                <Select
                  value={filters.sortBy || "departure_time"}
                  onValueChange={(value) =>
                    handleFilterChange("sortBy", value as "price" | "departure_time" | "duration")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select sort option..." />
                  </SelectTrigger>
                  <SelectContent 
                    position="popper" 
                    side="bottom" 
                    align="start"
                    className="bg-black/90"
                  >
                    <SelectItem value="departure_time">Departure Time</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Sort Order</FieldLabel>
                <Select
                  value={filters.sortOrder || "asc"}
                  onValueChange={(value) =>
                    handleFilterChange("sortOrder", value as "asc" | "desc")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select order..." />
                  </SelectTrigger>
                  <SelectContent 
                    position="popper" 
                    side="bottom" 
                    align="start"
                    className="bg-black/90"
                  >
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FieldGroup>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={onSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Searching..." : "Search Flights"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
