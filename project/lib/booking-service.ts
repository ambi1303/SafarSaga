/**
 * Comprehensive Booking Service for SafarSaga
 * Handles the complete booking flow from selection to payment
 */

import { TokenManager } from './auth-api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface BookingDestination {
  id: string
  name: string
  destination: string
  location: string
  price: number
  originalPrice?: number
  duration: string
  groupSize: string
  image: string
  description: string
  highlights: string[]
  rating: number
  reviews: number
  category: string
  type?: string
  date?: string
  spotsLeft?: number
}

export interface BookingRequest {
  destinationId: string
  seats: number
  totalAmount?: number // Optional, can be calculated from destination price
  travelDate?: string
  specialRequests?: string
  contactInfo: {
    phone: string
    emergencyContact?: string
  }
}

export interface BookingResponse {
  id: string
  bookingReference: string
  destination: BookingDestination
  seats: number
  totalAmount: number
  bookingStatus: 'pending' | 'confirmed' | 'cancelled'
  paymentStatus: 'unpaid' | 'paid' | 'refunded'
  travelDate?: string
  specialRequests?: string
  contactInfo: {
    phone: string
    emergencyContact?: string
  }
  createdAt: string
  paymentDetails?: {
    method: string
    transactionId?: string
    upiQrCode?: string
  }
}

export interface PaymentRequest {
  bookingId: string
  paymentMethod: 'UPI' | 'Card' | 'NetBanking'
  transactionId?: string
}

export interface UserBookingStats {
  total_bookings: number
  upcoming_trips: number
  completed_trips: number
  total_spent: number
  pending_bookings: number
  cancelled_bookings: number
  average_booking_amount: number
  most_recent_booking?: {
    id: string
    destination_id?: string
    event_id?: string
    travel_date?: string
    total_amount: number
    booking_status: string
    booked_at: string
  }
}

export class BookingService {
  private static getAuthHeaders(): HeadersInit {
    const token = TokenManager.getToken()

    if (!token) {
      throw new Error('Authentication required')
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  /**
   * Create a new booking
   */
  static async createBooking(bookingRequest: BookingRequest): Promise<BookingResponse> {
    console.log('Creating booking with request:', bookingRequest)

    try {
      // Get user info from token if needed
      const token = TokenManager.getToken()
      let user_id = null
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          user_id = payload.sub || payload.user_id
        } catch (e) {
          console.warn('Could not extract user_id from token')
        }
      }

      // Use provided total amount or calculate from seats
      const total_amount = bookingRequest.totalAmount
        ? Number(bookingRequest.totalAmount)
        : Number(bookingRequest.seats) * 5000 // Fallback calculation

      // Prepare payload with proper data types as requested
      const payload = {
        user_id,
        destination_id: bookingRequest.destinationId,
        seats: Number(bookingRequest.seats), // Ensure seats is sent as number
        total_amount: Number(total_amount), // Ensure total_amount is sent as number
        travel_date: bookingRequest.travelDate ? new Date(bookingRequest.travelDate).toISOString() : null,
        contact_info: {
          phone: bookingRequest.contactInfo.phone.trim(),
          emergency_contact: bookingRequest.contactInfo.emergencyContact?.trim() || null
        },
        special_requests: bookingRequest.specialRequests || ''
      }

      // Validate payload before sending
      if (isNaN(payload.seats) || payload.seats < 1 || payload.seats > 10) {
        throw new Error('Invalid number of seats. Please select between 1 and 10 seats.')
      }

      if (isNaN(payload.total_amount) || payload.total_amount <= 0) {
        throw new Error('Invalid total amount. Please check the booking details.')
      }

      // Ensure travel_date is properly formatted if provided
      if (payload.travel_date && isNaN(new Date(payload.travel_date).getTime())) {
        throw new Error('Invalid travel date format.')
      }

      console.log('Sending payload to backend:', payload)

      // Create booking via backend API (direct call to FastAPI)
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      })

      console.log('Backend response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Backend booking created successfully:', data)

