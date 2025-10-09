'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Upload,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Loader2,
  Save
} from 'lucide-react'
import { AppSettings, adminSettingsService } from '@/lib/admin-settings'

interface GeneralSettingsProps {
  settings: AppSettings
  onUpdate: (updatedSettings: AppSettings) => void
}

export default function GeneralSettings({ settings, onUpdate }: GeneralSettingsProps) {
  const [formData, setFormData] = useState({
    company_name: settings.company_name || '',
    logo_url: settings.logo_url || '',
    contact_email: settings.contact_email || '',
    contact_phone: settings.contact_phone || '',
    address: settings.address || '',
    social_facebook_url: settings.social_facebook_url || '',
    social_instagram_url: settings.social_instagram_url || '',
    social_twitter_url: settings.social_twitter_url || '',
    social_linkedin_url: settings.social_linkedin_url || '',
    social_youtube_url: settings.social_youtube_url || '',
  })
  
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form data
    const validation = adminSettingsService.validateSettings(formData)
    if (!validation.isValid) {
      toast({
        title: 'Validation Error',
        description: validation.errors.join(', '),
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      const updatedSettings = await adminSettingsService.updateGeneralSettings(formData)
      onUpdate(updatedSettings)
    } catch (error) {
      console.error('Error updating general settings:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Company Profile Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Company Profile</h3>
          <p className="text-sm text-gray-600">Basic information about your travel agency</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              placeholder="SafarSaga Trips"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL</Label>
            <div className="flex gap-2">
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => handleInputChange('logo_url', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              <Button type="button" variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">Upload or provide a URL to your company logo</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Contact Information Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
          <p className="text-sm text-gray-600">How customers can reach you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="info@safarsaga.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Contact Phone *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="+91 9311706027"
                className="pl-10"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Business Address</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter your complete business address"
              className="pl-10 min-h-[80px]"
              rows={3}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Social Media Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Social Media Links</h3>
          <p className="text-sm text-gray-600">Connect your social media profiles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="social_facebook_url">Facebook Page</Label>
            <div className="relative">
              <Facebook className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="social_facebook_url"
                value={formData.social_facebook_url}
                onChange={(e) => handleInputChange('social_facebook_url', e.target.value)}
                placeholder="https://facebook.com/safarsaga"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_instagram_url">Instagram Profile</Label>
            <div className="relative">
              <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="social_instagram_url"
                value={formData.social_instagram_url}
                onChange={(e) => handleInputChange('social_instagram_url', e.target.value)}
                placeholder="https://instagram.com/safarsaga"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_twitter_url">Twitter/X Profile</Label>
            <div className="relative">
              <Twitter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="social_twitter_url"
                value={formData.social_twitter_url}
                onChange={(e) => handleInputChange('social_twitter_url', e.target.value)}
                placeholder="https://twitter.com/safarsaga"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_linkedin_url">LinkedIn Page</Label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="social_linkedin_url"
                value={formData.social_linkedin_url}
                onChange={(e) => handleInputChange('social_linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/company/safarsaga"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="social_youtube_url">YouTube Channel</Label>
            <div className="relative">
              <Youtube className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="social_youtube_url"
                value={formData.social_youtube_url}
                onChange={(e) => handleInputChange('social_youtube_url', e.target.value)}
                placeholder="https://youtube.com/@safarsaga"
                className="pl-10"
              />
            </div>
          </div>
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
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
