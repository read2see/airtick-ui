"use client";

import * as React from "react";
import { AirportResponse } from "@/types/airport";
import { DataTable, Column } from "@/components/ui/data-table";
import { TableActions, TableAction } from "@/components/admin/TableActions";
import { Edit, Trash2 } from "lucide-react";

interface AirportTableProps {
  airports: AirportResponse[];
  loading?: boolean;
  onEdit?: (airport: AirportResponse) => void;
  onDelete?: (airport: AirportResponse) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    perPage: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    column: string | null;
    direction: "asc" | "desc" | null;
    onSort: (column: string, direction: "asc" | "desc") => void;
  };
}

export function AirportTable({
  airports,
  loading = false,
  onEdit,
  onDelete,
  searchValue = "",
  onSearch,
  pagination,
  sorting,
}: AirportTableProps) {
  const getActions = (row: AirportResponse): TableAction<AirportResponse>[] => {
    const actions: TableAction<AirportResponse>[] = [];
    
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

  const columns: Column<AirportResponse>[] = [
    {
      id: "id",
      header: "ID",
      accessorKey: "id",
      sortable: true,
    },
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      sortable: true,
    },
    {
      id: "code",
      header: "Code",
      accessorKey: "code",
      sortable: true,
    },
    {
      id: "country",
      header: "Country",
      accessorKey: "country",
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
      data={airports}
      columns={columns}
      loading={loading}
      searchPlaceholder="Search by name, code, or country..."
      onSearch={onSearch}
      searchValue={searchValue}
      pagination={pagination}
      sorting={sorting}
      emptyMessage="No airports found"
    />
  );
}
