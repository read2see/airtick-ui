"use client";

import * as React from "react";
import { Booking } from "@/types/booking";
import { AirportResponse } from "@/types/airport";
import { DataTable, Column } from "@/components/ui/data-table";
import { TableActions, TableAction } from "@/components/admin/TableActions";
import { Eye, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Combobox } from "@/components/ui/combobox";

interface BookingTableProps {
  bookings: Booking[];
  airports?: Map<number, AirportResponse>;
  loading?: boolean;
  onView?: (booking: Booking) => void;
  onConfirm?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  onDelete?: (booking: Booking) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
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

const formatCurrency = (amount: number | { source: string; parsedValue: number } | undefined) => {
  if (!amount) {
    return <span className="text-muted-foreground">N/A</span>;
  }
  const value = typeof amount === "object" && amount !== null && "parsedValue" in amount
    ? amount.parsedValue
    : typeof amount === "number"
    ? amount
    : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
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

const getStatusBadge = (status: string) => {
  const statusLower = status?.toLowerCase() || "";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
        statusLower === "confirmed"
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : statusLower === "pending"
          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          : statusLower === "cancelled"
          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          : statusLower === "completed"
          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      }`}
    >
      {status}
    </span>
  );
};

export function BookingTable({
  bookings,
  airports,
  loading = false,
  onView,
  onConfirm,
  onCancel,
  onDelete,
  searchValue = "",
  onSearch,
  statusFilter,
  onStatusFilterChange,
  pagination,
  sorting,
}: BookingTableProps) {
  const getActions = (row: Booking): TableAction<Booking>[] => {
    const actions: TableAction<Booking>[] = [];
    const statusLower = row.status?.toLowerCase() || "";
    
    if (onView) {
      actions.push({
        label: "View",
        icon: Eye,
        onClick: onView,
        variant: "default",
      });
    }
    
    if (onConfirm && statusLower !== "confirmed" && statusLower !== "cancelled" && statusLower !== "completed") {
      actions.push({
        label: "Confirm",
        icon: CheckCircle2,
        onClick: onConfirm,
        variant: "default",
      });
    }
    
    if (onCancel && statusLower !== "cancelled" && statusLower !== "completed") {
      actions.push({
        label: "Cancel",
        icon: XCircle,
        onClick: onCancel,
        variant: "default",
      });
    }
    
    if (onDelete) {
      actions.push({
        label: "Delete",
        icon: Trash2,
        onClick: onDelete,
        variant: "destructive",
      });
    }
    
    return actions;
  };

  const columns: Column<Booking>[] = [
    {
      id: "id",
      header: "ID",
      accessorKey: "id",
      sortable: true,
    },
    {
      id: "customer",
      header: "Customer",
      cell: (row) => {
        const user = row.user;
        if (user) {
          const email = user.email_address ?? user.emailAddress ?? user.email ?? "N/A";
          const firstName = user.user_profile?.first_name ?? user.user_profile?.firstName ?? user.userProfile?.first_name ?? user.userProfile?.firstName;
          const lastName = user.user_profile?.last_name ?? user.user_profile?.lastName ?? user.userProfile?.last_name ?? user.userProfile?.lastName;
          const name = firstName || lastName ? `${firstName || ""} ${lastName || ""}`.trim() : null;
          
          return (
            <div>
              <div className="font-medium">{email}</div>
              {name && (
                <div className="text-xs text-muted-foreground">{name}</div>
              )}
            </div>
          );
        }
        const userId = row.userId ?? row.user_id;
        return (
          <span className="text-muted-foreground">
            User ID: {userId ?? "N/A"}
          </span>
        );
      },
      sortable: false,
    },
    {
      id: "flight",
      header: "Flight",
      cell: (row) => {
        const flight = row.flight;
        if (!flight) {
          const flightId = row.flightId ?? row.flight_id;
          return (
            <span className="text-muted-foreground">
              Flight ID: {flightId ?? "N/A"}
            </span>
          );
        }

        const originAirportObj = flight.originAirport || flight.origin_airport;
        const destinationAirportObj = flight.destinationAirport || flight.destination_airport;
        
        let originCode = "N/A";
        let destinationCode = "N/A";
        
        if (originAirportObj && typeof originAirportObj === "object") {
          originCode = originAirportObj.code || "N/A";
        } else {
          const originAirportId = flight.origin_airport_id ?? flight.originAirportId;
          const originAirport = airports?.get(originAirportId);
          if (originAirport) {
            originCode = originAirport.code;
          }
        }
        
        if (destinationAirportObj && typeof destinationAirportObj === "object") {
          destinationCode = destinationAirportObj.code || "N/A";
        } else {
          const destinationAirportId = flight.destination_airport_id ?? flight.destinationAirportId;
          const destinationAirport = airports?.get(destinationAirportId);
          if (destinationAirport) {
            destinationCode = destinationAirport.code;
          }
        }

        return (
          <div>
            <div className="font-medium">
              {originCode} → {destinationCode}
            </div>
            {flight.departure_time && (
              <div className="text-xs text-muted-foreground">
                {formatDateTime(flight.departure_time)}
              </div>
            )}
          </div>
        );
      },
      sortable: false,
    },
    {
      id: "bookedAt",
      header: "Booking Date",
      cell: (row) => formatDateTime(row.bookedAt ?? row.booked_at),
      sortable: true,
    },
    {
      id: "price",
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
      id: "status",
      header: "Status",
      cell: (row) => getStatusBadge(row.status),
      sortable: true,
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => <TableActions row={row} actions={getActions(row)} />,
    },
  ];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "CONFIRMED", label: "Confirmed" },
  ];

  return (
    <div className="space-y-4">
      {onStatusFilterChange && (
        <div className="flex items-center gap-2 flex-wrap">
          <Combobox
            options={statusOptions}
            value={statusFilter ?? "all"}
            onValueChange={(value) => onStatusFilterChange(value === "all" ? "" : String(value))}
            placeholder="Filter by status"
            className="w-[180px]"
          />
        </div>
      )}

      <DataTable
        data={bookings}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search by booking ID, customer email, or flight number..."
        onSearch={onSearch}
        searchValue={searchValue}
        pagination={pagination}
        sorting={sorting}
        emptyMessage="No bookings found"
      />
    </div>
  );
}
