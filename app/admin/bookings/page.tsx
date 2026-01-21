"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { BookingTable } from "@/components/admin/BookingTable";
import { ViewBookingDialog } from "@/components/admin/ViewBookingDialog";
import { ConfirmBookingDialog } from "@/components/admin/ConfirmBookingDialog";
import { CancelBookingDialog } from "@/components/admin/CancelBookingDialog";
import { DeleteBookingDialog } from "@/components/admin/DeleteBookingDialog";
import { BookingService, BookingSearchParams } from "@/services/BookingService";
import { AirportService } from "@/services/AirportService";
import { Booking } from "@/types/booking";
import { AirportResponse } from "@/types/airport";
import { toast } from "sonner";
import { AxiosError } from "axios";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [airports, setAirports] = useState<Map<number, AirportResponse>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
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

  const columnToSortParam: Record<string, string> = {
    id: "id",
    bookedAt: "bookedAt",
    price: "flight.price",
    status: "status",
  };

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params: BookingSearchParams = {
        page: currentPage - 1,
        size: perPage,
      };

      if (searchValue) {
        params.search = searchValue;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (sortColumn && sortDirection) {
        const sortParam = columnToSortParam[sortColumn] || sortColumn;
        params.sort = `${sortParam},${sortDirection}`;
      }

      const response = await BookingService.getAdminBookings(params);

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
  }, [currentPage, perPage, searchValue, statusFilter, sortColumn, sortDirection]);

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
        // Silently fail - airport lookup is optional
      }
    };

    fetchAirports();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
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
    setSelectedBooking(booking);
    setViewDialogOpen(true);
  };

  const handleConfirm = (booking: Booking) => {
    setSelectedBooking(booking);
    setConfirmDialogOpen(true);
  };

  const handleCancel = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleDelete = (booking: Booking) => {
    setSelectedBooking(booking);
    setDeleteDialogOpen(true);
  };

  const handleActionSuccess = () => {
    fetchBookings();
    setSelectedBooking(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="text-muted-foreground mt-2">
          Manage all bookings in the system
        </p>
      </div>

      <BookingTable
        bookings={bookings}
        airports={airports}
        loading={loading}
        onView={handleView}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onDelete={handleDelete}
        searchValue={searchValue}
        onSearch={handleSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
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

      <ViewBookingDialog
        open={viewDialogOpen}
        onOpenChange={(open) => {
          setViewDialogOpen(open);
          if (!open) {
            setSelectedBooking(null);
          }
        }}
        booking={selectedBooking}
        airports={airports}
      />

      <ConfirmBookingDialog
        open={confirmDialogOpen}
        onOpenChange={(open) => {
          setConfirmDialogOpen(open);
          if (!open) {
            setSelectedBooking(null);
          }
        }}
        booking={selectedBooking}
        airports={airports}
        onSuccess={handleActionSuccess}
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
        airports={airports}
        onSuccess={handleActionSuccess}
      />

      <DeleteBookingDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setSelectedBooking(null);
          }
        }}
        booking={selectedBooking}
        airports={airports}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
