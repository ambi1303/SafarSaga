'use client';

import { useState } from 'react';
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

  const [selectedPackage] = useState({
    id: '0dc450e9-4355-468b-be11-75f2e1a87d63', // Real destination ID
    name: 'Santorini Dream Package',
    image: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    duration: '5 days, 4 nights',
    price: 899,
    includes: ['Round-trip flights', '4-star hotel accommodation', 'Daily breakfast', 'Airport transfers', 'Local guide']
  });

  const { toast } = useToast();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    const adults = parseInt(bookingData.adults) || 0;
    const children = parseInt(bookingData.children) || 0;
    const basePrice = selectedPackage.price * adults;
    const childrenPrice = selectedPackage.price * 0.5 * children;
    const taxes = (basePrice + childrenPrice) * 0.12;
    return {
      subtotal: basePrice + childrenPrice,
      taxes: taxes,
      total: basePrice + childrenPrice + taxes
    };
  };

  const pricing = calculateTotal();

  const buildBookingPayload = () => {
    const adults = parseInt(bookingData.adults) || 0;
    const children = parseInt(bookingData.children) || 0;
    const seats = adults + children;
    if (seats < 1 || seats > 10) {
      throw new Error(`Invalid number of seats: ${seats}. Must be between 1 and 10.`);
    }
    const travelDate = bookingData.checkIn ? new Date(bookingData.checkIn).toISOString() : undefined;
    return {
      destination_id: selectedPackage.id,
      seats,
      special_requests: bookingData.specialRequests || '',
      total_amount: calculateTotal().total,
      travel_date: travelDate,
      contact_info: {
        phone: bookingData.phone,
        emergency_contact: bookingData.phone // Use phone as emergency_contact for now
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
                    src={selectedPackage.image}
                    alt={selectedPackage.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{selectedPackage.name}</h3>
                    <p className="text-gray-600">{selectedPackage.duration}</p>
                  </div>
                </div>

                <Separator />

                {/* What's Included */}
                <div>
                  <h4 className="font-semibold mb-2">What's Included:</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    {selectedPackage.includes.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-sky-600 rounded-full"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${pricing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Taxes & Fees:</span>
                    <span>${pricing.taxes.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-sky-600">${pricing.total.toFixed(2)}</span>
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