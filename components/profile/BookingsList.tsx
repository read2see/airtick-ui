"use client"

import * as React from "react"
import { BookingService } from "@/services/BookingService"
import { Booking, BookingResponse } from "@/types/booking"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface BookingsListProps {
  initialBookings?: BookingResponse
}

export function BookingsList({ initialBookings }: BookingsListProps) {
  const [bookings, setBookings] = React.useState<Booking[]>(initialBookings?.data || [])
  const [loading, setLoading] = React.useState(!initialBookings)
  const [page, setPage] = React.useState(1)
  const [pagination, setPagination] = React.useState(initialBookings?.pagination)

  React.useEffect(() => {
    if (!initialBookings) {
      loadBookings()
    }
  }, [page])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const response = await BookingService.getUserBookings({ page, size: 10 })
      setBookings(response.data || [])
      setPagination(response.pagination)
    } catch (error) {
      console.error("Failed to load bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === "confirmed" || statusLower === "completed") {
      return "text-green-600 dark:text-green-400"
    }
    if (statusLower === "pending") {
      return "text-yellow-600 dark:text-yellow-400"
    }
    if (statusLower === "cancelled") {
      return "text-red-600 dark:text-red-400"
    }
    return "text-muted-foreground"
  }

  if (loading && bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading bookings...</p>
        </CardContent>
      </Card>
    )
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You don't have any bookings yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {booking.flightNumber || `Booking #${booking.id}`}
                    </h3>
                    <span className={`text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  {booking.origin && booking.destination && (
                    <p className="text-sm text-muted-foreground">
                      {booking.origin} → {booking.destination}
                    </p>
                  )}
                  {booking.departureDate && (
                    <p className="text-sm text-muted-foreground">
                      Departure: {formatDate(booking.departureDate)}
                    </p>
                  )}
                  {booking.bookingDate && (
                    <p className="text-xs text-muted-foreground">
                      Booked on {formatDate(booking.bookingDate)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {booking.totalPrice !== undefined && (
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(booking.totalPrice)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (pagination.totalPages || 1) || loading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
