"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { AirportTable } from "@/components/admin/AirportTable";
import { CreateAirportDialog } from "@/components/admin/CreateAirportDialog";
import { UpdateAirportDialog } from "@/components/admin/UpdateAirportDialog";
import { DeleteAirportDialog } from "@/components/admin/DeleteAirportDialog";
import { AirportService, AirportSearchParams } from "@/services/AirportService";
import { AirportResponse } from "@/types/airport";
import { PaginatedResponse } from "@/types/pagination";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

export default function AdminAirportsPage() {
  const [airports, setAirports] = useState<AirportResponse[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<AirportResponse | null>(null);

  const fetchAirports = useCallback(async () => {
    try {
      setLoading(true);
      const params: AirportSearchParams = {
        page: currentPage - 1,
        size: perPage,
      };

      if (searchValue) {
        params.search = searchValue;
      }

      if (sortColumn && sortDirection) {
        params.sort = `${sortColumn},${sortDirection}`;
      }

      const response = await AirportService.getAirports(params);

      if (!response || !response.data || !response.meta) {
        throw new Error("Invalid response structure from API");
      }

      setAirports(response.data);
      const meta = response.meta as any;
      setTotalPages(meta.totalPages ?? meta.total_pages ?? 1);
      setTotal(meta.total ?? 0);
      const nextPageValue = meta.nextPage ?? meta.next_page;
      const prevPageValue = meta.prevPage ?? meta.prev_page;
      setNextPage(nextPageValue !== undefined ? nextPageValue : null);
      setPrevPage(prevPageValue !== undefined ? prevPageValue : null);
    } catch (error) {
      console.error("Failed to fetch airports:", error);
      if (error instanceof AxiosError) {
        const errorMessage =
          (error.response?.data as any)?.detail ||
          (error.response?.data as any)?.message ||
          "Failed to load airports";
        toast.error("Error", {
          description: errorMessage,
        });
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while loading airports.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchValue, sortColumn, sortDirection]);

  useEffect(() => {
    fetchAirports();
  }, [fetchAirports]);

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

  const handleEdit = (airport: AirportResponse) => {
    setSelectedAirport(airport);
    setUpdateDialogOpen(true);
  };

  const handleDelete = (airport: AirportResponse) => {
    setSelectedAirport(airport);
    setDeleteDialogOpen(true);
  };

  const handleCreate = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    fetchAirports();
  };

  const handleUpdateSuccess = () => {
    fetchAirports();
  };

  const handleDeleteSuccess = () => {
    fetchAirports();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Airports</h1>
          <p className="text-muted-foreground mt-2">
            Manage airports in the system
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Airport
        </Button>
      </div>

      <AirportTable
        airports={airports}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
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

      <CreateAirportDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <UpdateAirportDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        airport={selectedAirport}
        onSuccess={handleUpdateSuccess}
      />

      <DeleteAirportDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        airport={selectedAirport}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
