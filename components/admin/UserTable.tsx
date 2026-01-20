"use client";

import * as React from "react";
import { UserResponse } from "@/types/user";
import { DataTable, Column } from "@/components/ui/data-table";
import { TableActions, TableAction } from "@/components/admin/TableActions";
import { Trash2 } from "lucide-react";

interface UserTableProps {
  users: UserResponse[];
  loading?: boolean;
  onDelete?: (user: UserResponse) => void;
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

export function UserTable({
  users,
  loading = false,
  onDelete,
  searchValue = "",
  onSearch,
  pagination,
  sorting,
}: UserTableProps) {
  const getActions = (row: UserResponse): TableAction<UserResponse>[] => {
    const actions: TableAction<UserResponse>[] = [];
    
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

  return (
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
  );
}
