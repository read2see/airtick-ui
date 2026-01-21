"use client";

import * as React from "react";
import { Booking } from "@/types/booking";
import { AirportResponse } from "@/types/airport";
import { DataTable, Column } from "@/components/ui/data-table";
import { TableActions, TableAction } from "@/components/admin/TableActions";
import { X, Eye } from "lucide-react";
import { format } from "date-fns";

interface CustomerBookingTableProps {
  bookings: Booking[];
  loading?: boolean;
  onView?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
  airports?: Map<number, AirportResponse>;
  pagination?: {
    currentPage: number;
    totalPages: number;
    perPage: number;
    total: number;
    nextPage: number | null;
    prevPage: number | null;
    onPageChange: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;
    pageSizeOptions?: number[];
  };
  sorting?: {
    column: string | null;
    direction: "asc" | "desc" | null;
    onSort: (column: string, direction: "asc" | "desc") => void;
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) {
    return <span className="text-muted-foreground">N/A</span>;
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return <span className="text-muted-foreground">Invalid date</span>;
    }
    return format(date, "MMM dd, yyyy");
  } catch {
    return <span className="text-muted-foreground">Invalid date</span>;
  }
};

const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) {
    return <span className="text-muted-foreground">N/A</span>;
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return <span className="text-muted-foreground">Invalid date</span>;
    }
    return format(date, "MMM dd, yyyy HH:mm");
  } catch {
    return <span className="text-muted-foreground">Invalid date</span>;
  }
};

export function CustomerBookingTable({
  bookings,
  loading = false,
  onView,
  onCancel,
  searchValue = "",
  onSearch,
  airports,
  pagination,
  sorting,
}: CustomerBookingTableProps) {
  const getActions = (row: Booking): TableAction<Booking>[] => {
    const actions: TableAction<Booking>[] = [];
    
    if (onView) {
      actions.push({
        label: "View",
        icon: Eye,
        onClick: onView,
      });
    }
    
    if (onCancel && row.status?.toLowerCase() !== "cancelled") {
      actions.push({
        label: "Cancel",
        icon: X,
        onClick: onCancel,
        variant: "destructive",
      });
    }
    
    return actions;
  };

  const columns: Column<Booking>[] = [
    {
      id: "id",
      header: "Booking ID",
      accessorKey: "id",
      sortable: true,
    },
    {
      id: "route",
      header: "Route",
      cell: (row) => {
        const flight = row.flight;
        if (!flight) {
          return <span className="text-muted-foreground">N/A</span>;
        }
        const originAirport = airports?.get(flight.origin_airport_id);
        const destinationAirport = airports?.get(flight.destination_airport_id);
        const originCode = originAirport?.code || `ID: ${flight.origin_airport_id}`;
        const destinationCode = destinationAirport?.code || `ID: ${flight.destination_airport_id}`;
        return (
          <div>
            <div className="font-medium">{originCode} → {destinationCode}</div>
            <div className="text-xs text-muted-foreground">
              Flight #{flight.id}
            </div>
          </div>
        );
      },
      sortable: false,
    },
    {
      id: "departureDate",
      header: "Departure",
      cell: (row) => {
        const departureTime = row.flight?.departure_time || row.flight?.departureTime;
        return formatDateTime(departureTime);
      },
      sortable: true,
    },
    {
      id: "arrivalDate",
      header: "Arrival",
      cell: (row) => {
        const arrivalTime = row.flight?.arrival_time || row.flight?.arrivalTime;
        return formatDateTime(arrivalTime);
      },
      sortable: true,
    },
    {
      id: "totalPrice",
      header: "Price",
      cell: (row) => {
        const flight = row.flight;
        if (!flight || !flight.price) {
          return <span className="text-muted-foreground">N/A</span>;
        }
        const priceValue = typeof flight.price === "object" && flight.price !== null && "parsedValue" in flight.price
          ? flight.price.parsedValue
          : typeof flight.price === "number"
          ? flight.price
          : 0;
        return formatCurrency(priceValue);
      },
      sortable: true,
    },
    {
      id: "bookingDate",
      header: "Booked On",
      cell: (row) => {
        const bookedAt = row.booked_at || row.bookedAt;
        return formatDateTime(bookedAt);
      },
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => {
        const status = row.status || "N/A";
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              status.toLowerCase() === "confirmed"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : status.toLowerCase() === "pending"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : status.toLowerCase() === "cancelled"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            }`}
          >
            {status}
          </span>
        );
      },
      sortable: true,
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => <TableActions row={row} actions={getActions(row)} />,
    },
  ];

  return (
    <DataTable
      data={bookings}
      columns={columns}
      loading={loading}
      searchPlaceholder="Search bookings by flight number or route..."
      onSearch={onSearch}
      searchValue={searchValue}
      pagination={pagination}
      sorting={sorting}
      emptyMessage="No bookings found"
    />
  );
}
