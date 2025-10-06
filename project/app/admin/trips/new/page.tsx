'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Loader2,
  MapPin,
  Calendar,
  Users,
  DollarSign
} from 'lucide-react'
import { TripsService, CreateTripData, ItineraryItem } from '@/lib/trips'
import Link from 'next/link'

export default function NewTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<CreateTripData>({
    name: '',
    description: '',
    destination: '',
    price: 0,
    max_capacity: 0,
    start_date: '',
    end_date: '',
    difficulty_level: 'Easy',
    itinerary: [],
    inclusions: [],
    exclusions: [],
    featured_image_url: '',
    gallery_images: []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const trip = await TripsService.createTrip(formData)
      router.push(`/admin/trips/${trip.id}/edit?created=true`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip')
    } finally {
      setLoading(false)
    }
  }

  const addItineraryDay = () => {
    const newDay: ItineraryItem = {
      day: (formData.itinerary?.length || 0) + 1,
      title: '',
      description: '',
      activities: [],
      meals: [],
      accommodation: ''
    }
    setFormData({
      ...formData,
      itinerary: [...(formData.itinerary || []), newDay]
    })
  }

  const updateItineraryDay = (index: number, day: ItineraryItem) => {
    const updatedItinerary = [...(formData.itinerary || [])]
    updatedItinerary[index] = day
    setFormData({ ...formData, itinerary: updatedItinerary })
  }

  const removeItineraryDay = (index: number) => {
    const updatedItinerary = formData.itinerary?.filter((_, i) => i !== index) || []
    // Renumber the days
    updatedItinerary.forEach((day, i) => {
      day.day = i + 1
    })
    setFormData({ ...formData, itinerary: updatedItinerary })
  }

  const addListItem = (field: 'inclusions' | 'exclusions', value: string) => {
    if (!value.trim()) return
    const currentList = formData[field] || []
    setFormData({
      ...formData,
      [field]: [...currentList, value.trim()]
    })
  }

  const removeListItem = (field: 'inclusions' | 'exclusions', index: number) => {
    const currentList = formData[field] || []
    setFormData({
      ...formData,
      [field]: currentList.filter((_, i) => i !== index)
    })
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Create New Trip</h1>
                  <p className="text-gray-600">Add a new travel package to your offerings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
              
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trip Name *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Manali Adventure Trek"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      required
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      placeholder="e.g., Manali, Himachal Pradesh"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Challenging">Challenging</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Person (₹) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="number"
                      required
                      min="0"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="15999"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Capacity *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="number"
                      required
                      min="1"
                      value={formData.max_capacity || ''}
                      onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) || 0 })}
                      placeholder="20"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="datetime-local"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="datetime-local"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the trip experience, highlights, and what makes it special..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image URL
                  </label>
                  <Input
                    type="url"
                    value={formData.featured_image_url}
                    onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Itinerary */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Itinerary</h2>
                <Button type="button" onClick={addItineraryDay} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Day
                </Button>
              </div>

              <div className="space-y-6">
                {formData.itinerary?.map((day, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-medium text-gray-900">Day {day.day}</h3>
                      <Button
                        type="button"
                        onClick={() => removeItineraryDay(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Day Title
                        </label>
                        <Input
                          type="text"
                          value={day.title}
                          onChange={(e) => updateItineraryDay(index, { ...day, title: e.target.value })}
                          placeholder="e.g., Arrival and Local Sightseeing"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          value={day.description}
                          onChange={(e) => updateItineraryDay(index, { ...day, description: e.target.value })}
                          placeholder="Describe the day's activities and schedule..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Activities (comma-separated)
                        </label>
                        <Input
                          type="text"
                          value={day.activities.join(', ')}
                          onChange={(e) => updateItineraryDay(index, { 
                            ...day, 
                            activities: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                          })}
                          placeholder="Trekking, Photography, Local cuisine"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Meals (comma-separated)
                        </label>
                        <Input
                          type="text"
                          value={day.meals.join(', ')}
                          onChange={(e) => updateItineraryDay(index, { 
                            ...day, 
                            meals: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                          })}
                          placeholder="Breakfast, Lunch, Dinner"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Accommodation
                        </label>
                        <Input
                          type="text"
                          value={day.accommodation}
                          onChange={(e) => updateItineraryDay(index, { ...day, accommodation: e.target.value })}
                          placeholder="Hotel name or type of accommodation"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {(!formData.itinerary || formData.itinerary.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No itinerary added yet. Click "Add Day" to start building your trip schedule.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inclusions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">What's Included</h2>
                
                <div className="space-y-2 mb-4">
                  {formData.inclusions?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm text-gray-700">{item}</span>
                      <Button
                        type="button"
                        onClick={() => removeListItem('inclusions', index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Add inclusion..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const input = e.target as HTMLInputElement
                        addListItem('inclusions', input.value)
                        input.value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement
                      if (input) {
                        addListItem('inclusions', input.value)
                        input.value = ''
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Exclusions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">What's Not Included</h2>
                
                <div className="space-y-2 mb-4">
                  {formData.exclusions?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <span className="text-sm text-gray-700">{item}</span>
                      <Button
                        type="button"
                        onClick={() => removeListItem('exclusions', index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Add exclusion..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const input = e.target as HTMLInputElement
                        addListItem('exclusions', input.value)
                        input.value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement
                      if (input) {
                        addListItem('exclusions', input.value)
                        input.value = ''
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link href="/admin">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Trip...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Trip
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}