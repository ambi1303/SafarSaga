'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLoginRequired } from '@/components/auth/LoginRequiredModal';
import { BookingModal } from '@/components/booking/BookingModal';
import { BookingDestination } from '@/lib/booking-service';
import { DestinationsService, Destination } from '@/lib/destinations-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Star, Loader2 } from 'lucide-react';
import { FadeIn, StaggerContainer } from '@/components/ScrollAnimations';

// Default placeholder image for destinations without images
const DEFAULT_PLACEHOLDER = '/images/placeholder-destination.svg';

const PopularDestinations = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showLoginRequired, LoginRequiredModal } = useLoginRequired();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<BookingDestination | null>(null);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch destinations from backend on component mount
  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    try {
      setLoading(true);
      const response = await DestinationsService.getDestinations({
        is_active: true,
        limit: 6 // Show top 6 destinations
      });

      if (response.items && response.items.length > 0) {
        // Convert backend destinations to UI format
        const uiDestinations = response.items.map((dest: Destination) => {
          console.log('Destination data:', dest); // Debug log to see actual data
          return {
            id: dest.id,
            name: dest.name,
            location: dest.state || 'India',
            description: dest.description || 'Amazing travel experience awaits you',
            image: dest.featured_image_url || DEFAULT_PLACEHOLDER,
            rating: 4.8, // Mock rating - can be added to backend later
            price: `₹${(dest.package_price || '0').toLocaleString('en-IN')}`,
            duration: '3N/4D' // Default duration - can be added to backend later
          };
        });
        setDestinations(uiDestinations);
      }
    } catch (error) {
      console.error('Failed to load destinations:', error);
      // Keep empty array on error
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookDestination = (destination: any) => {
    if (!isAuthenticated) {
      showLoginRequired({
        title: "Login Required to Book",
        message: `You need to be logged in to book "${destination.name}". Please sign in or create an account to continue with your booking.`,
        actionText: "book this destination"
      });
      return;
    }

    // Convert destination to BookingDestination format
    const bookingDestination: BookingDestination = {
      id: destination.id.toString(),
      name: destination.name,
      destination: destination.name,
      location: destination.location,
      price: parseInt(destination.price.replace(/[^\d]/g, '')), // Extract price from string
      originalPrice: parseInt(destination.price.replace(/[^\d]/g, '')) * 1.2, // Mock original price
      duration: destination.duration,
      groupSize: '2-8 people',
      image: destination.image,
      description: destination.description,
      highlights: ['Great Experience', 'Professional Guide', 'Memorable Journey'],
      rating: destination.rating,
      reviews: 100,
      category: 'Adventure'
    };

    setSelectedDestination(bookingDestination);
    setBookingModalOpen(true);
  };

  const handleViewAllDestinations = () => {
    router.push('/destinations');
  };

  return (
    <>
      <LoginRequiredModal />
      {selectedDestination && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedDestination(null);
          }}
          destination={selectedDestination}
          onBookingComplete={(bookingId) => {
            console.log('Booking completed:', bookingId);
            // Could redirect to booking details or show success message
          }}
        />
      )}
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
            POPULAR DESTINATIONS
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Explore <span className="text-orange-500">Incredible India</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            Discover India's most captivating destinations, from snow-capped mountains to pristine beaches
          </p>
        </div>

        {/* Destinations Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden animate-pulse">
                <div className="w-full h-48 sm:h-56 lg:h-64 bg-gray-200"></div>
                <CardContent className="p-4 sm:p-5">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No destinations available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {destinations.map((destination, index) => (
            <Card 
              key={destination.id} 
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
              style={{ 
                animationDelay: `${index * 100}ms`,
                opacity: 0,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-48 sm:h-56 lg:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 flex items-center space-x-1 shadow-md">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-semibold">{destination.rating}</span>
                </div>
                
                {/* Duration Badge */}
                <div className="absolute top-3 left-3 bg-orange-500 text-white rounded-full px-2 py-1">
                  <span className="text-xs font-medium">{destination.duration}</span>
                </div>
              </div>
              
              {/* Card Content */}
              <CardContent className="p-4 sm:p-5">
                {/* Location */}
                <div className="flex items-center text-gray-500 mb-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="text-xs">{destination.location}</span>
                </div>
                
                {/* Title */}
                <h3 className="font-semibold text-base sm:text-lg mb-2 group-hover:text-orange-500 transition-colors duration-200">
                  {destination.name}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                  {destination.description}
                </p>
                
                {/* Price and CTA */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-bold text-orange-500">
                    {destination.price}
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => handleBookDestination(destination)}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 transition-colors duration-200"
                  >
                    <span className="hidden sm:inline">Book Now</span>
                    <span className="sm:hidden">Book</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {/* View All Button */}
        {!loading && destinations.length > 0 && (
          <div className="text-center mt-8 sm:mt-10 lg:mt-12">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleViewAllDestinations}
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base"
            >
              View All Destinations
            </Button>
          </div>
        )}
      </div>
    </section>
    </>
  );
};

export default PopularDestinations;