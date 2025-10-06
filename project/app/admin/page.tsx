'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  MapPin, 
  CreditCard, 
  Users, 
  TrendingUp, 
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Camera,
  Settings
} from 'lucide-react'
import { TripsService, Trip, formatPrice, formatDate, getTripStatus } from '@/lib/trips'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [stats, setStats] = useState({
    totalTrips: 0,
    activeTrips: 0,
    totalBookings: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch recent trips
      const tripsResponse = await TripsService.getTrips({
        limit: 10,
        isActive: undefined // Get both active and inactive
      })
      setTrips(tripsResponse.trips)

      // Fetch stats (mock data for now)
      const statsData = await TripsService.getTripStats()
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return

    try {
      await TripsService.deleteTrip(tripId)
      fetchDashboardData() // Refresh data
    } catch (error) {
      console.error('Error deleting trip:', error)
      alert('Failed to delete trip. Please try again.')
    }
  }

  return (
    <ProtectedRoute requireAuth requireAdmin>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, {user?.full_name}! Manage your travel business here.
                </p>
              </div>
              <div className="flex space-x-3">
                <Link href="/admin/trips/new">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    New Trip
                  </Button>
                </Link>
                <Link href="/admin/gallery">
                  <Button variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Gallery
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeTrips}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Trips */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Trips</h2>
                  <Link href="/admin/trips">
                    <Button size="sm" variant="outline">
                      View All
                    </Button>
                  </Link>
                </div>
                <div className="divide-y divide-gray-200">
                  {loading ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading trips...</p>
                    </div>
                  ) : trips.length === 0 ? (
                    <div className="p-6 text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No trips found. Create your first trip!</p>
                      <Link href="/admin/trips/new" className="mt-4 inline-block">
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Trip
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    trips.slice(0, 5).map((trip) => {
                      const status = getTripStatus(trip)
                      return (
                        <div key={trip.id} className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-medium text-gray-900">
                                    {trip.name}
                                  </h3>
                                  <p className="text-sm text-gray-600 flex items-center mt-1">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {trip.destination}
                                  </p>
                                  <p className="text-sm text-gray-600 flex items-center mt-1">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                                  </p>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="text-lg font-semibold text-gray-900">
                                    {formatPrice(trip.price)}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {trip.current_bookings}/{trip.max_capacity} booked
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mt-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                  {status.label}
                                </span>
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
                                    onClick={() => handleDeleteTrip(trip.id)}
                                    className="text-red-600 hover:text-red-700"
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
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions & Analytics */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/admin/trips/new" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Trip
                    </Button>
                  </Link>
                  <Link href="/admin/bookings" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Manage Bookings
                    </Button>
                  </Link>
                  <Link href="/admin/gallery" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Camera className="h-4 w-4 mr-2" />
                      Manage Gallery
                    </Button>
                  </Link>
                  <Link href="/admin/analytics" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                  <Link href="/admin/settings" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">New booking for Manali Trek</span>
                    <span className="text-gray-400">2h ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Trip "Goa Beach Paradise" updated</span>
                    <span className="text-gray-400">4h ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">Payment confirmed for Kerala trip</span>
                    <span className="text-gray-400">6h ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600">New gallery images uploaded</span>
                    <span className="text-gray-400">1d ago</span>
                  </div>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">This Month</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="opacity-90">New Bookings:</span>
                    <span className="font-semibold">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Revenue:</span>
                    <span className="font-semibold">₹4,85,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Growth:</span>
                    <span className="font-semibold flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +15%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}