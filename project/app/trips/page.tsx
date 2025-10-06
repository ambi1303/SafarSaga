'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Users, 
  Star,
  Clock,
  Mountain,
  Loader2
} from 'lucide-react'
import { TripsService, Trip, formatPrice, formatDate, getTripDuration, getTripStatus } from '@/lib/trips'

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    destination: '',
    difficulty: '',
    minPrice: '',
    maxPrice: '',
    startDate: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const response = await TripsService.getTrips({
        isActive: true,
        limit: 50
      })
      setTrips(response.trips)
    } catch (err) {
      setError('Failed to load trips. Please try again.')
      console.error('Error fetching trips:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      const response = await TripsService.getTrips({
        destination: searchQuery || filters.destination || undefined,
        difficulty: filters.difficulty || undefined,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        startDate: filters.startDate || undefined,
        isActive: true,
        limit: 50
      })
      setTrips(response.trips)
    } catch (err) {
      setError('Failed to search trips. Please try again.')
      console.error('Error searching trips:', err)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilters({
      destination: '',
      difficulty: '',
      minPrice: '',
      maxPrice: '',
      startDate: ''
    })
    fetchTrips()
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />
      case 'Moderate':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />
      case 'Challenging':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Discover Amazing Trips
            </h1>
            <p className="text-xl lg:text-2xl text-orange-100 max-w-3xl mx-auto">
              Explore incredible destinations across India with our expertly crafted travel packages
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            {/* Search Button */}
            <Button 
              onClick={handleSearch}
              className="bg-orange-500 hover:bg-orange-600 lg:w-auto"
            >
              Search
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination
                  </label>
                  <Input
                    type="text"
                    placeholder="Any destination"
                    value={filters.destination}
                    onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Any difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Challenging">Challenging</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price (₹)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price (₹)
                  </label>
                  <Input
                    type="number"
                    placeholder="100000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
            <p className="text-gray-600">Loading amazing trips...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md max-w-md mx-auto">
              {error}
            </div>
          </div>
        )}

        {/* Trips Grid */}
        {!loading && !error && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {trips.length} {trips.length === 1 ? 'Trip' : 'Trips'} Available
              </h2>
            </div>

            {trips.length === 0 ? (
              <div className="text-center py-12">
                <Mountain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or check back later for new trips.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.map((trip) => {
                  const status = getTripStatus(trip)
                  const duration = getTripDuration(trip.start_date, trip.end_date)
                  
                  return (
                    <div key={trip.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      {/* Trip Image */}
                      <div className="relative h-48">
                        <img
                          src={trip.featured_image_url || '/images/gallery/manali-kasol.JPG'}
                          alt={trip.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop";
                          }}
                        />
                        <div className="absolute top-4 right-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <div className="bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                            {formatPrice(trip.price)}
                          </div>
                        </div>
                      </div>

                      {/* Trip Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {trip.name}
                          </h3>
                          {trip.difficulty_level && (
                            <div className="flex items-center space-x-1 ml-2">
                              {getDifficultyIcon(trip.difficulty_level)}
                              <span className="text-xs text-gray-600">{trip.difficulty_level}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                            {trip.destination}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2 text-orange-500" />
                            {duration} {duration === 1 ? 'day' : 'days'}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2 text-orange-500" />
                            {trip.max_capacity - trip.current_bookings} spots left
                          </div>
                        </div>

                        {trip.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {trip.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">4.8 (124 reviews)</span>
                          </div>
                          <Link href={`/trips/${trip.id}`}>
                            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}