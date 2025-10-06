'use client'

import { BarChart3 } from 'lucide-react'

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">View detailed analytics and reports</p>
      </div>

      <div className="bg-white rounded-lg shadow p-12 text-center">
        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Analytics Coming Soon
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Advanced analytics and reporting features will be available here soon.
          Track your business performance, revenue trends, and customer insights.
        </p>
      </div>
    </div>
  )
}
