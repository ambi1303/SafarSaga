'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { 
  Shield, 
  Bell, 
  AlertTriangle,
  Loader2,
  Save,
  Settings,
  Mail,
  CreditCard,
  Users,
  Wrench
} from 'lucide-react'
import { AppSettings, adminSettingsService } from '@/lib/admin-settings'

interface SystemSettingsProps {
  settings: AppSettings
  onUpdate: (updatedSettings: AppSettings) => void
}

export default function SystemSettings({ settings, onUpdate }: SystemSettingsProps) {
  const [formData, setFormData] = useState({
    maintenance_mode: settings.maintenance_mode || false,
    notify_on_new_booking: settings.notify_on_new_booking || true,
    notify_on_new_user: settings.notify_on_new_user || true,
    notify_on_payment: settings.notify_on_payment || true,
  })
  
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSwitchChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      const updatedSettings = await adminSettingsService.updateSystemSettings(formData)
      onUpdate(updatedSettings)
    } catch (error) {
      console.error('Error updating system settings:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleMaintenanceToggle = async (enabled: boolean) => {
    try {
      setSaving(true)
      const updatedSettings = await adminSettingsService.toggleMaintenanceMode(enabled)
      setFormData(prev => ({ ...prev, maintenance_mode: enabled }))
      onUpdate(updatedSettings)
      
      toast({
        title: enabled ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled',
        description: enabled 
          ? 'Your website is now in maintenance mode. Visitors will see a maintenance page.'
          : 'Your website is now live and accessible to visitors.',
        variant: enabled ? 'destructive' : 'default',
      })
    } catch (error) {
      console.error('Error toggling maintenance mode:', error)
      toast({
        title: 'Error',
        description: 'Failed to toggle maintenance mode',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Maintenance Mode Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Site Maintenance</h3>
          <p className="text-sm text-gray-600">Control website availability for maintenance and updates</p>
        </div>

        <Card className={`border-2 ${formData.maintenance_mode ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${formData.maintenance_mode ? 'bg-red-100' : 'bg-green-100'}`}>
                  {formData.maintenance_mode ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Shield className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div>
                  <CardTitle className={formData.maintenance_mode ? 'text-red-900' : 'text-green-900'}>
                    {formData.maintenance_mode ? 'Maintenance Mode Active' : 'Site is Live'}
                  </CardTitle>
                  <CardDescription className={formData.maintenance_mode ? 'text-red-700' : 'text-green-700'}>
                    {formData.maintenance_mode 
                      ? 'Visitors will see a maintenance page'
                      : 'Website is accessible to all visitors'
                    }
                  </CardDescription>
                </div>
              </div>
              
              <Switch
                checked={formData.maintenance_mode}
                onCheckedChange={handleMaintenanceToggle}
                disabled={saving}
              />
            </div>
          </CardHeader>
          
          {formData.maintenance_mode && (
            <CardContent>
              <div className="flex items-start gap-3 p-4 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900 mb-1">Maintenance Mode is Active</h4>
                  <p className="text-sm text-red-800">
                    Your website is currently showing a maintenance page to visitors. 
                    Admin areas remain accessible. Remember to disable maintenance mode when updates are complete.
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <Separator />

      {/* Notification Settings Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Email Notifications</h3>
          <p className="text-sm text-gray-600">Configure when you receive email notifications</p>
        </div>

        <div className="space-y-4">
          {/* New Booking Notifications */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <Label htmlFor="notify_booking" className="text-base font-medium">
                      New Booking Notifications
                    </Label>
                    <p className="text-sm text-gray-600">
                      Get notified when customers make new bookings
                    </p>
                  </div>
                </div>
                
                <Switch
                  id="notify_booking"
                  checked={formData.notify_on_new_booking}
                  onCheckedChange={(value) => handleSwitchChange('notify_on_new_booking', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* New User Registration Notifications */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <Label htmlFor="notify_user" className="text-base font-medium">
                      New User Registration
                    </Label>
                    <p className="text-sm text-gray-600">
                      Get notified when new users register on your website
                    </p>
                  </div>
                </div>
                
                <Switch
                  id="notify_user"
                  checked={formData.notify_on_new_user}
                  onCheckedChange={(value) => handleSwitchChange('notify_on_new_user', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Notifications */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Mail className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <Label htmlFor="notify_payment" className="text-base font-medium">
                      Payment Notifications
                    </Label>
                    <p className="text-sm text-gray-600">
                      Get notified about payment confirmations and failures
                    </p>
                  </div>
                </div>
                
                <Switch
                  id="notify_payment"
                  checked={formData.notify_on_payment}
                  onCheckedChange={(value) => handleSwitchChange('notify_on_payment', value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* System Information Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">System Information</h3>
          <p className="text-sm text-gray-600">Current system status and configuration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Settings className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">System Version</h4>
                  <p className="text-sm text-gray-600">SafarSaga v1.0.0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-full">
                  <Wrench className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Last Updated</h4>
                  <p className="text-sm text-gray-600">
                    {settings.updated_at 
                      ? new Date(settings.updated_at).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6">
        <Button 
          type="submit" 
          disabled={saving}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save System Settings
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
