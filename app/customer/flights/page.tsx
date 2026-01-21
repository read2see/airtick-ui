"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { FlightSearch, FlightSearchFilters } from "@/components/customer/FlightSearch";
import { FlightCard } from "@/components/customer/FlightCard";
import { FlightService, FlightBrowseParams } from "@/services/FlightService";
import { AirportService } from "@/services/AirportService";
import { FlightResponse } from "@/types/flight";
import { AirportResponse } from "@/types/airport";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function BrowseFlightsPage() {
  const [flights, setFlights] = useState<FlightResponse[]>([]);
  const [airports, setAirports] = useState<AirportResponse[]>([]);
  const [airportsMap, setAirportsMap] = useState<Map<number, AirportResponse>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(12);
  const [total, setTotal] = useState(0);
  
  const [filters, setFilters] = useState<FlightSearchFilters>({
    sortBy: "departure_time",
    sortOrder: "asc",
  });

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await AirportService.getAirports({
          page: 0,
          size: 1000,
        });
        setAirports(response.data);
        const airportMap = new Map<number, AirportResponse>();
        response.data.forEach((airport) => {
          airportMap.set(airport.id, airport);
        });
        setAirportsMap(airportMap);
      } catch (error) {
        console.error("Failed to load airports:", error);
      }
    };

    fetchAirports();
  }, []);

  const buildBrowseParams = useCallback((filters: FlightSearchFilters, page: number): FlightBrowseParams => {
    const params: FlightBrowseParams = {
      page: page - 1,
      size: perPage,
    };

    if (filters.originAirportId) {
      params.originAirportId = filters.originAirportId;
    }

    if (filters.destinationAirportId) {
      params.destinationAirportId = filters.destinationAirportId;
    }

    if (filters.departureDateFrom) {
      const date = new Date(filters.departureDateFrom);
      date.setHours(0, 0, 0, 0);
      params.departureTimeFrom = date.toISOString();
    }

    if (filters.departureDateTo) {
      const date = new Date(filters.departureDateTo);
      date.setHours(23, 59, 59, 999);
      params.departureTimeTo = date.toISOString();
    }

    if (filters.minPrice !== undefined) {
      params.minPrice = filters.minPrice;
    }

    if (filters.maxPrice !== undefined) {
      params.maxPrice = filters.maxPrice;
    }

    if (filters.sortBy) {
      const sortColumn = 
        filters.sortBy === "departure_time" ? "departureTime" :
        filters.sortBy === "price" ? "price" :
        filters.sortBy === "duration" ? "arrivalTime" :
        "departureTime";
      params.sort = `${sortColumn},${filters.sortOrder || "asc"}`;
    } else {
      params.sort = `departureTime,${filters.sortOrder || "asc"}`;
    }

    return params;
  }, [perPage]);

  const fetchFlights = useCallback(async (page: number = 1, resetPage: boolean = false) => {
    try {
      setSearching(true);
      const params = buildBrowseParams(filters, resetPage ? 1 : page);
      
      const response = await FlightService.browseFlights(params);

      if (!response || !response.data || !response.meta) {
        throw new Error("Invalid response structure from API");
      }

      setFlights(response.data);
      const meta = response.meta as any;
      setTotalPages(meta.totalPages ?? meta.total_pages ?? 1);
      setTotal(meta.total ?? response.data.length);
      
      if (resetPage) {
        setCurrentPage(1);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          (error.response?.data as any)?.detail ||
          (error.response?.data as any)?.message ||
          "Failed to load flights";
        toast.error("Error", {
          description: errorMessage,
        });
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while loading flights.",
        });
      }
      setFlights([]);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [filters, buildBrowseParams]);

  useEffect(() => {
    fetchFlights(1, false);
  }, []);

  const handleSearch = () => {
    fetchFlights(1, true);
  };

  const handleFiltersChange = (newFilters: FlightSearchFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchFlights(page, false);
  };

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push("ellipsis");
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (loading && flights.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Browse Flights</h1>
          <p className="text-muted-foreground mt-2">
            Search and book flights to your destination
          </p>
        </div>

        <FlightSearch
          airports={airports}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          loading={searching}
        />

        {searching && flights.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : flights.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No flights found</p>
            <p className="text-muted-foreground text-sm mt-2">
              Try adjusting your search filters
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {total} {total === 1 ? "flight" : "flights"} found
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {flights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  originAirport={airportsMap.get(flight.origin_airport_id)}
                  destinationAirport={airportsMap.get(flight.destination_airport_id)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      asButton
                      disabled={currentPage === 1 || searching}
                      onClick={() => !searching && currentPage > 1 && handlePageChange(currentPage - 1)}
                    />
                  </PaginationItem>
                  
                  {getPageNumbers().map((page, index) => {
                    if (page === "ellipsis") {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          asButton
                          isActive={currentPage === page}
                          disabled={searching}
                          onClick={() => !searching && handlePageChange(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      asButton
                      disabled={currentPage === totalPages || searching}
                      onClick={() => !searching && currentPage < totalPages && handlePageChange(currentPage + 1)}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </div>
  );
}
