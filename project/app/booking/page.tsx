'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Calendar, Users, CreditCard, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { submitBooking } from '@/lib/booking-utils';
import { DestinationsService, type Destination } from '@/lib/destinations-service';

export default function BookingPage() {
  const [bookingData, setBookingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    adults: '2',
    children: '0',
    specialRequests: ''
  });

  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDestination, setLoadingDestination] = useState(true);

  // Default destination ID - you can make this dynamic based on URL params or selection
  const destinationId = '047b7783-1ccb-4d73-aa7c-4dd9dad41388'; // Use the actual destination ID from the booking

  const { toast } = useToast();
  const { token, isAuthenticated } = useAuth();

  // Load destination data on component mount
  useEffect(() => {
    const loadDestination = async () => {
      try {
        setLoadingDestination(true);
        const destination = await DestinationsService.getDestination(destinationId);
        if (destination) {
          setSelectedDestination(destination);
        } else {
          // Fallback to mock data if destination not found
          setSelectedDestination({
            id: destinationId,
            name: 'Manali & Kasol',
            description: 'Beautiful hill station experience in Himachal Pradesh',
            state: 'Himachal Pradesh',
            country: 'India',
            featured_image_url: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
            difficulty_level: 'Moderate',
            best_time_to_visit: 'October to June',
            popular_activities: ['Trekking', 'Paragliding', 'River Rafting', 'Temple Visits', 'Photography'],
            average_cost_per_day: 5499, // Match the price shown in the UI
            is_active: true
          });
        }
      } catch (error) {
        console.error('Failed to load destination:', error);
        // Use fallback data
        setSelectedDestination({
          id: destinationId,
          name: 'Manali & Kasol',
          description: 'Beautiful hill station experience in Himachal Pradesh',
          state: 'Himachal Pradesh',
          country: 'India',
          featured_image_url: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
          difficulty_level: 'Moderate',
          best_time_to_visit: 'October to June',
          popular_activities: ['Trekking', 'Paragliding', 'River Rafting', 'Temple Visits', 'Photography'],
          average_cost_per_day: 5499,
          is_active: true
        });
      } finally {
        setLoadingDestination(false);
      }
    };

    loadDestination();
  }, [destinationId]);

  const handleInputChange = (field: string, value: string) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    if (!selectedDestination) return { subtotal: 0, taxes: 0, total: 0 };

    const adults = parseInt(bookingData.adults) || 0;
    const children = parseInt(bookingData.children) || 0;
    const pricePerPerson = selectedDestination.average_cost_per_day || 0;

    // Calculate for 3 days (2N/3D package)
    const days = 3;
    const basePrice = pricePerPerson * adults * days;
    const childrenPrice = pricePerPerson * 0.7 * children * days; // 30% discount for children
    const subtotal = basePrice + childrenPrice;
    const taxes = subtotal * 0.05; // 5% taxes instead of 12%

    return {
      subtotal: subtotal,
      taxes: taxes,
      total: subtotal + taxes
    };
  };

  const pricing = calculateTotal();

  if (loadingDestination) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading destination details...</p>
        </div>
      </div>
    );
  }

  if (!selectedDestination) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load destination details</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const buildBookingPayload = () => {
    if (!selectedDestination) {
      throw new Error('Destination data not loaded');
    }

    const adults = parseInt(bookingData.adults) || 0;
    const children = parseInt(bookingData.children) || 0;
    const seats = adults + children;

    if (seats < 1 || seats > 10) {
      throw new Error(`Invalid number of seats: ${seats}. Must be between 1 and 10.`);
    }

    const travelDate = bookingData.checkIn ? new Date(bookingData.checkIn).toISOString() : undefined;
    const totalAmount = calculateTotal().total;

    return {
      destination_id: selectedDestination.id,
      seats,
      special_requests: bookingData.specialRequests || '',
      total_amount: Math.round(totalAmount), // Round to avoid decimal issues
      travel_date: travelDate,
      contact_info: {
        phone: bookingData.phone,
        emergency_contact: bookingData.phone
      }
    };
  };

  const handleBooking = async () => {
    if (!isAuthenticated || !token) {
      toast({
        title: 'Not Authenticated',
        description: 'You must be logged in to make a booking.'
      });
      return;
    }
    setLoading(true);
    try {
      const payload = buildBookingPayload();
      await submitBooking({ payload, token });
      // Optionally: redirect or refresh dashboard
    } catch (error) {
      // Error handled in submitBooking
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-48 bg-sky-900 flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url("https://images.pexels.com/photos/1658967/pexels-photo-1658967.jpeg?auto=compress&cs=tinysrgb&w=1920&h=300&fit=crop")'
          }}
        />
        <div className="relative z-10 container mx-auto px-4 text-white">
          <h1 className="text-4xl font-bold mb-2">Complete Your Booking</h1>
          <p className="text-lg">You're just one step away from your dream vacation</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-sky-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={bookingData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={bookingData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={bookingData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Travel Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-sky-600" />
                  Travel Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkIn">Check-in Date *</Label>
                    <Input
                      id="checkIn"
                      type="date"
                      value={bookingData.checkIn}
                      onChange={(e) => handleInputChange('checkIn', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkOut">Check-out Date *</Label>
                    <Input
                      id="checkOut"
                      type="date"
                      value={bookingData.checkOut}
                      onChange={(e) => handleInputChange('checkOut', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="adults">Adults</Label>
                    <Select value={bookingData.adults} onValueChange={(value) => handleInputChange('adults', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select adults" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} Adult{num > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="children">Children</Label>
                    <Select value={bookingData.children} onValueChange={(value) => handleInputChange('children', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select children" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} Child{num > 1 ? 'ren' : num === 1 ? '' : 'ren'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    placeholder="Any special requirements or requests..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-sky-600" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Secure Payment Processing</p>
                  <p className="text-sm text-gray-500">Payment gateway integration would be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Package Details */}
                <div className="space-y-3">
                  <img
                    src={selectedDestination.featured_image_url || 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'}
                    alt={selectedDestination.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{selectedDestination.name}</h3>
                    <p className="text-gray-600">2N/3D • {selectedDestination.state}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-orange-600 font-medium">★ 4.8</span>
                      <span className="text-sm text-gray-500">per person</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* What's Included */}
                <div>
                  <h4 className="font-semibold mb-2">Popular Activities:</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    {selectedDestination.popular_activities?.slice(0, 5).map((activity, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-sky-600 rounded-full"></div>
                        {activity}
                      </li>
                    )) || [
                      <li key="default1" className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-sky-600 rounded-full"></div>
                        Accommodation
                      </li>,
                      <li key="default2" className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-sky-600 rounded-full"></div>
                        Meals
                      </li>,
                      <li key="default3" className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-sky-600 rounded-full"></div>
                        Transportation
                      </li>
                    ]}
                  </ul>
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{pricing.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Taxes & Fees:</span>
                    <span>₹{pricing.taxes.toLocaleString('en-IN')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-orange-600">₹{Math.round(pricing.total).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-lg" onClick={handleBooking} disabled={loading}>
                  {loading ? 'Processing...' : 'Complete Booking'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By clicking "Complete Booking", you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}