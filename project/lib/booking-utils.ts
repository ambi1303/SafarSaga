// booking-utils.ts
import { toast } from '@/hooks/use-toast';

export interface BookingPayload {
  // For destination bookings
  destination_id?: string;
  // For trip/event bookings
  event_id?: string;
  seats: number;
  special_requests?: string;
  total_amount?: number;
  travel_date?: string;
  contact_info?: {
    phone: string;
    emergency_contact?: string | null;
  };
}

export async function submitBooking({
  payload,
  token,
  onSuccess,
  onError
}: {
  payload: BookingPayload;
  token: string;
  onSuccess?: (booking: any) => void;
  onError?: (error: any) => void;
}) {
  try {
    // Remove user_id if present (defensive)
    const { user_id, ...cleanPayload } = payload as any;
    // Validate seats
    if (typeof cleanPayload.seats !== 'number' || isNaN(cleanPayload.seats) || cleanPayload.seats < 1) {
      throw new Error('Invalid number of seats.');
    }
    const response = await fetch('http://localhost:8000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(cleanPayload)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Booking failed');
    }
    const booking = await response.json();
    toast({ title: 'Booking Successful', description: 'Your booking has been completed!' });
    if (onSuccess) onSuccess(booking);
    return booking;
  } catch (error) {
    toast({ title: 'Booking Failed', description: error?.message || 'Something went wrong.' });
    if (onError) onError(error);
    throw error;
  }
}