        // Transform the backend booking response
        const transformedBooking = this.transformBackendBooking(data)
        return transformedBooking
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Backend booking creation failed:', errorData)
        throw new Error(errorData.detail || errorData.message || `Booking failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to create booking. Please try again.')
    }
  }

  /**
   * Get booking by ID
   */
  static async getBooking(bookingId: string): Promise<BookingResponse> {
    console.log('Fetching booking with ID:', bookingId)

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
        headers: this.getAuthHeaders()
      })

      console.log('Backend response status for booking fetch:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Backend booking fetched successfully:', data)
        return this.transformBackendBooking(data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Backend booking fetch failed:', errorData)
        throw new Error(errorData.detail || errorData.message || `Booking not found: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to fetch booking. Please try again.')
    }
  }

  /**
   * Get user's bookings
   */
  static async getUserBookings(): Promise<BookingResponse[]> {
    console.log('Fetching user bookings from backend')

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        headers: this.getAuthHeaders()
      })

      console.log('User bookings response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Backend bookings data:', data)

        let bookings: BookingResponse[] = []

        // Handle paginated response from backend
        if (data.items && Array.isArray(data.items)) {
          bookings = data.items.map((booking: any) => this.transformBackendBooking(booking))
        }
        // Handle direct array response
        else if (Array.isArray(data)) {
          bookings = data.map((booking: any) => this.transformBackendBooking(booking))
        }

        console.log('Transformed bookings:', bookings.length)
        return bookings
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch user bookings:', errorData)
        throw new Error(errorData.detail || errorData.message || 'Failed to fetch bookings')
      }
    } catch (error) {
      console.error('Error fetching user bookings:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to fetch bookings. Please try again.')
    }
  }

  /**
   * Process payment for booking
   */
  static async processPayment(paymentRequest: PaymentRequest): Promise<BookingResponse> {
    console.log('Processing payment for booking:', paymentRequest.bookingId)

    try {
      // Generate transaction ID if not provided
      const transactionId = paymentRequest.transactionId || this.generateTransactionId()

      const response = await fetch(`${API_BASE_URL}/api/bookings/${paymentRequest.bookingId}/confirm-payment`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          payment_method: paymentRequest.paymentMethod,
          transaction_id: transactionId
        })
      })

      console.log('Payment response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Payment processed successfully:', data)

        // Transform the updated booking
        const updatedBooking = this.transformBackendBooking(data.booking || data)
        return updatedBooking
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Backend payment processing failed:', errorData)
        throw new Error(errorData.detail || errorData.message || `Payment failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Payment processing failed. Please try again.')
    }
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(bookingId: string): Promise<void> {
    console.log('Cancelling booking:', bookingId)

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      })

      console.log('Cancellation response status:', response.status)

      if (response.ok) {
        console.log('Booking cancelled successfully')
        return
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Backend booking cancellation failed:', errorData)
        throw new Error(errorData.detail || errorData.message || `Cancellation failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to cancel booking. Please try again.')
    }
  }

  /**
   * Transform backend booking to our format (updated for destination bookings)
   */
  private static transformBackendBooking(backendBooking: any): BookingResponse {
    // Generate booking reference if not provided
    const bookingReference = backendBooking.booking_reference ||
      this.generateBookingReference(backendBooking.id)

    // Handle destination data (preferred) or event data (fallback)
    const destination = backendBooking.destination || {}
    const event = backendBooking.event || {}

    // Determine the booking item (destination or event)
    const isDestinationBooking = !!backendBooking.destination_id
    const bookingItem = isDestinationBooking ? destination : event

    // Extract contact info from structured data
    const contactInfo = backendBooking.contact_info || {}

    return {
      id: backendBooking.id,
      bookingReference,
      destination: {
        id: backendBooking.destination_id || backendBooking.event_id || 'unknown',
        name: bookingItem.name || backendBooking.destination_name || 'Unknown Destination',
        destination: isDestinationBooking
          ? `${destination.name}, ${destination.state}`
          : event.destination || 'Unknown Location',
        location: isDestinationBooking
          ? `${destination.name}, ${destination.state}`
          : event.destination || 'Unknown Location',
        price: isDestinationBooking
          ? Number(destination.average_cost_per_day || 0)
          : Number(event.price || backendBooking.total_amount / backendBooking.seats || 0),
        originalPrice: undefined, // Destinations don't have original price concept
        duration: isDestinationBooking ? '2N/3D' : this.calculateDuration(event.start_date, event.end_date),
        groupSize: '2-8 people', // Default for destinations
        image: bookingItem.featured_image_url || 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
        description: bookingItem.description || 'Amazing travel experience awaits you',
        highlights: isDestinationBooking
          ? destination.popular_activities || ['Great Experience', 'Professional Guide', 'Memorable Journey']
          : event.inclusions || ['Great Experience', 'Professional Guide', 'Memorable Journey'],
        rating: 4.8, // Default rating for destinations
        reviews: 100, // Default reviews
        category: bookingItem.difficulty_level || 'Adventure'
      },
      seats: Number(backendBooking.seats || 1),
      totalAmount: Number(backendBooking.total_amount || 0),
      bookingStatus: backendBooking.booking_status || 'pending',
      paymentStatus: backendBooking.payment_status || 'unpaid',
      travelDate: backendBooking.travel_date || event.start_date,
      specialRequests: backendBooking.special_requests,
      contactInfo: {
        phone: contactInfo.phone || backendBooking.contact_phone || '',
        emergencyContact: contactInfo.emergency_contact || backendBooking.emergency_contact
      },
      createdAt: backendBooking.booked_at || backendBooking.created_at || new Date().toISOString(),
      paymentDetails: backendBooking.transaction_id ? {
        method: backendBooking.payment_method || 'UPI',
        transactionId: backendBooking.transaction_id,
        upiQrCode: backendBooking.upi_qr_code
      } : undefined
    }
  }

  /**
   * Generate booking reference
   */
  private static generateBookingReference(bookingId: string): string {
    const prefix = 'SS'
    const timestamp = Date.now().toString().slice(-6)
    const idSuffix = bookingId.slice(-4).toUpperCase()
    return `${prefix}${timestamp}${idSuffix}`
  }

  /**
   * Get optimized user booking statistics
   */
  static async getUserBookingStats(): Promise<UserBookingStats> {
    console.log('Fetching optimized user booking statistics')

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/stats`, {
        headers: this.getAuthHeaders()
      })

      console.log('Stats response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('User booking stats:', data)
        return data
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch booking stats:', errorData)
        throw new Error(errorData.detail || errorData.message || 'Failed to fetch booking statistics')
      }
    } catch (error) {
      console.error('Error fetching booking stats:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to fetch booking statistics. Please try again.')
    }
  }

  /**
   * Utility functions
   */
  private static generateTransactionId(): string {
    return 'TXN' + Date.now().toString() + Math.random().toString(36).substring(2, 7).toUpperCase()
  }

  private static calculateDuration(startDate?: string, endDate?: string): string {
    if (!startDate || !endDate) return '2N/3D'

    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const nights = diffDays - 1

    return `${nights}N/${diffDays}D`
  }
}

/**
 * Booking status utilities
 */
export const BookingUtils = {
  getStatusColor: (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  },

  getPaymentStatusColor: (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100'
      case 'unpaid':
        return 'text-red-600 bg-red-100'
      case 'refunded':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  },

  canCancelBooking: (booking: BookingResponse) => {
    if (booking.bookingStatus === 'cancelled') return false

    const travelDate = new Date(booking.travelDate || Date.now() + 86400000 * 7)
    const now = new Date()
    const hoursUntilTravel = (travelDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    return hoursUntilTravel >= 48 // Can cancel up to 48 hours before travel
  },

  calculateRefund: (booking: BookingResponse) => {
    if (booking.paymentStatus !== 'paid') return 0

    const travelDate = new Date(booking.travelDate || Date.now() + 86400000 * 7)
    const now = new Date()
    const hoursUntilTravel = (travelDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilTravel >= 168) { // 7 days
      return booking.totalAmount * 0.9 // 90% refund
    } else if (hoursUntilTravel >= 72) { // 3 days
      return booking.totalAmount * 0.7 // 70% refund
    } else if (hoursUntilTravel >= 48) { // 2 days
      return booking.totalAmount * 0.5 // 50% refund
    }

    return 0 // No refund for cancellations within 48 hours
  }
}