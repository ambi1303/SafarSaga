'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { 
  CreditCard, 
  DollarSign, 
  FileText, 
  Eye,
  EyeOff,
  Loader2,
  Save,
  Shield,
  AlertTriangle
} from 'lucide-react'
import { AppSettings, adminSettingsService } from '@/lib/admin-settings'

interface PaymentSettingsProps {
  settings: AppSettings
  onUpdate: (updatedSettings: AppSettings) => void
}

const currencies = [
  { value: 'INR', label: 'Indian Rupee (₹)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
]

export default function PaymentSettings({ settings, onUpdate }: PaymentSettingsProps) {
  const [formData, setFormData] = useState({
    payment_gateway_key: settings.payment_gateway_key || '',
    payment_gateway_secret: settings.payment_gateway_secret || '',
    currency: settings.currency || 'INR',
    gstin: settings.gstin || '',
    gst_rate: settings.gst_rate || 5,
    terms_and_conditions: settings.terms_and_conditions || '',
  })
  
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState({
    key: false,
    secret: false
  })
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const toggleSecretVisibility = (field: 'key' | 'secret') => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
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
      const updatedSettings = await adminSettingsService.updatePaymentSettings(formData)
      onUpdate(updatedSettings)
    } catch (error) {
      console.error('Error updating payment settings:', error)
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
      {/* Payment Gateway Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Gateway Configuration</h3>
          <p className="text-sm text-gray-600">Configure your payment processing settings</p>
        </div>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900">Security Notice</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-800">
              Payment gateway credentials are sensitive information. Ensure you're using secure API keys 
              and never share them publicly. Keys are masked in the interface for security.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="payment_gateway_key">Payment Gateway API Key</Label>
            <div className="relative">
              <Input
                id="payment_gateway_key"
                type={showSecrets.key ? 'text' : 'password'}
                value={formData.payment_gateway_key}
                onChange={(e) => handleInputChange('payment_gateway_key', e.target.value)}
                placeholder="Enter your API key"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => toggleSecretVisibility('key')}
              >
                {showSecrets.key ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">Your payment gateway public API key</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_gateway_secret">Payment Gateway Secret Key</Label>
            <div className="relative">
              <Input
                id="payment_gateway_secret"
                type={showSecrets.secret ? 'text' : 'password'}
                value={formData.payment_gateway_secret}
                onChange={(e) => handleInputChange('payment_gateway_secret', e.target.value)}
                placeholder="Enter your secret key"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => toggleSecretVisibility('secret')}
              >
                {showSecrets.secret ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">Your payment gateway private secret key</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Default Currency</Label>
          <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">Currency used for all pricing and transactions</p>
        </div>
      </div>

      <Separator />

      {/* Tax Configuration Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tax Configuration</h3>
          <p className="text-sm text-gray-600">Configure tax rates and GST information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN Number</Label>
            <Input
              id="gstin"
              value={formData.gstin}
              onChange={(e) => handleInputChange('gstin', e.target.value)}
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
            />
            <p className="text-xs text-gray-500">Your GST Identification Number (15 digits)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gst_rate">GST Rate (%)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="gst_rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.gst_rate}
                onChange={(e) => handleInputChange('gst_rate', parseFloat(e.target.value) || 0)}
                placeholder="5.00"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500">Default GST rate applied to bookings</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Terms and Conditions Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Terms & Conditions</h3>
          <p className="text-sm text-gray-600">Default terms that customers must agree to when booking</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="terms_and_conditions">Terms & Conditions</Label>
          <Textarea
            id="terms_and_conditions"
            value={formData.terms_and_conditions}
            onChange={(e) => handleInputChange('terms_and_conditions', e.target.value)}
            placeholder="Enter your booking terms and conditions..."
            className="min-h-[150px]"
            rows={8}
          />
          <p className="text-xs text-gray-500">
            These terms will be displayed during the booking process. Use clear, simple language.
          </p>
        </div>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Terms & Conditions Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Include cancellation and refund policies</li>
                  <li>• Specify payment terms and due dates</li>
                  <li>• Mention travel insurance requirements</li>
                  <li>• Include liability limitations and responsibilities</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
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
              Save Payment Settings
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
