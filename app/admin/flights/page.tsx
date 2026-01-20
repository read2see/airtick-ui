"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { FlightTable } from "@/components/admin/FlightTable";
import { CreateFlightDialog } from "@/components/admin/CreateFlightDialog";
import { FlightService, FlightSearchParams } from "@/services/FlightService";
import { AirportService } from "@/services/AirportService";
import { FlightResponse } from "@/types/flight";
import { AirportResponse } from "@/types/airport";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

export default function AdminFlightsPage() {
  const [flights, setFlights] = useState<FlightResponse[]>([]);
  const [airports, setAirports] = useState<Map<number, AirportResponse>>(
    new Map()
  );
  const [airportsList, setAirportsList] = useState<AirportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [prevPage, setPrevPage] = useState<number | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null
  );

  const fetchFlights = useCallback(async () => {
    try {
      setLoading(true);
      const params: FlightSearchParams = {
        page: currentPage - 1,
        size: perPage,
      };

      if (searchValue) {
        params.search = searchValue;
      }

      if (sortColumn && sortDirection) {
        params.sort = `${sortColumn},${sortDirection}`;
      }

      const response = await FlightService.getFlights(params);

      if (!response || !response.data || !response.meta) {
        throw new Error("Invalid response structure from API");
      }


      setFlights(response.data);
      const meta = response.meta as any;
      setTotalPages(meta.totalPages ?? meta.total_pages ?? 1);
      setTotal(meta.total ?? 0);
      const nextPageValue = meta.nextPage ?? meta.next_page;
      const prevPageValue = meta.prevPage ?? meta.prev_page;
      setNextPage(nextPageValue !== undefined ? nextPageValue : null);
      setPrevPage(prevPageValue !== undefined ? prevPageValue : null);
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
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchValue, sortColumn, sortDirection]);

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await AirportService.getAirports({
          page: 0,
          size: 1000,
        });
        const airportMap = new Map<number, AirportResponse>();
        response.data.forEach((airport) => {
          airportMap.set(airport.id, airport);
        });
        setAirports(airportMap);
        setAirportsList(response.data);
      } catch (error) {
        // Silently fail - airport lookup is optional
      }
    };

    fetchAirports();
  }, []);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleSort = (column: string, direction: "asc" | "desc") => {
    setSortColumn(column);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  const handleEdit = (flight: FlightResponse) => {
    // TODO: Implement edit functionality
    toast.info("Edit functionality coming soon", {
      description: `Edit flight ${flight.id}`,
    });
  };

  const handleDelete = (flight: FlightResponse) => {
    // TODO: Implement delete functionality
    toast.info("Delete functionality coming soon", {
      description: `Delete flight ${flight.id}`,
    });
  };

  const handleView = (flight: FlightResponse) => {
    // TODO: Implement view functionality
    toast.info("View functionality coming soon", {
      description: `View flight ${flight.id}`,
    });
  };

  const handleCreate = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    fetchFlights();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Flights</h1>
          <p className="text-muted-foreground mt-2">
            Manage flights in the system
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Flight
        </Button>
      </div>

      <FlightTable
        flights={flights}
        airports={airports}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchValue={searchValue}
        onSearch={handleSearch}
        pagination={{
          currentPage,
          totalPages,
          perPage,
          total,
          nextPage,
          prevPage,
          onPageChange: handlePageChange,
          onPerPageChange: handlePerPageChange,
          pageSizeOptions: [10, 25, 50, 100],
        }}
        sorting={{
          column: sortColumn,
          direction: sortDirection,
          onSort: handleSort,
        }}
      />

      <CreateFlightDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        airports={airportsList}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
