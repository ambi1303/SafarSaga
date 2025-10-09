import { TokenManager } from './auth-api'
import apiClient, { getErrorMessage } from './api-client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface Booking {
  id: string
  user_id: string
  event_id: string
  seats: number
  total_amount: number
  booking_status: 'pending' | 'confirmed' | 'cancelled'
  payment_status: 'unpaid' | 'paid' | 'refunded'
  payment_method?: string
  transaction_id?: string
  upi_qr_code?: string
  special_requests?: string
  booked_at: string
  payment_confirmed_at?: string
  
  // Populated fields
  user?: {
    id: string
    full_name: string
    email: string
    phone?: string
  }
  event?: {
    id: string
    name: string
    description?: string
    destination: string
    start_date: string
    end_date: string
    price: number
    max_capacity: number
    current_bookings: number
    featured_image_url?: string
    difficulty_level?: string
    itinerary?: any[]
    inclusions?: string[]
    exclusions?: string[]
  }
}

export interface CreateBookingData {
  event_id: string
  seats: number
  special_requests?: string
}

export interface BookingFilters {
  userId?: string
  eventId?: string
  status?: 'pending' | 'confirmed' | 'cancelled'
  paymentStatus?: 'unpaid' | 'paid' | 'refunded'
}

export class BookingsService {
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
   * Fetch bookings with optional filtering
   */
  static async getBookings(filters: BookingFilters = {}): Promise<Booking[]> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    const response = await apiClient.get(`/api/bookings?${params}`)
    return response.data.bookings || response.data
  }

  /**
   * Fetch a single booking by ID
   */
  static async getBooking(id: string): Promise<Booking> {
    const response = await apiClient.get(`/api/bookings/${id}`)
    return response.data.booking || response.data
  }

  /**
   * Create a new booking
   */
  static async createBooking(bookingData: CreateBookingData): Promise<Booking> {
    const response = await apiClient.post('/api/bookings', bookingData)
    return response.data.booking || response.data
  }

  /**
   * Update a booking
   */
  static async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    const response = await apiClient.patch(`/api/bookings/${id}`, updates)
    return response.data.booking || response.data
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(id: string): Promise<void> {
    await apiClient.patch(`/api/bookings/${id}`, { booking_status: 'cancelled' })
  }

  /**
   * Submit payment information for a booking
   */
  static async submitPayment(
    bookingId: string, 
    transactionId: string, 
    paymentMethod: string = 'UPI'
  ): Promise<Booking> {
    return this.updateBooking(bookingId, {
      transaction_id: transactionId,
      payment_method: paymentMethod,
      payment_status: 'paid' // This will be verified by admin
    })
  }

  /**
   * Get booking statistics (admin only)
   */
  static async getBookingStats(): Promise<{
    totalBookings: number
    pendingBookings: number
    confirmedBookings: number
    cancelledBookings: number
    totalRevenue: number
    pendingPayments: number
  }> {
    const response = await apiClient.get('/api/bookings/admin/stats')
    return response.data
  }
}

/**
 * Get booking status display information
 */
export function getBookingStatusInfo(booking: Booking): {
  status: string
  label: string
  color: string
  description: string
} {
  const { booking_status, payment_status } = booking

  if (booking_status === 'cancelled') {
    return {
      status: 'cancelled',
      label: 'Cancelled',
      color: 'text-red-600 bg-red-100',
      description: 'This booking has been cancelled'
    }
  }

  if (booking_status === 'confirmed') {
    return {
      status: 'confirmed',
      label: 'Confirmed',
      color: 'text-green-600 bg-green-100',
      description: 'Your booking is confirmed and ready'
    }
  }

  if (payment_status === 'paid') {
    return {
      status: 'payment-pending',
      label: 'Payment Verification',
      color: 'text-blue-600 bg-blue-100',
      description: 'Payment received, awaiting verification'
    }
  }

  return {
    status: 'pending',
    label: 'Payment Pending',
    color: 'text-yellow-600 bg-yellow-100',
    description: 'Awaiting payment to confirm booking'
  }
}

/**
 * Check if booking can be cancelled
 */
export function canCancelBooking(booking: Booking): boolean {
  if (booking.booking_status === 'cancelled') {
    return false
  }

  const now = new Date()
  const tripStart = new Date(booking.event?.start_date || '')
  const hoursUntilTrip = (tripStart.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  return hoursUntilTrip >= 48 // Can cancel up to 48 hours before trip
}

/**
 * Format booking reference number
 */
export function formatBookingReference(booking: Booking): string {
  const date = new Date(booking.booked_at)
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const shortId = booking.id.slice(-6).toUpperCase()
  
  return `SS${year}${month}${shortId}`
}

/**
 * Calculate refund amount based on cancellation policy
 */
export function calculateRefundAmount(booking: Booking): number {
  if (booking.payment_status !== 'paid') {
    return 0
  }

  const now = new Date()
  const tripStart = new Date(booking.event?.start_date || '')
  const hoursUntilTrip = (tripStart.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  // Refund policy
  if (hoursUntilTrip >= 168) { // 7 days
    return booking.total_amount * 0.9 // 90% refund
  } else if (hoursUntilTrip >= 72) { // 3 days
    return booking.total_amount * 0.7 // 70% refund
  } else if (hoursUntilTrip >= 48) { // 2 days
    return booking.total_amount * 0.5 // 50% refund
  }
  
  return 0 // No refund for cancellations within 48 hours
}