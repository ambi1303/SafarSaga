'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { 
  Settings as SettingsIcon, 
  Building2, 
  CreditCard, 
  Users, 
  Shield,
  Loader2
} from 'lucide-react'
import { adminSettingsService, AppSettings } from '@/lib/admin-settings'
import GeneralSettings from '@/components/admin/GeneralSettings'
import PaymentSettings from '@/components/admin/PaymentSettings'
import AdminManagement from '@/components/admin/AdminManagement'
import SystemSettings from '@/components/admin/SystemSettings'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const { toast } = useToast()

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const settingsData = await adminSettingsService.getSettings()
      setSettings(settingsData)
    } catch (error) {
      console.error('Error loading settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSettingsUpdate = async (updatedSettings: AppSettings) => {
    setSettings(updatedSettings)
    toast({
      title: 'Success',
      description: 'Settings updated successfully!',
      variant: 'default',
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your admin preferences and system settings</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your admin preferences and system settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Admin
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Manage your company profile and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {settings && (
                <GeneralSettings 
                  settings={settings} 
                  onUpdate={handleSettingsUpdate}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Settings
              </CardTitle>
              <CardDescription>
                Configure payment gateways, tax settings, and booking terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {settings && (
                <PaymentSettings 
                  settings={settings} 
                  onUpdate={handleSettingsUpdate}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Admin Management
              </CardTitle>
              <CardDescription>
                Manage admin accounts and user permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure system-wide settings and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {settings && (
                <SystemSettings 
                  settings={settings} 
                  onUpdate={handleSettingsUpdate}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
