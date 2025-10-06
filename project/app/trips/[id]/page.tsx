'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLoginRequired } from '@/components/auth/LoginRequiredModal'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  Star,
  ArrowLeft,
  CheckCircle,
  X,
  Plus,
  Minus,
  CreditCard,
  Loader2,
  Mountain,
  Utensils,
  Bed,
  Camera
} from 'lucide-react'
import { TripsService, Trip, formatPrice, formatDate, getTripDuration, getTripStatus, isTripAvailable } from '@/lib/trips'
import { useToast } from '@/hooks/use-toast';
import { submitBooking } from '@/lib/booking-utils';

export default function TripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, token } = useAuth()
  const { showLoginRequired, LoginRequiredModal } = useLoginRequired()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookingSeats, setBookingSeats] = useState(1)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const { toast } = useToast();

  useEffect(() => {
    if (params.id) {
      fetchTrip(params.id as string)
    }
  }, [params.id])

  const fetchTrip = async (id: string) => {
    try {
      setLoading(true)
      const tripData = await TripsService.getTrip(id)
      setTrip(tripData)
    } catch (err) {
      setError('Trip not found or failed to load.')
      console.error('Error fetching trip:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      showLoginRequired({
        title: "Login Required to Book",
        message: `You need to be logged in to book "${trip?.name}". Please sign in or create an account to continue with your booking.`,
        actionText: "book this trip"
      })
      return
    }
    setShowBookingForm(true)
  }

  const buildTripBookingPayload = () => {
    return {
      event_id: trip.id, // For trips, use event_id
      seats: bookingSeats,
      special_requests: '', // Could add a form field for this
    };
  };

  const handleBookingSubmit = async () => {
    if (!trip || !isAuthenticated || !user || !token) {
      toast({ title: 'Not Authenticated', description: 'You must be logged in to book.' });
      return;
    }
    try {
      const payload = buildTripBookingPayload();
      await submitBooking({ payload, token, onSuccess: (booking) => router.push(`/dashboard/bookings/${booking.id}`) });
    } catch (error) {
      // Error handled in submitBooking
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">Loading trip details...</p>
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Mountain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/trips">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trips
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const status = getTripStatus(trip)
  const duration = getTripDuration(trip.start_date, trip.end_date)
  const isAvailable = isTripAvailable(trip)
  const totalPrice = trip.price * bookingSeats

  return (
    <>
      <LoginRequiredModal />
      <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 lg:h-[500px]">
        <img
          src={trip.featured_image_url || '/images/gallery/manali-kasol.JPG'}
          alt={trip.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
            <div className="text-white">
              <Link href="/trips" className="inline-flex items-center text-white/80 hover:text-white mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Trips
              </Link>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">{trip.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-lg">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  {trip.destination}
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  {duration} {duration === 1 ? 'day' : 'days'}
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-600 leading-relaxed">{trip.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Start Date</div>
                  <div className="text-xs text-gray-600">{formatDate(trip.start_date)}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">End Date</div>
                  <div className="text-xs text-gray-600">{formatDate(trip.end_date)}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Capacity</div>
                  <div className="text-xs text-gray-600">{trip.max_capacity} people</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Mountain className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Difficulty</div>
                  <div className="text-xs text-gray-600">{trip.difficulty_level || 'Not specified'}</div>
                </div>
              </div>
            </div>

            {/* Itinerary */}
            {trip.itinerary && trip.itinerary.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Itinerary</h2>
                <div className="space-y-6">
                  {trip.itinerary.map((day, index) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0 w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                        {day.day}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{day.title}</h3>
                        <p className="text-gray-600 mb-3">{day.description}</p>
                        
                        {day.activities.length > 0 && (
                          <div className="mb-2">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Activities:</h4>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                              {day.activities.map((activity, actIndex) => (
                                <li key={actIndex}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          {day.meals.length > 0 && (
                            <div className="flex items-center text-gray-600">
                              <Utensils className="h-4 w-4 mr-1 text-orange-500" />
                              {day.meals.join(', ')}
                            </div>
                          )}
                          {day.accommodation && (
                            <div className="flex items-center text-gray-600">
                              <Bed className="h-4 w-4 mr-1 text-orange-500" />
                              {day.accommodation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trip.inclusions && trip.inclusions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included</h3>
                  <ul className="space-y-2">
                    {trip.inclusions.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {trip.exclusions && trip.exclusions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Not Included</h3>
                  <ul className="space-y-2">
                    {trip.exclusions.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Gallery */}
            {trip.gallery_images && trip.gallery_images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {trip.gallery_images.slice(0, 6).map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`${trip.name} gallery ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
                {trip.gallery_images.length > 6 && (
                  <div className="text-center mt-4">
                    <Link href="/gallery">
                      <Button variant="outline">
                        <Camera className="h-4 w-4 mr-2" />
                        View All Photos
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900">{formatPrice(trip.price)}</div>
                <div className="text-gray-600">per person</div>
              </div>

              {isAvailable ? (
                <>
                  {!showBookingForm ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Available spots:</span>
                        <span className="font-semibold">{trip.max_capacity - trip.current_bookings}</span>
                      </div>
                      
                      <Button 
                        onClick={handleBookNow}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-3"
                      >
                        Book Now
                      </Button>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center text-yellow-400 mb-1">
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                        </div>
                        <div className="text-sm text-gray-600">4.8/5 (124 reviews)</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Book Your Trip</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of seats
                        </label>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <button
                            onClick={() => setBookingSeats(Math.max(1, bookingSeats - 1))}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-semibold">{bookingSeats}</span>
                          <button
                            onClick={() => setBookingSeats(Math.min(trip.max_capacity - trip.current_bookings, bookingSeats + 1))}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Price per person:</span>
                          <span>{formatPrice(trip.price)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Seats:</span>
                          <span>{bookingSeats}</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>{formatPrice(totalPrice)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button 
                          onClick={handleBookingSubmit}
                          className="w-full bg-orange-500 hover:bg-orange-600"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Proceed to Payment
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setShowBookingForm(false)}
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                    {status.label}
                  </div>
                  <p className="text-gray-600">
                    {status.status === 'full' && 'This trip is fully booked.'}
                    {status.status === 'completed' && 'This trip has been completed.'}
                    {status.status === 'inactive' && 'This trip is currently unavailable.'}
                  </p>
                  <Link href="/trips">
                    <Button variant="outline" className="w-full">
                      Browse Other Trips
                    </Button>
                  </Link>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-2">Need help?</p>
                <Link href="/contact">
                  <Button variant="outline" size="sm">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}