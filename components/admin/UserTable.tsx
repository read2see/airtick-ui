"use client";

import * as React from "react";
import { UserResponse } from "@/types/user";
import { DataTable, Column } from "@/components/ui/data-table";
import { TableActions, TableAction } from "@/components/admin/TableActions";
import { Trash2, RotateCcw } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";

interface UserTableProps {
  users: UserResponse[];
  loading?: boolean;
  onDelete?: (user: UserResponse) => void;
  onReactivate?: (user: UserResponse) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
  filter?: string;
  onFilterChange?: (filter: string) => void;
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

export function UserTable({
  users,
  loading = false,
  onDelete,
  onReactivate,
  searchValue = "",
  onSearch,
  filter,
  onFilterChange,
  pagination,
  sorting,
}: UserTableProps) {
  const getActions = (row: UserResponse): TableAction<UserResponse>[] => {
    const actions: TableAction<UserResponse>[] = [];
    const isActive = row.active !== false;
    
    if (isActive && onDelete) {
      actions.push({
        label: "Delete",
        icon: Trash2,
        onClick: onDelete,
        variant: "destructive",
      });
    } else if (!isActive && onReactivate) {
      actions.push({
        label: "Reactivate",
        icon: RotateCcw,
        onClick: onReactivate,
      });
    }
    
    return actions;
  };

  const columns: Column<UserResponse>[] = [
    {
      id: "id",
      header: "ID",
      accessorKey: "id",
      sortable: true,
    },
    {
      id: "email",
      header: "Email",
      cell: (row) => row.email_address || row.emailAddress || row.email || "N/A",
      sortable: true,
    },
    {
      id: "name",
      header: "Name",
      cell: (row) => {
        const profile = row.user_profile || row.userProfile;
        if (profile) {
          const firstName = profile.first_name || profile.firstName || "";
          const lastName = profile.last_name || profile.lastName || "";
          const fullName = `${firstName} ${lastName}`.trim();
          return fullName || "N/A";
        }
        return <span className="text-muted-foreground">N/A</span>;
      },
      sortable: false,
    },
    {
      id: "role",
      header: "Role",
      cell: (row) => {
        const role = row.role;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              role === "ADMIN"
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            }`}
          >
            {role || "N/A"}
          </span>
        );
      },
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => {
        const isActive = row.active !== false;
        const isVerified = row.email_verified ?? row.emailVerified ?? false;
        return (
          <div className="flex flex-col gap-1">
            <span
              className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                isActive
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
            {!isVerified && (
              <span className="inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Unverified
              </span>
            )}
          </div>
        );
      },
      sortable: false,
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => <TableActions row={row} actions={getActions(row)} />,
    },
  ];

  const filterOptions = [
    { value: "all", label: "All Users" },
    { value: "verified", label: "Verified" },
    { value: "unverified", label: "Unverified" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const getFilterValue = (value: string | number | undefined): string => {
    if (!value || value === "all") return "";
    
    const filterMap: Record<string, string> = {
      verified: "?emailVerified=true",
      unverified: "?emailVerified=false",
      active: "?active=true",
      inactive: "?active=false",
    };
    
    return filterMap[String(value)] || "";
  };

  const getFilterFromQuery = (query: string | undefined): string => {
    if (!query) return "all";
    
    if (query === "?emailVerified=true") return "verified";
    if (query === "?emailVerified=false") return "unverified";
    if (query === "?active=true") return "active";
    if (query === "?active=false") return "inactive";
    
    return "all";
  };

  return (
    <div className="space-y-4">
      {onFilterChange && typeof onFilterChange === "function" && (
        <div className="flex items-center gap-2 flex-wrap">
          <Combobox
            options={filterOptions}
            value={getFilterFromQuery(filter)}
            onValueChange={(value) => {
              if (typeof onFilterChange === "function") {
                onFilterChange(getFilterValue(value));
              }
            }}
            placeholder="Filter users"
            className="w-[180px]"
          />
        </div>
      )}

      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search users by email or name..."
        onSearch={onSearch}
        searchValue={searchValue}
        pagination={pagination}
        sorting={sorting}
        emptyMessage="No users found"
      />
    </div>
  );
}
