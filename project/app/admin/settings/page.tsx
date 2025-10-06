'use client'

import { Settings as SettingsIcon } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your admin preferences and system settings</p>
      </div>

      <div className="bg-white rounded-lg shadow p-12 text-center">
        <SettingsIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Settings Coming Soon
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Configure system settings, manage admin accounts, set up notifications,
          and customize your dashboard preferences.
        </p>
      </div>
    </div>
  )
}
