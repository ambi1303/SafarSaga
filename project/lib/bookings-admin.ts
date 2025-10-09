/**
 * Admin Booking Management Service
 */

import apiClient, { getErrorMessage } from './api-client'

export interface AdminBookingStats {
  total_bookings: number
  total_revenue: number
  pending_bookings: number
  confirmed_bookings: number
  cancelled_bookings: number
  bookings_by_month: MonthlyStats[]
  top_destinations: DestinationStats[]
}

export interface MonthlyStats {
  month: string
  count: number
  revenue: number
}

export interface DestinationStats {
  destination_id: string
  destination_name: string
  booking_count: number
  total_revenue?: number
}

export interface BookingListItem {
  id: string
  user_id: string
  user_name?: string
  user_email?: string
  destination_id: string
  destination_name?: string
  travel_date: string
  seats: number
  total_amount: number
  booking_status: 'pending' | 'confirmed' | 'cancelled'
  payment_status: 'unpaid' | 'paid' | 'refunded'
  created_at: string
  updated_at: string
}

export interface BookingDetails extends BookingListItem {
  special_requests?: string
  contact_info?: {
    phone: string
    email: string
  }
  destination_details?: {
    name: string
    location: string
    package_price: number
  }
}

export interface PaginatedBookings {
  items: BookingListItem[]
  total: number
  limit: number
  offset: number
  has_next: boolean
  has_prev: boolean
}

export interface BookingFilters {
  user_id?: string
  destination_id?: string
  booking_status?: string
  payment_status?: string
  search?: string
}

export class BookingsAdminService {
  /**
   * Get admin booking statistics
   */
  static async getAdminStats(): Promise<AdminBookingStats> {
    try {
      const response = await apiClient.get('/api/bookings/admin/stats')
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get all bookings with filters and pagination
   */
  static async getBookings(
    filters: BookingFilters = {},
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedBookings> {
    try {
      const params: any = { limit, offset }
      
      if (filters.user_id) params.user_id = filters.user_id
      if (filters.destination_id) params.destination_id = filters.destination_id
      if (filters.booking_status) params.booking_status = filters.booking_status
      if (filters.payment_status) params.payment_status = filters.payment_status

      const response = await apiClient.get('/api/bookings/', { params })
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get booking by ID
   */
  static async getBookingById(bookingId: string): Promise<BookingDetails> {
    try {
      const response = await apiClient.get(`/api/bookings/${bookingId}`)
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Update booking status
   */
  static async updateBooking(
    bookingId: string,
    updates: {
      booking_status?: 'pending' | 'confirmed' | 'cancelled'
      payment_status?: 'unpaid' | 'paid' | 'refunded'
      special_requests?: string
    }
  ): Promise<BookingDetails> {
    try {
      const response = await apiClient.patch(`/api/bookings/${bookingId}`, updates)
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(bookingId: string): Promise<void> {
    try {
      await apiClient.patch(`/api/bookings/${bookingId}`, { booking_status: 'cancelled' })
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get bookings by user ID
   */
  static async getBookingsByUser(userId: string): Promise<BookingListItem[]> {
    try {
      const response = await apiClient.get('/api/bookings/', {
        params: { user_id: userId, limit: 100 }
      })
      return response.data.items || []
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }
}
