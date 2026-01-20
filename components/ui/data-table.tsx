"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight, Search, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  searchValue?: string;
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
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchPlaceholder = "Search...",
  onSearch,
  searchValue = "",
  pagination,
  sorting,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  const [localSearchValue, setLocalSearchValue] = React.useState(searchValue);
  const lastSentValueRef = React.useRef<string>(searchValue);
  const isInternalUpdateRef = React.useRef(false);

  React.useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }
    if (searchValue !== lastSentValueRef.current) {
      setLocalSearchValue(searchValue);
      lastSentValueRef.current = searchValue;
    }
  }, [searchValue]);

  React.useEffect(() => {
    if (!onSearch) return;
    if (localSearchValue === lastSentValueRef.current) return;

    const timer = setTimeout(() => {
      lastSentValueRef.current = localSearchValue;
      isInternalUpdateRef.current = true;
      onSearch(localSearchValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchValue, onSearch]);

  const handleSort = (columnId: string) => {
    if (!sorting) return;

    const newDirection =
      sorting.column === columnId && sorting.direction === "asc"
        ? "desc"
        : "asc";
    sorting.onSort(columnId, newDirection);
  };

  return (
    <div className="space-y-4">
      {onSearch && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={localSearchValue}
              onChange={(e) => setLocalSearchValue(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}

      <div className="rounded-md border transition-opacity duration-200">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id}>
                  {column.sortable && sorting ? (
                    <button
                      onClick={() => handleSort(column.id)}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      {column.header}
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      {column.cell
                        ? column.cell(row)
                        : column.accessorKey
                        ? String(row[column.accessorKey] ?? "")
                        : ""}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {pagination.total > 0 && pagination.perPage > 0 && pagination.currentPage > 0 ? (
                <>
                  Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to{" "}
                  {Math.min(
                    pagination.currentPage * pagination.perPage,
                    pagination.total
                  )}{" "}
                  of {pagination.total} results
                </>
              ) : (
                "No results"
              )}
            </div>
            {pagination.onPerPageChange && (
              <div className="flex items-center gap-2">
                <label htmlFor="page-size" className="text-sm text-muted-foreground">
                  Rows per page:
                </label>
                <select
                  id="page-size"
                  value={pagination.perPage}
                  onChange={(e) => {
                    const newPerPage = Number(e.target.value);
                    pagination.onPerPageChange?.(newPerPage);
                  }}
                  className="h-8 rounded-md border border-input bg-background px-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                >
                  {(pagination.pageSizeOptions || [10, 25, 50, 100]).map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  asButton
                  onClick={() => {
                    if (pagination.prevPage != null) {
                      pagination.onPageChange(pagination.prevPage);
                    }
                  }}
                  disabled={pagination.prevPage == null}
                />
              </PaginationItem>

              {pagination.totalPages > 0 && (() => {
                const pages: (number | "ellipsis")[] = [];
                const currentPage = pagination.currentPage;
                const totalPages = pagination.totalPages;
                const maxVisible = 7;

                if (totalPages <= maxVisible) {
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  if (currentPage <= 3) {
                    for (let i = 1; i <= 4; i++) {
                      pages.push(i);
                    }
                    pages.push("ellipsis");
                    pages.push(totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    pages.push(1);
                    pages.push("ellipsis");
                    for (let i = totalPages - 3; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    pages.push(1);
                    pages.push("ellipsis");
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                      pages.push(i);
                    }
                    pages.push("ellipsis");
                    pages.push(totalPages);
                  }
                }

                return pages.map((page, index) => (
                  <PaginationItem key={page === "ellipsis" ? `ellipsis-${index}` : page}>
                    {page === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        asButton
                        onClick={() => {
                          pagination.onPageChange(page);
                        }}
                        isActive={page === currentPage}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ));
              })()}

              <PaginationItem>
                <PaginationNext
                  asButton
                  onClick={() => {
                    if (pagination.nextPage != null) {
                      pagination.onPageChange(pagination.nextPage);
                    }
                  }}
                  disabled={pagination.nextPage == null}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
