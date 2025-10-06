'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { BookingService, BookingResponse, BookingUtils, UserBookingStats } from '@/lib/booking-service'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  MapPin, 
  CreditCard, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Eye,
  X
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingTrips: 0,
    completedTrips: 0,
    totalSpent: 0
  })

  useEffect(() => {
    fetchUserBookings()
    
    // Check if redirected from successful booking
    if (searchParams.get('booking') === 'success') {
      setShowSuccessMessage(true)
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
  }, [searchParams])

  const fetchUserBookings = async () => {
    try {
      setLoading(true)
      
      // Fetch bookings and stats in parallel for better performance
      const [userBookings, userStats] = await Promise.all([
        BookingService.getUserBookings(),
        BookingService.getUserBookingStats()
      ])
      
      setBookings(userBookings || [])
      
      // Use optimized stats from backend
      const optimizedStats = {
        totalBookings: userStats.total_bookings,
        upcomingTrips: userStats.upcoming_trips,
        completedTrips: userStats.completed_trips,
        totalSpent: userStats.total_spent
      }
      
      setStats(optimizedStats)
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
      // Set empty state on error
      setBookings([])
      setStats({
        totalBookings: 0,
        upcomingTrips: 0,
        completedTrips: 0,
        totalSpent: 0
      })
    } finally {
      setLoading(false)
    }
  }



  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    Booking Successful!
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your booking has been created successfully. You can view the details below.
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="ml-auto text-green-600 hover:text-green-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your bookings and explore new adventures
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingTrips}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedTrips}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Book New Trips Section */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow text-white p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Ready for Your Next Adventure?</h2>
                <p className="text-orange-100 mb-4">
                  Discover amazing destinations and create unforgettable memories
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/destinations">
                    <Button className="bg-white text-orange-500 hover:bg-orange-50 font-medium">
                      <MapPin className="h-4 w-4 mr-2" />
                      Explore Destinations
                    </Button>
                  </Link>
                  <Link href="/packages">
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-orange-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Packages
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Bookings */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">My Bookings</h2>
                  <div className="flex gap-2">
                    <Link href="/packages">
                      <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                        <Plus className="h-4 w-4 mr-2" />
                        View Packages
                      </Button>
                    </Link>
                    <Link href="/destinations">
                      <Button size="sm" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                        <MapPin className="h-4 w-4 mr-2" />
                        Destinations
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {loading ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading bookings...</p>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="p-6 text-center">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No bookings yet. Start exploring amazing destinations!</p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/destinations">
                          <Button className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
                            Browse Destinations
                          </Button>
                        </Link>
                        <Link href="/packages">
                          <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50 w-full sm:w-auto">
                            View Packages
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div key={booking.id} className="p-6">
                        <div className="flex items-start space-x-4">
                          <img
                            src={booking.destination?.image || "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"}
                            alt={booking.destination?.name || 'Destination'}
                            className="w-16 h-16 rounded-lg object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  {booking.destination?.name || 'Unknown Destination'}
                                </h3>
                                <p className="text-sm text-gray-600 flex items-center mt-1">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {booking.destination?.location || booking.destination?.destination || 'Location TBD'}
                                </p>
                                <p className="text-sm text-gray-600 flex items-center mt-1">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {booking.travelDate 
                                    ? new Date(booking.travelDate).toLocaleDateString()
                                    : 'Date to be confirmed'
                                  }
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Ref: {booking.bookingReference || booking.id}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold text-gray-900">
                                  ₹{(booking.totalAmount || 0).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {booking.seats || 1} {(booking.seats || 1) === 1 ? 'seat' : 'seats'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex space-x-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BookingUtils.getStatusColor(booking.bookingStatus)}`}>
                                  {booking.bookingStatus === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {booking.bookingStatus === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                  {booking.bookingStatus === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                                  {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BookingUtils.getPaymentStatusColor(booking.paymentStatus)}`}>
                                  {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                                </span>
                              </div>
                              <Link href={`/dashboard/bookings/${booking.id}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions & Profile */}
            <div className="space-y-6">
              {/* Profile Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user?.full_name}</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
                <Link href="/profile" className="mt-4 block">
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </Link>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/packages" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Browse Packages
                    </Button>
                  </Link>
                  <Link href="/destinations" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <MapPin className="h-4 w-4 mr-2" />
                      View Destinations
                    </Button>
                  </Link>
                  <Link href="/gallery" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Eye className="h-4 w-4 mr-2" />
                      View Gallery
                    </Button>
                  </Link>
                  <Link href="/contact" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Travel Tips */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Travel Tip</h3>
                <p className="text-sm opacity-90">
                  Book your trips at least 2 weeks in advance to get the best prices and ensure availability!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}