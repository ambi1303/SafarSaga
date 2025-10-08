'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Users,
  MapPin,
  Star,
  Clock,
  Phone,
  Plus,
  Minus,
  CreditCard,
  CheckCircle,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { BookingDestination, BookingService, BookingRequest } from '@/lib/booking-service'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  destination: BookingDestination
  onBookingComplete?: (bookingId: string) => void
}

export function BookingModal({
  isOpen,
  onClose,
  destination,
  onBookingComplete
}: BookingModalProps) {
  // Fallback image for destinations without an image
  const DEFAULT_PLACEHOLDER = '/images/placeholder-destination.svg'
  const router = useRouter()
  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Booking form data
  const [seats, setSeats] = useState(1)
  const [travelDate, setTravelDate] = useState('')
  const [phone, setPhone] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')

  // Booking result
  const [bookingResult, setBookingResult] = useState<any>(null)

  const totalAmount = destination.price * seats
  const savings = destination.originalPrice ? (destination.originalPrice - destination.price) * seats : 0

  const handleBookingSubmit = async () => {
    // Validate phone number
    const trimmedPhone = phone.trim()
    if (!trimmedPhone) {
      setError('Phone number is required')
      return
    }

    // Basic phone number validation
    const phoneDigits = trimmedPhone.replace(/[+\-\s]/g, '')
    if (!/^\d{10,15}$/.test(phoneDigits)) {
      setError('Please enter a valid phone number (10-15 digits)')
      return
    }

    // Validate seats input
    const seatsNumber = Number(seats)
    if (isNaN(seatsNumber) || seatsNumber < 1 || seatsNumber > 8) {
      setError('Please enter a valid number of seats (1-8)')
      return
    }

    // Validate emergency contact if provided
    const trimmedEmergencyContact = emergencyContact?.trim()
    if (trimmedEmergencyContact) {
      const emergencyDigits = trimmedEmergencyContact.replace(/[+\-\s]/g, '')
      if (!/^\d{10,15}$/.test(emergencyDigits)) {
        setError('Please enter a valid emergency contact number (10-15 digits)')
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      const bookingRequest: BookingRequest = {
        destinationId: destination.id,
        seats: seatsNumber, // Ensure seats is a number
        totalAmount: totalAmount, // Pass the calculated total amount
        travelDate: travelDate || undefined,
        specialRequests: specialRequests?.trim() || undefined,
        contactInfo: {
          phone: trimmedPhone,
          emergencyContact: trimmedEmergencyContact || undefined
        }
      }

      console.log('Submitting booking request:', bookingRequest)
      const booking = await BookingService.createBooking(bookingRequest)
      setBookingResult(booking)
      setStep('payment')
    } catch (err) {
      console.error('Booking submission error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSubmit = async (paymentMethod: 'UPI' | 'Card' | 'NetBanking') => {
    if (!bookingResult) return

    setLoading(true)
    setError('')

    try {
      const updatedBooking = await BookingService.processPayment({
        bookingId: bookingResult.id,
        paymentMethod,
        transactionId: `TXN${Date.now()}`
      })

      setBookingResult(updatedBooking)
      setStep('confirmation')

      if (onBookingComplete) {
        onBookingComplete(updatedBooking.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('details')
    setSeats(1)
    setTravelDate('')
    setPhone('')
    setEmergencyContact('')
    setSpecialRequests('')
    setBookingResult(null)
    setError('')
    onClose()
  }

  const handleViewBooking = () => {
    if (bookingResult) {
      router.push(`/dashboard/bookings/${bookingResult.id}`)
      handleClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {step === 'details' && 'Book Your Trip'}
              {step === 'payment' && 'Payment Details'}
              {step === 'confirmation' && 'Booking Confirmed!'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Destination Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex gap-4">
            <img
              src={destination.image || DEFAULT_PLACEHOLDER}
              alt={destination.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{destination.name}</h3>
              <div className="flex items-center text-gray-600 text-sm mb-1">
                <MapPin className="h-3 w-3 mr-1" />
                {destination.location}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {destination.duration}
                </div>
                <div className="flex items-center text-gray-600">
                  <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
                  {destination.rating}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-orange-500">
                ₹{destination.price.toLocaleString()}
              </div>
              {destination.originalPrice && (
                <div className="text-sm text-gray-400 line-through">
                  ₹{destination.originalPrice.toLocaleString()}
                </div>
              )}
              <div className="text-xs text-gray-600">per person</div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {step === 'details' && (
          <div className="space-y-6">
            {/* Number of Travelers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Travelers (1-8)
              </label>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium">Travelers</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newSeats = Math.max(1, Number(seats) - 1)
                      setSeats(newSeats)
                    }}
                    className="h-8 w-8 p-0"
                    disabled={Number(seats) <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    value={seats}
                    onChange={(e) => {
                      const value = e.target.value
                      const numValue = Number(value)
                      if (value === '' || (numValue >= 1 && numValue <= 8)) {
                        setSeats(value === '' ? 1 : numValue)
                      }
                    }}
                    className="w-16 text-center font-semibold border-0 p-0 h-8"
                    min="1"
                    max="8"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newSeats = Math.min(8, Number(seats) + 1)
                      setSeats(newSeats)
                    }}
                    className="h-8 w-8 p-0"
                    disabled={Number(seats) >= 8}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Travel Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Travel Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="pl-10"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Contact Information</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="tel"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="+91 9876543210"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests (Optional)
              </label>
              <Textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any dietary requirements, accessibility needs, or special occasions..."
                rows={3}
              />
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Price Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Price per person:</span>
                  <span>₹{destination.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of travelers:</span>
                  <span>{seats}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>You save:</span>
                    <span>₹{savings.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-orange-500">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            <Button
              onClick={handleBookingSubmit}
              disabled={loading || !phone}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Booking...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </div>
        )}

        {step === 'payment' && bookingResult && (
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Booking Created Successfully!</span>
              </div>
              <p className="text-green-700 text-sm">
                Booking Reference: <span className="font-mono font-medium">{bookingResult.bookingReference}</span>
              </p>
            </div>

            {/* Payment Amount */}
            <div className="text-center py-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                ₹{bookingResult.totalAmount.toLocaleString()}
              </div>
              <p className="text-gray-600">Total Amount to Pay</p>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Choose Payment Method</h4>

              <Button
                onClick={() => handlePaymentSubmit('UPI')}
                disabled={loading}
                className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded mr-3 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">UPI</span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">UPI Payment</div>
                    <div className="text-xs text-blue-600">Pay using any UPI app</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handlePaymentSubmit('Card')}
                disabled={loading}
                className="w-full justify-start bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
              >
                <div className="flex items-center">
                  <CreditCard className="w-8 h-8 text-purple-500 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Credit/Debit Card</div>
                    <div className="text-xs text-purple-600">Visa, Mastercard, RuPay</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handlePaymentSubmit('NetBanking')}
                disabled={loading}
                className="w-full justify-start bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded mr-3 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">NB</span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Net Banking</div>
                    <div className="text-xs text-green-600">All major banks supported</div>
                  </div>
                </div>
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            {loading && (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-orange-500" />
                <p className="text-gray-600">Processing payment...</p>
              </div>
            )}
          </div>
        )}

        {step === 'confirmation' && bookingResult && (
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            {/* Success Message */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Booking Confirmed!
              </h3>
              <p className="text-gray-600">
                Your trip to {destination.name} has been successfully booked.
              </p>
            </div>

            {/* Booking Details */}
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Reference:</span>
                  <span className="font-mono font-medium">{bookingResult.bookingReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Travelers:</span>
                  <span className="font-medium">{bookingResult.seats} person(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Paid:</span>
                  <span className="font-medium text-green-600">₹{bookingResult.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <Badge className="bg-green-100 text-green-800">Paid</Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleViewBooking}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                View Booking Details
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full"
              >
                Continue Browsing
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
              📧 A confirmation email has been sent to your registered email address with all the booking details and travel information.
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}