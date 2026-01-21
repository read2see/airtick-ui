"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { UserTable } from "@/components/admin/UserTable";
import { DeleteUserDialog } from "@/components/admin/DeleteUserDialog";
import { ReactivateUserDialog } from "@/components/admin/ReactivateUserDialog";
import { UserService, UserSearchParams } from "@/services/UserService";
import { UserResponse } from "@/types/user";
import { toast } from "sonner";
import { AxiosError } from "axios";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: UserSearchParams = {
        page: currentPage - 1,
        size: perPage,
      };

      if (searchValue) {
        params.search = searchValue;
      }

      if (sortColumn && sortDirection) {
        params.sort = `${sortColumn},${sortDirection}`;
      }

      const response = await UserService.getUsers(params);

      if (!response || !response.data || !response.meta) {
        throw new Error("Invalid response structure from API");
      }

      setUsers(response.data);
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
          "Failed to load users";
        toast.error("Error", {
          description: errorMessage,
        });
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while loading users.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchValue, sortColumn, sortDirection]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const handleDelete = (user: UserResponse) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    fetchUsers();
    setSelectedUser(null);
  };

  const handleReactivate = (user: UserResponse) => {
    setSelectedUser(user);
    setReactivateDialogOpen(true);
  };

  const handleReactivateSuccess = () => {
    fetchUsers();
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-2">
            Manage users in the system
          </p>
        </div>
      </div>

      <UserTable
        users={users}
        loading={loading}
        onDelete={handleDelete}
        onReactivate={handleReactivate}
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

      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setSelectedUser(null);
          }
        }}
        user={selectedUser}
        onSuccess={handleDeleteSuccess}
      />

      <ReactivateUserDialog
        open={reactivateDialogOpen}
        onOpenChange={(open) => {
          setReactivateDialogOpen(open);
          if (!open) {
            setSelectedUser(null);
          }
        }}
        user={selectedUser}
        onSuccess={handleReactivateSuccess}
      />
    </div>
  );
}
