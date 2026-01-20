"use client";

import * as React from "react";
import { FlightResponse } from "@/types/flight";
import { AirportResponse } from "@/types/airport";
import { DataTable, Column } from "@/components/ui/data-table";
import { TableActions, TableAction } from "@/components/admin/TableActions";
import { Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

interface FlightTableProps {
  flights: FlightResponse[];
  airports?: Map<number, AirportResponse>;
  loading?: boolean;
  onEdit?: (flight: FlightResponse) => void;
  onDelete?: (flight: FlightResponse) => void;
  onView?: (flight: FlightResponse) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
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


export function FlightTable({
  flights,
  airports,
  loading = false,
  onEdit,
  onDelete,
  onView,
  searchValue = "",
  onSearch,
  pagination,
  sorting,
}: FlightTableProps) {
  const getActions = (row: FlightResponse): TableAction<FlightResponse>[] => {
    const actions: TableAction<FlightResponse>[] = [];
    
    if (onView) {
      actions.push({
        label: "View",
        icon: Eye,
        onClick: onView,
        variant: "default",
      });
    }
    
    if (onEdit) {
      actions.push({
        label: "Edit",
        icon: Edit,
        onClick: onEdit,
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

  const columns: Column<FlightResponse>[] = [
    {
      id: "id",
      header: "ID",
      accessorKey: "id",
      sortable: true,
    },
    {
      id: "origin",
      header: "Origin",
      cell: (row) => {
        const originAirportObj = row.originAirport || row.origin_airport;
        if (originAirportObj && typeof originAirportObj === "object") {
          return (
            <div>
              <div className="font-medium">
                {originAirportObj.code || "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">
                {originAirportObj.name || ""}
              </div>
            </div>
          );
        }
        const originAirportId = row.origin_airport_id ?? row.originAirportId;
        const originAirport = airports?.get(originAirportId);
        if (originAirport) {
          return (
            <div>
              <div className="font-medium">{originAirport.code}</div>
              <div className="text-xs text-muted-foreground">
                {originAirport.name}
              </div>
            </div>
          );
        }
        return (
          <span className="text-muted-foreground">
            ID: {originAirportId}
          </span>
        );
      },
      sortable: false,
    },
    {
      id: "destination",
      header: "Destination",
      cell: (row) => {
        const destinationAirportObj = row.destinationAirport || row.destination_airport;
        if (destinationAirportObj && typeof destinationAirportObj === "object") {
          return (
            <div>
              <div className="font-medium">
                {destinationAirportObj.code || "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">
                {destinationAirportObj.name || ""}
              </div>
            </div>
          );
        }
        const destinationAirportId = row.destination_airport_id ?? row.destinationAirportId;
        const destinationAirport = airports?.get(destinationAirportId);
        if (destinationAirport) {
          return (
            <div>
              <div className="font-medium">{destinationAirport.code}</div>
              <div className="text-xs text-muted-foreground">
                {destinationAirport.name}
              </div>
            </div>
          );
        }
        return (
          <span className="text-muted-foreground">
            ID: {destinationAirportId}
          </span>
        );
      },
      sortable: false,
    },
    {
      id: "departureTime",
      header: "Departure",
      cell: (row) => formatDateTime(row.departure_time ?? row.departureTime),
      sortable: true,
    },
    {
      id: "arrivalTime",
      header: "Arrival",
      cell: (row) => formatDateTime(row.arrival_time ?? row.arrivalTime),
      sortable: true,
    },
    {
      id: "price",
      header: "Price",
      cell: (row) => {
        const priceValue =
          typeof row.price === "object" && row.price !== null && "parsedValue" in row.price
            ? row.price.parsedValue
            : typeof row.price === "number"
            ? row.price
            : 0;
        return formatCurrency(priceValue);
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
      data={flights}
      columns={columns}
      loading={loading}
      searchPlaceholder="Search flights..."
      onSearch={onSearch}
      searchValue={searchValue}
      pagination={pagination}
      sorting={sorting}
      emptyMessage="No flights found"
    />
  );
}
