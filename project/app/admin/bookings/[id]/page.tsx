'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Calendar, MapPin, User, Phone, Mail, CreditCard, Loader2 } from 'lucide-react'
import { BookingsAdminService, BookingDetails } from '@/lib/bookings-admin'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [newBookingStatus, setNewBookingStatus] = useState<string>('')
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>('')

  useEffect(() => {
    fetchBooking()
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      setLoading(true)
      const data = await BookingsAdminService.getBookingById(bookingId)
      setBooking(data)
      setNewBookingStatus(data.booking_status)
      setNewPaymentStatus(data.payment_status)
    } catch (error) {
      console.error('Error fetching booking:', error)
      toast.error('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!booking) return

    try {
      setUpdating(true)
      await BookingsAdminService.updateBooking(bookingId, {
        booking_status: newBookingStatus as any,
        payment_status: newPaymentStatus as any,
      })
      toast.success('Booking updated successfully')
      fetchBooking()
    } catch (error) {
      console.error('Error updating booking:', error)
      toast.error('Failed to update booking')
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelBooking = async () => {
    try {
      await BookingsAdminService.cancelBooking(bookingId)
      toast.success('Booking cancelled successfully')
      router.push('/admin/bookings')
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Failed to cancel booking')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Booking not found</p>
        <Link href="/admin/bookings">
          <Button className="mt-4">Back to Bookings</Button>
        </Link>
      </div>
    )
  }

  const hasChanges =
    newBookingStatus !== booking.booking_status ||
    newPaymentStatus !== booking.payment_status

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/bookings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
            <p className="text-gray-600 mt-1">ID: {booking.id}</p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={() => setCancelDialogOpen(true)}
          disabled={booking.booking_status === 'cancelled'}
        >
          Cancel Booking
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Booking Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Booking Status</p>
                <div className="mt-1">
                  <StatusBadge status={booking.booking_status} type="booking" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <div className="mt-1">
                  <StatusBadge status={booking.payment_status} type="payment" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Travel Date</p>
                <p className="font-medium mt-1">{formatDate(booking.travel_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Seats</p>
                <p className="font-medium mt-1">{booking.seats}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-medium mt-1">{formatCurrency(booking.total_amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium mt-1">{formatDate(booking.created_at)}</p>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              User Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{booking.user_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{booking.user_email || 'N/A'}</p>
              </div>
              {booking.contact_info?.phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{booking.contact_info.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Destination Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Destination Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Destination</p>
                <p className="font-medium">{booking.destination_name || 'N/A'}</p>
              </div>
              {booking.destination_details && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{booking.destination_details.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cost per Day</p>
                    <p className="font-medium">
                      {formatCurrency(booking.destination_details.average_cost_per_day)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Special Requests */}
          {booking.special_requests && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Special Requests
              </h2>
              <p className="text-gray-700">{booking.special_requests}</p>
            </div>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Update Status
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Booking Status
                </label>
                <Select value={newBookingStatus} onValueChange={setNewBookingStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Payment Status
                </label>
                <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleUpdateStatus}
                disabled={!hasChanges || updating}
                className="w-full"
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link href={`/admin/payments?booking=${bookingId}`}>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  View Payment Info
                </Button>
              </Link>
              <Link href={`/admin/users/${booking.user_id}`}>
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  View User Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Cancel Booking"
        variant="destructive"
        onConfirm={handleCancelBooking}
      />
    </div>
  )
}
