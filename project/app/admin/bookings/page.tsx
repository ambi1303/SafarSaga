'use client'

import { useState, useEffect } from 'react'
import { DataTable, Column } from '@/components/admin/DataTable'
import { EmptyState } from '@/components/admin/EmptyState'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, Search, Eye, Edit } from 'lucide-react'
import { BookingsAdminService, BookingListItem } from '@/lib/bookings-admin'
import Link from 'next/link'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 20

  useEffect(() => {
    fetchBookings()
  }, [page, bookingStatusFilter, paymentStatusFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const filters: any = {}
      
      if (bookingStatusFilter !== 'all') {
        filters.booking_status = bookingStatusFilter
      }
      if (paymentStatusFilter !== 'all') {
        filters.payment_status = paymentStatusFilter
      }

      const response = await BookingsAdminService.getBookings(
        filters,
        pageSize,
        (page - 1) * pageSize
      )
      
      setBookings(response.items)
      setTotal(response.total)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      booking.id.toLowerCase().includes(searchLower) ||
      booking.user_name?.toLowerCase().includes(searchLower) ||
      booking.user_email?.toLowerCase().includes(searchLower) ||
      booking.destination_name?.toLowerCase().includes(searchLower)
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const columns: Column<BookingListItem>[] = [
    {
      key: 'id',
      label: 'Booking ID',
      sortable: true,
      render: (booking) => (
        <span className="font-mono text-xs">{booking.id?.slice(0, 8) || 'N/A'}</span>
      ),
    },
    {
      key: 'user_name',
      label: 'User',
      sortable: true,
      render: (booking) => (
        <div>
          <p className="font-medium">{booking.user_name || 'N/A'}</p>
          <p className="text-xs text-gray-500">{booking.user_email}</p>
        </div>
      ),
    },
    {
      key: 'destination_name',
      label: 'Destination',
      sortable: true,
    },
    {
      key: 'travel_date',
      label: 'Travel Date',
      sortable: true,
      render: (booking) => formatDate(booking.travel_date),
    },
    {
      key: 'seats',
      label: 'Seats',
      sortable: true,
    },
    {
      key: 'total_amount',
      label: 'Amount',
      sortable: true,
      render: (booking) => formatCurrency(booking.total_amount),
    },
    {
      key: 'booking_status',
      label: 'Booking Status',
      render: (booking) => (
        <StatusBadge status={booking.booking_status} type="booking" />
      ),
    },
    {
      key: 'payment_status',
      label: 'Payment Status',
      render: (booking) => (
        <StatusBadge status={booking.payment_status} type="payment" />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (booking) => (
        <div className="flex space-x-2">
          <Link href={`/admin/bookings/${booking.id}`}>
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
        <p className="text-gray-600 mt-1">View and manage all bookings</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by ID, user, or destination..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Booking Status Filter */}
          <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Booking Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Status Filter */}
          <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredBookings}
        loading={loading}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
        }}
        keyExtractor={(booking) => booking.id}
        emptyState={
          <EmptyState
            icon={Calendar}
            title="No bookings found"
            description="There are no bookings matching your filters."
          />
        }
      />
    </div>
  )
}
