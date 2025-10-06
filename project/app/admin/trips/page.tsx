'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Loader2
} from 'lucide-react'
import { TripsService, Trip, formatPrice, formatDate, getTripStatus } from '@/lib/trips'

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    isActive: 'all',
    difficulty: '',
    destination: ''
  })

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const response = await TripsService.getTrips({
        isActive: filters.isActive === 'all' ? undefined : filters.isActive === 'active',
        difficulty: filters.difficulty || undefined,
        destination: searchQuery || filters.destination || undefined,
        limit: 100
      })
      setTrips(response.trips)
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchTrips()
  }

  const handleDeleteTrip = async (tripId: string, tripName: string) => {
    if (!confirm(`Are you sure you want to delete "${tripName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await TripsService.deleteTrip(tripId)
      fetchTrips() // Refresh the list
    } catch (error) {
      console.error('Error deleting trip:', error)
      alert('Failed to delete trip. Please try again.')
    }
  }

  const filteredTrips = trips.filter(trip => {
    if (searchQuery) {
      return trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Manage Trips</h1>
                  <p className="text-gray-600">Create, edit, and manage your travel packages</p>
                </div>
              </div>
              <Link href="/admin/trips/new">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="h-4 w-4 mr-2" />
                  New Trip
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search trips by name or destination..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={filters.isActive}
                  onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Trips</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>

                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Challenging">Challenging</option>
                </select>

                <Button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Trips List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {filteredTrips.length} {filteredTrips.length === 1 ? 'Trip' : 'Trips'}
                </h2>
                <div className="text-sm text-gray-600">
                  {trips.filter(t => t.is_active).length} active, {trips.filter(t => !t.is_active).length} inactive
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
                <p className="text-gray-600">Loading trips...</p>
              </div>
            ) : filteredTrips.length === 0 ? (
              <div className="p-12 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {trips.length === 0 ? 'No trips created yet' : 'No trips match your search'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {trips.length === 0 
                    ? 'Get started by creating your first travel package.'
                    : 'Try adjusting your search criteria or filters.'
                  }
                </p>
                {trips.length === 0 && (
                  <Link href="/admin/trips/new">
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Trip
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredTrips.map((trip) => {
                  const status = getTripStatus(trip)
                  return (
                    <div key={trip.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-medium text-gray-900">
                                  {trip.name}
                                </h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                  {status.label}
                                </span>
                                {trip.difficulty_level && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    {trip.difficulty_level}
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                                  {trip.destination}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                                  {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-2 text-orange-500" />
                                  {trip.current_bookings}/{trip.max_capacity} booked
                                </div>
                              </div>

                              {trip.description && (
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                  {trip.description}
                                </p>
                              )}
                            </div>

                            <div className="text-right ml-6">
                              <div className="text-2xl font-bold text-gray-900">
                                {formatPrice(trip.price)}
                              </div>
                              <div className="text-sm text-gray-600">per person</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              Created {formatDate(trip.created_at)}
                              {trip.created_by_user && ` by ${trip.created_by_user.full_name}`}
                            </div>
                            
                            <div className="flex space-x-2">
                              <Link href={`/trips/${trip.id}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </Link>
                              <Link href={`/admin/trips/${trip.id}/edit`}>
                                <Button size="sm" variant="outline">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteTrip(trip.id, trip.name)}
                                className="text-red-600 hover:text-red-700 hover:border-red-300"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}