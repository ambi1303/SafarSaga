'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Phone,
  CreditCard,
  Download,
  Share2,
  MessageCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Loader2
} from 'lucide-react'
import { BookingService, BookingResponse, BookingUtils } from '@/lib/booking-service'

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<BookingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchBooking(params.id as string)
    }
  }, [params.id])

  const fetchBooking = async (bookingId: string) => {
    try {
      setLoading(true)
      const bookingData = await BookingService.getBooking(bookingId)
      setBooking(bookingData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!booking || !confirm('Are you sure you want to cancel this booking?')) return

    try {
      setCancelling(true)
      await BookingService.cancelBooking(booking.id)
      
      // Refresh booking data
      await fetchBooking(booking.id)
      
      alert('Booking cancelled successfully')
    } catch (err) {
      alert('Failed to cancel booking: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setCancelling(false)
    }
  }

  const handleShare = async () => {
    if (!booking) return

    const shareData = {
      title: `SafarSaga Booking - ${booking.destination.name}`,
      text: `I've booked an amazing trip to ${booking.destination.name} with SafarSaga! Booking Reference: ${booking.bookingReference}`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`)
        alert('Booking details copied to clipboard!')
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`)
      alert('Booking details copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !booking) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
            <p className="text-gray-600 mb-4">{error || 'The booking you are looking for does not exist.'}</p>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const canCancel = BookingUtils.canCancelBooking(booking)
  const refundAmount = BookingUtils.calculateRefund(booking)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
                <p className="text-gray-600 mt-1">
                  Reference: <span className="font-mono font-medium">{booking.bookingReference}</span>
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Status */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Booking Status</h2>
                    <div className="flex gap-2">
                      <Badge className={BookingUtils.getStatusColor(booking.bookingStatus)}>
                        {booking.bookingStatus === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {booking.bookingStatus === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {booking.bookingStatus === 'cancelled' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                      </Badge>
                      <Badge className={BookingUtils.getPaymentStatusColor(booking.paymentStatus)}>
                        {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {booking.bookingStatus === 'confirmed' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="font-medium text-green-800">Your booking is confirmed!</p>
                          <p className="text-green-700 text-sm">
                            You will receive detailed travel information 48 hours before your trip.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {booking.bookingStatus === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                        <div>
                          <p className="font-medium text-yellow-800">Booking confirmation pending</p>
                          <p className="text-yellow-700 text-sm">
                            {booking.paymentStatus === 'unpaid' 
                              ? 'Please complete your payment to confirm the booking.'
                              : 'We are processing your booking and will confirm shortly.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trip Details */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Trip Details</h2>
                  
                  <div className="flex gap-4 mb-6">
                    <img
                      src={booking.destination.image}
                      alt={booking.destination.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {booking.destination.name}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {booking.destination.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {booking.destination.duration}
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-2 text-yellow-500 fill-current" />
                          {booking.destination.rating} ({booking.destination.reviews} reviews)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Trip Highlights</h4>
                    <div className="flex flex-wrap gap-2">
                      {booking.destination.highlights.map((highlight, index) => (
                        <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Travel Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Travel Date</h4>
                      <p className="text-gray-600">
                        {booking.travelDate 
                          ? new Date(booking.travelDate).toLocaleDateString('en-IN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'To be confirmed'
                        }
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Number of Travelers</h4>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {booking.seats} person(s)
                      </div>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Special Requests</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {booking.specialRequests}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-3 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Primary Contact</p>
                        <p className="text-gray-600">{booking.contactInfo.phone}</p>
                      </div>
                    </div>
                    
                    {booking.contactInfo.emergencyContact && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-3 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">Emergency Contact</p>
                          <p className="text-gray-600">{booking.contactInfo.emergencyContact}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Summary */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per person:</span>
                      <span>₹{booking.destination.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of travelers:</span>
                      <span>{booking.seats}</span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total Amount:</span>
                        <span className="text-orange-500">₹{booking.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {booking.paymentDetails && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-gray-600">Method: {booking.paymentDetails.method}</span>
                        </div>
                        {booking.paymentDetails.transactionId && (
                          <div className="text-gray-600">
                            Transaction ID: <span className="font-mono text-xs">{booking.paymentDetails.transactionId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                  
                  <div className="space-y-3">
                    <Button className="w-full" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                    
                    {canCancel && (
                      <Button
                        onClick={handleCancelBooking}
                        disabled={cancelling}
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {cancelling ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          'Cancel Booking'
                        )}
                      </Button>
                    )}
                    
                    {canCancel && refundAmount > 0 && (
                      <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                        Refund amount: ₹{refundAmount.toLocaleString()} (after cancellation charges)
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">Customer Support</p>
                      <p className="text-gray-600">+91 9311706027</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">safarsagatrips@gmail.com</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Support Hours</p>
                      <p className="text-gray-600">9:00 AM - 8:00 PM (Mon-Sun)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}