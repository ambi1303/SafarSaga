import { TokenManager } from './auth-api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface TripFilters {
  destination?: string
  difficulty?: string
  minPrice?: number
  maxPrice?: number
  startDate?: string
  endDate?: string
  isActive?: boolean
  limit?: number
  offset?: number
}

export interface CreateTripData {
  name: string
  description: string
  destination: string
  price: number
  max_capacity: number
  start_date: string
  end_date: string
  difficulty_level?: 'Easy' | 'Moderate' | 'Challenging'
  itinerary?: ItineraryItem[]
  inclusions?: string[]
  exclusions?: string[]
  featured_image_url?: string
  gallery_images?: string[]
}

export interface ItineraryItem {
  day: number
  title: string
  description: string
  activities: string[]
  meals: string[]
  accommodation?: string
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
  created_by_user?: {
    full_name: string
    email: string
  }
  bookings?: Array<{
    id: string
    seats: number
    booking_status: string
    payment_status: string
    user: {
      full_name: string
      email: string
    }
  }>
}

export class TripsService {
  private static getAuthHeaders(): HeadersInit {
    const token = TokenManager.getToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  /**
   * Fetch trips with optional filtering
   */
  static async getTrips(filters: TripFilters = {}): Promise<{
    trips: Trip[]
    total: number
    limit: number
    offset: number
  }> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    // Try backend API first, fallback to frontend API
    try {
      const response = await fetch(`${API_BASE_URL}/events?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        return {
          trips: data.events || [],
          total: data.total || 0,
          limit: filters.limit || 20,
          offset: filters.offset || 0
        }
      }
    } catch (error) {
      console.warn('Backend API not available, using frontend API')
    }

    // Fallback to frontend API
    const response = await fetch(`/api/trips?${params}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch trips')
    }

    return response.json()
  }

  /**
   * Fetch a single trip by ID
   */
  static async getTrip(id: string): Promise<Trip> {
    // Try backend API first, fallback to frontend API
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`)
      
      if (response.ok) {
        const data = await response.json()
        return data.event
      }
    } catch (error) {
      console.warn('Backend API not available, using frontend API')
    }

    // Fallback to frontend API
    const response = await fetch(`/api/trips/${id}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Trip not found')
      }
      throw new Error('Failed to fetch trip')
    }

    const data = await response.json()
    return data.trip
  }

  /**
   * Create a new trip (Admin only)
   */
  static async createTrip(tripData: CreateTripData): Promise<Trip> {
    // Try backend API first, fallback to frontend API
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(tripData)
      })

      if (response.ok) {
        const data = await response.json()
        return data.event
      }
    } catch (error) {
      console.warn('Backend API not available, using frontend API')
    }

    // Fallback to frontend API
    const response = await fetch('/api/trips', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(tripData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create trip')
    }

    const data = await response.json()
    return data.trip
  }

  /**
   * Update a trip (Admin only)
   */
  static async updateTrip(id: string, tripData: Partial<CreateTripData>): Promise<Trip> {
    // Try backend API first, fallback to frontend API
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(tripData)
      })

      if (response.ok) {
        const data = await response.json()
        return data.event
      }
    } catch (error) {
      console.warn('Backend API not available, using frontend API')
    }

    // Fallback to frontend API
    const response = await fetch(`/api/trips/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(tripData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update trip')
    }

    const data = await response.json()
    return data.trip
  }

  /**
   * Delete a trip (Admin only)
   */
  static async deleteTrip(id: string): Promise<void> {
    // Try backend API first, fallback to frontend API
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      })

      if (response.ok) {
        return
      }
    } catch (error) {
      console.warn('Backend API not available, using frontend API')
    }

    // Fallback to frontend API
    const response = await fetch(`/api/trips/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete trip')
    }
  }

  /**
   * Get available destinations
   */
  static async getDestinations(): Promise<string[]> {
    try {
      const { trips } = await this.getTrips({ isActive: true })
      const destinations = [...new Set(trips.map(trip => trip.destination))]
      return destinations.sort()
    } catch (error) {
      throw new Error('Failed to fetch destinations')
    }
  }

  /**
   * Get trip statistics
   */
  static async getTripStats(): Promise<{
    totalTrips: number
    activeTrips: number
    totalBookings: number
    totalRevenue: number
  }> {
    // Try backend API first
    try {
      const response = await fetch(`${API_BASE_URL}/events/stats`, {
        headers: this.getAuthHeaders()
      })

      if (response.ok) {
        return response.json()
      }
    } catch (error) {
      console.warn('Backend API not available, using mock data')
    }

    // Return mock data as fallback
    return {
      totalTrips: 15,
      activeTrips: 12,
      totalBookings: 145,
      totalRevenue: 2850000
    }
  }
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

/**
 * Format date for display
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Calculate trip duration in days
 */
export function getTripDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Check if trip is available for booking
 */
export function isTripAvailable(trip: Trip): boolean {
  const now = new Date()
  const startDate = new Date(trip.start_date)
  const hasCapacity = trip.current_bookings < trip.max_capacity
  const isNotStarted = startDate > now
  
  return trip.is_active && hasCapacity && isNotStarted
}

/**
 * Get trip status
 */
export function getTripStatus(trip: Trip): {
  status: 'available' | 'full' | 'completed' | 'inactive'
  label: string
  color: string
} {
  if (!trip.is_active) {
    return {
      status: 'inactive',
      label: 'Inactive',
      color: 'text-gray-600 bg-gray-100'
    }
  }

  const now = new Date()
  const startDate = new Date(trip.start_date)
  const endDate = new Date(trip.end_date)

  if (endDate < now) {
    return {
      status: 'completed',
      label: 'Completed',
      color: 'text-blue-600 bg-blue-100'
    }
  }

  if (trip.current_bookings >= trip.max_capacity) {
    return {
      status: 'full',
      label: 'Fully Booked',
      color: 'text-red-600 bg-red-100'
    }
  }

  return {
    status: 'available',
    label: 'Available',
    color: 'text-green-600 bg-green-100'
  }
}