import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Trip {
  id: string
  name: string
  description: string
  destination: string
  price: number
  max_capacity: number
  current_bookings: number
  start_date: string
  end_date: string
  itinerary?: ItineraryItem[]
  inclusions?: string[]
  exclusions?: string[]
  difficulty_level?: string
  featured_image_url?: string
  gallery_images?: string[]
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface ItineraryItem {
  day: number
  title: string
  description: string
  activities: string[]
  meals: string[]
  accommodation?: string
}

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
  user?: User
  event?: Trip
}

export interface GalleryImage {
  id: string
  cloudinary_public_id: string
  url: string
  filename: string
  alt_text: string
  caption: string
  description: string
  tags: string[]
  event_id?: string
  uploaded_by: string
  is_featured: boolean
  uploaded_at: string
  
  // Populated fields
  event?: Trip
  uploader?: User
}