/**
 * Destinations Service for SafarSaga
 * Handles destination data and operations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface Destination {
  id: string
  name: string
  description?: string
  state?: string
  country: string
  featured_image_url?: string
  gallery_images?: string[]
  difficulty_level?: 'Easy' | 'Moderate' | 'Challenging'
  best_time_to_visit?: string
  popular_activities?: string[]
  average_cost_per_day?: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface DestinationFilters {
  state?: string
  difficulty?: 'Easy' | 'Moderate' | 'Challenging'
  min_cost?: number
  max_cost?: number
  is_active?: boolean
  limit?: number
  offset?: number
}

export interface PaginatedDestinations {
  items: Destination[]
  total: number
  limit: number
  offset: number
  has_next: boolean
  has_prev: boolean
}

export class DestinationsService {
  /**
   * Get all destinations with optional filtering
   */
  static async getDestinations(filters?: DestinationFilters): Promise<PaginatedDestinations> {
    console.log('🔍 Loading destinations from API...')
    
    try {
      // First try to get from destinations API
      const params = new URLSearchParams()
      
      if (filters) {
        if (filters.state) params.append('state', filters.state)
        if (filters.difficulty) params.append('difficulty', filters.difficulty)
        if (filters.min_cost) params.append('min_cost', filters.min_cost.toString())
        if (filters.max_cost) params.append('max_cost', filters.max_cost.toString())
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString())
        if (filters.limit) params.append('limit', filters.limit.toString())
        if (filters.offset) params.append('offset', filters.offset.toString())
      }
      
      // Try destinations API first
      console.log('🌐 Using destinations API...')
      
      let url = `${API_BASE_URL}/api/destinations${params.toString() ? '?' + params.toString() : ''}`
      console.log('🌐 Trying destinations API:', url)
        
        let response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors'
        })
        
        if (response.ok) {
          const destinationsData = await response.json()
          console.log('✅ Destinations API success:', destinationsData)
          
          return {
            items: destinationsData.items || [],
            total: destinationsData.total || 0,
            limit: destinationsData.limit || 20,
            offset: destinationsData.offset || 0,
            has_next: destinationsData.has_next || false,
            has_prev: destinationsData.has_prev || false
          }
        } else {
          console.error('❌ Destinations API failed:', response.status, response.statusText)
          throw new Error(`Destinations API failed: ${response.status}`)
        }
    } catch (error) {
      console.error('❌ API Error:', error)
      console.log('🔄 Falling back to mock destinations...')
      return this.getMockDestinations(filters)
    }
  }

  /**
   * Get destination by ID
   */
  static async getDestination(destinationId: string): Promise<Destination | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/destinations/${destinationId}`)
      
      if (response.ok) {
        const data = await response.json()
        return data
      } else {
        console.error('Failed to fetch destination:', response.statusText)
        return this.getMockDestination(destinationId)
      }
    } catch (error) {
      console.error('Error fetching destination:', error)
      return this.getMockDestination(destinationId)
    }
  }

  /**
   * Search destinations
   */
  static async searchDestinations(query: string, limit: number = 10): Promise<Destination[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/destinations/search/${encodeURIComponent(query)}?limit=${limit}`)
      
      if (response.ok) {
        const data = await response.json()
        return data
      } else {
        console.error('Failed to search destinations:', response.statusText)
        return this.getMockSearchResults(query, limit)
      }
    } catch (error) {
      console.error('Error searching destinations:', error)
      return this.getMockSearchResults(query, limit)
    }
  }

  /**
   * Get destination activities
   */
  static async getDestinationActivities(destinationId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/destinations/${destinationId}/activities`)
      
      if (response.ok) {
        const data = await response.json()
        return data
      } else {
        console.error('Failed to fetch destination activities:', response.statusText)
        return this.getMockActivities(destinationId)
      }
    } catch (error) {
      console.error('Error fetching destination activities:', error)
      return this.getMockActivities(destinationId)
    }
  }

  /**
   * Mock data for fallback
   */
  private static getMockDestinations(filters?: DestinationFilters): PaginatedDestinations {
    const mockDestinations: Destination[] = [
      {
        id: 'dc5a0345-4c66-4f0d-8f65-392493bcf791',
        name: 'Manali',
        description: 'A picturesque hill station in Himachal Pradesh, known for its snow-capped mountains, adventure sports, and scenic beauty.',
        state: 'Himachal Pradesh',
        country: 'India',
        featured_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
        difficulty_level: 'Moderate',
        best_time_to_visit: 'October to June',
        popular_activities: ['Trekking', 'Paragliding', 'River Rafting', 'Skiing', 'Temple Visits'],
        average_cost_per_day: 2500,
        is_active: true
      },
      {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'Goa',
        description: 'Famous for its pristine beaches, vibrant nightlife, Portuguese architecture, and water sports activities.',
        state: 'Goa',
        country: 'India',
        featured_image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2',
        difficulty_level: 'Easy',
        best_time_to_visit: 'November to March',
        popular_activities: ['Beach Activities', 'Water Sports', 'Nightlife', 'Heritage Tours', 'Cruise'],
        average_cost_per_day: 3000,
        is_active: true
      },
      {
        id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        name: 'Kerala Backwaters',
        description: 'Serene network of canals, rivers, and lakes in Kerala, perfect for houseboat cruises and experiencing local culture.',
        state: 'Kerala',
        country: 'India',
        featured_image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944',
        difficulty_level: 'Easy',
        best_time_to_visit: 'September to March',
        popular_activities: ['Houseboat Cruise', 'Ayurvedic Spa', 'Bird Watching', 'Village Tours', 'Fishing'],
        average_cost_per_day: 2800,
        is_active: true
      },
      {
        id: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
        name: 'Ladakh',
        description: 'High-altitude desert region known for its dramatic landscapes, Buddhist monasteries, and adventure activities.',
        state: 'Jammu and Kashmir',
        country: 'India',
        featured_image_url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd',
        difficulty_level: 'Challenging',
        best_time_to_visit: 'May to September',
        popular_activities: ['Motorcycle Tours', 'Trekking', 'Monastery Visits', 'Camping', 'Photography'],
        average_cost_per_day: 3500,
        is_active: true
      },
      {
        id: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
        name: 'Rajasthan',
        description: 'Land of kings featuring majestic palaces, desert landscapes, colorful culture, and rich heritage.',
        state: 'Rajasthan',
        country: 'India',
        featured_image_url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245',
        difficulty_level: 'Easy',
        best_time_to_visit: 'October to March',
        popular_activities: ['Palace Tours', 'Desert Safari', 'Cultural Shows', 'Camel Rides', 'Heritage Walks'],
        average_cost_per_day: 2200,
        is_active: true
      }
    ]

    // Apply filters if provided
    let filteredDestinations = mockDestinations

    if (filters) {
      if (filters.state) {
        filteredDestinations = filteredDestinations.filter(dest => 
          dest.state?.toLowerCase().includes(filters.state!.toLowerCase())
        )
      }
      if (filters.difficulty) {
        filteredDestinations = filteredDestinations.filter(dest => 
          dest.difficulty_level === filters.difficulty
        )
      }
      if (filters.min_cost) {
        filteredDestinations = filteredDestinations.filter(dest => 
          (dest.average_cost_per_day || 0) >= filters.min_cost!
        )
      }
      if (filters.max_cost) {
        filteredDestinations = filteredDestinations.filter(dest => 
          (dest.average_cost_per_day || 0) <= filters.max_cost!
        )
      }
      if (filters.is_active !== undefined) {
        filteredDestinations = filteredDestinations.filter(dest => 
          dest.is_active === filters.is_active
        )
      }
    }

    const limit = filters?.limit || 20
    const offset = filters?.offset || 0
    const paginatedItems = filteredDestinations.slice(offset, offset + limit)

    return {
      items: paginatedItems,
      total: filteredDestinations.length,
      limit,
      offset,
      has_next: offset + limit < filteredDestinations.length,
      has_prev: offset > 0
    }
  }

  private static getMockDestination(destinationId: string): Destination | null {
    const destinations = this.getMockDestinations().items
    return destinations.find(dest => dest.id === destinationId) || null
  }

  private static getMockSearchResults(query: string, limit: number): Destination[] {
    const destinations = this.getMockDestinations().items
    const filtered = destinations.filter(dest => 
      dest.name.toLowerCase().includes(query.toLowerCase()) ||
      dest.description?.toLowerCase().includes(query.toLowerCase()) ||
      dest.state?.toLowerCase().includes(query.toLowerCase())
    )
    return filtered.slice(0, limit)
  }

  private static getMockActivities(destinationId: string): any {
    const destination = this.getMockDestination(destinationId)
    if (!destination) return null

    return {
      destination_id: destination.id,
      destination_name: destination.name,
      popular_activities: destination.popular_activities || [],
      difficulty_level: destination.difficulty_level,
      best_time_to_visit: destination.best_time_to_visit,
      average_cost_per_day: destination.average_cost_per_day
    }
  }
}

/**
 * Destination utilities
 */
export const DestinationUtils = {
  getDifficultyColor: (difficulty?: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 bg-green-100'
      case 'Moderate':
        return 'text-yellow-600 bg-yellow-100'
      case 'Challenging':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  },

  formatCurrency: (amount?: number) => {
    if (!amount) return '₹0'
    return `₹${amount.toLocaleString('en-IN')}`
  },

  getStateAbbreviation: (state?: string) => {
    const abbreviations: { [key: string]: string } = {
      'Himachal Pradesh': 'HP',
      'Goa': 'GA',
      'Kerala': 'KL',
      'Jammu and Kashmir': 'JK',
      'Rajasthan': 'RJ',
      'West Bengal': 'WB',
      'Karnataka': 'KA',
      'Uttarakhand': 'UK',
      'Andaman and Nicobar Islands': 'AN'
    }
    return abbreviations[state || ''] || state?.substring(0, 2).toUpperCase() || 'IN'
  }
}