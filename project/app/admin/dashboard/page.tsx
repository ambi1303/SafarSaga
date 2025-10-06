'use client'

import { useState, useEffect } from 'react'
import { StatsCard } from '@/components/admin/StatsCard'
import { Calendar, CreditCard, XCircle, CheckCircle } from 'lucide-react'
import { BookingsAdminService, AdminBookingStats } from '@/lib/bookings-admin'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminBookingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await BookingsAdminService.getAdminStats()
      setStats(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics')
      console.error('Error fetching admin stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {user?.full_name}! Here's what's happening with your business.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Bookings"
          value={stats?.total_bookings || 0}
          icon={Calendar}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Pending Bookings"
          value={stats?.pending_bookings || 0}
          icon={Calendar}
          color="orange"
          loading={loading}
        />
        <StatsCard
          title="Confirmed Bookings"
          value={stats?.confirmed_bookings || 0}
          icon={CheckCircle}
          color="green"
          loading={loading}
        />
        <StatsCard
          title="Cancelled Bookings"
          value={stats?.cancelled_bookings || 0}
          icon={XCircle}
          color="red"
          loading={loading}
        />
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Total Revenue</p>
            <p className="text-3xl font-bold mt-2">
              {loading ? '...' : formatCurrency(stats?.total_revenue || 0)}
            </p>
          </div>
          <CreditCard className="h-12 w-12 opacity-80" />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bookings by Month
          </h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : stats?.bookings_by_month && stats.bookings_by_month.length > 0 ? (
            <div className="space-y-3">
              {stats.bookings_by_month.slice(0, 6).map((month) => (
                <div key={month.month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{month.month}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min((month.count / (stats.total_bookings || 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {month.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No booking data available</p>
          )}
        </div>

        {/* Top Destinations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Destinations
          </h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : stats?.top_destinations && stats.top_destinations.length > 0 ? (
            <div className="space-y-3">
              {stats.top_destinations.slice(0, 5).map((dest, index) => (
                <div key={dest.destination_id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-900">{dest.destination_name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {dest.booking_count} bookings
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No destination data available</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/bookings"
            className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition-all"
          >
            <Calendar className="h-6 w-6 text-orange-500 mb-2" />
            <h4 className="font-medium text-gray-900">Manage Bookings</h4>
            <p className="text-sm text-gray-500 mt-1">View and update bookings</p>
          </a>
          <a
            href="/admin/payments"
            className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition-all"
          >
            <CreditCard className="h-6 w-6 text-orange-500 mb-2" />
            <h4 className="font-medium text-gray-900">Review Payments</h4>
            <p className="text-sm text-gray-500 mt-1">Approve pending payments</p>
          </a>
          <a
            href="/admin/trips"
            className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition-all"
          >
            <CheckCircle className="h-6 w-6 text-orange-500 mb-2" />
            <h4 className="font-medium text-gray-900">Manage Trips</h4>
            <p className="text-sm text-gray-500 mt-1">Add or edit travel packages</p>
          </a>
        </div>
      </div>
    </div>
  )
}
