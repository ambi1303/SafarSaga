/**
 * Admin Payment Management Service
 */

import adminApi, { getErrorMessage } from './admin-api'

export interface PaymentInfo {
  booking_id: string
  amount: number
  currency: string
  payment_method?: string
  transaction_id?: string
  payment_date?: string
  payment_confirmed_at?: string
  payer_name: string
  payer_email: string
  payment_proof_url?: string
  notes?: string
}

export interface PaymentListItem {
  booking_id: string
  id: string
  user_name?: string
  user_email?: string
  destination_name?: string
  amount: number
  payment_status: 'unpaid' | 'paid' | 'refunded'
  payment_method?: string
  transaction_id?: string
  payment_date?: string
  created_at: string
}

export class PaymentsAdminService {
  /**
   * Get payment info for a booking
   */
  static async getPaymentInfo(bookingId: string): Promise<PaymentInfo> {
    try {
      const response = await adminApi.get(`/api/bookings/${bookingId}/payment-info`)
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Confirm payment for a booking
   */
  static async confirmPayment(bookingId: string): Promise<void> {
    try {
      await adminApi.post(`/api/bookings/${bookingId}/confirm-payment`)
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get all payments (bookings with payment info)
   */
  static async getPayments(
    paymentStatus?: 'unpaid' | 'paid' | 'refunded',
    limit: number = 20,
    offset: number = 0
  ): Promise<{ items: PaymentListItem[]; total: number }> {
    try {
      const params: any = { limit, offset }
      if (paymentStatus) {
        params.payment_status = paymentStatus
      }

      const response = await adminApi.get('/api/bookings/', { params })
      
      // Map booking data to payment format
      const items = (response.data.items || []).map((booking: any) => ({
        ...booking,
        booking_id: booking.id,
        amount: booking.total_amount,
      }))
      
      return {
        items,
        total: response.data.total || 0
      }
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Reject payment (cancel booking with rejection reason)
   */
  static async rejectPayment(
    bookingId: string,
    reason: string
  ): Promise<void> {
    try {
      await adminApi.post(`/api/bookings/${bookingId}/reject-payment`, {
        reason
      })
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }
}
