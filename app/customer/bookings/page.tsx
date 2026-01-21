"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CustomerBookingTable } from "@/components/customer/CustomerBookingTable";
import { CancelBookingDialog } from "@/components/customer/CancelBookingDialog";
import { BookingService } from "@/services/BookingService";
import { AirportService } from "@/services/AirportService";
import { Booking } from "@/types/booking";
import { AirportResponse } from "@/types/airport";
import { PaginationParams } from "@/types/PaginationParams";
import { toast } from "sonner";
import { AxiosError } from "axios";

export default function CustomerBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [airports, setAirports] = useState<Map<number, AirportResponse>>(new Map());
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
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
      } catch (error) {
        console.error("Failed to load airports:", error);
      }
    };

    fetchAirports();
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params: PaginationParams = {
        page: currentPage - 1,
        size: perPage,
      };

      if (searchValue) {
        params.search = searchValue;
      }

      if (sortColumn && sortDirection) {
        params.sort = `${sortColumn},${sortDirection}`;
      }

      const response = await BookingService.getUserBookings(params);

      if (!response || !response.data || !response.meta) {
        throw new Error("Invalid response structure from API");
      }

      setBookings(response.data);
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
          "Failed to load bookings";
        toast.error("Error", {
          description: errorMessage,
        });
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while loading bookings.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchValue, sortColumn, sortDirection]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

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

  const handleView = (booking: Booking) => {
    router.push(`/customer/bookings/${booking.id}`);
  };

  const handleCancel = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleCancelSuccess = () => {
    fetchBookings();
    setSelectedBooking(null);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your booking history
          </p>
        </div>

        <CustomerBookingTable
          bookings={bookings}
          loading={loading}
          onView={handleView}
          onCancel={handleCancel}
          searchValue={searchValue}
          onSearch={handleSearch}
          airports={airports}
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

        <CancelBookingDialog
          open={cancelDialogOpen}
          onOpenChange={(open) => {
            setCancelDialogOpen(open);
            if (!open) {
              setSelectedBooking(null);
            }
          }}
          booking={selectedBooking}
          onSuccess={handleCancelSuccess}
        />
      </div>
    </div>
  );
}
