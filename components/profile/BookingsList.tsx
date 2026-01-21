"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function BookingsList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 py-4">
          <Link href="/customer/bookings">
            <Button variant="outline">
              View Booking History
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
