'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLoginRequired } from '@/components/auth/LoginRequiredModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, Star, Heart, Camera, Mountain } from 'lucide-react';

const upcomingTrips = [
  {
    id: 1,
    title: 'Manali Snow Adventure',
    destination: 'Manali, Himachal Pradesh',
    date: 'March 15-18, 2025',
    duration: '3N/4D',
    price: 12999,
    originalPrice: 16999,
    spotsLeft: 8,
    image: 'https://brozaadventures.com/soft/file_store/highlight/1095884347CJ.jpg',
    highlights: ['Snow Activities', 'Solang Valley', 'Rohtang Pass'],
    rating: 4.8,
    reviews: 124,
    category: 'Adventure',
    featured: true
  },
  {
    id: 2,
    title: 'Kashmir Paradise',
    destination: 'Srinagar & Gulmarg, Kashmir',
    date: 'April 5-10, 2025',
    duration: '5N/6D',
    price: 22999,
    originalPrice: 28999,
    spotsLeft: 6,
    image: 'https://5.imimg.com/data5/OK/YU/DM/SELLER-33615216/kashmir-paradise-tour-packages-service.png',
    highlights: ['Houseboat Stay', 'Shikara Rides', 'Gulmarg Gondola'],
    rating: 4.9,
    reviews: 89,
    category: 'Nature',
    featured: false
  },
  {
    id: 3,
    title: 'Rajasthan Royal Heritage',
    destination: 'Jaipur & Udaipur, Rajasthan',
    date: 'May 20-25, 2025',
    duration: '5N/6D',
    price: 18999,
    originalPrice: 24999,
    spotsLeft: 4,
    image: 'https://www.rajasthanbhumitours.com/blog/wp-content/uploads/2024/07/rajasthan-tours.webp',
    highlights: ['Palace Tours', 'Desert Safari', 'Cultural Shows'],
    rating: 4.7,
    reviews: 156,
    category: 'Cultural',
    featured: true
  },
  {
    id: 4,
    title: 'Goa Beach Bliss',
    destination: 'North & South Goa',
    date: 'June 10-14, 2025',
    duration: '4N/5D',
    price: 15999,
    originalPrice: 19999,
    spotsLeft: 12,
    image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    highlights: ['Beach Activities', 'Water Sports', 'Nightlife'],
    rating: 4.6,
    reviews: 203,
    category: 'Beach',
    featured: false
  },
  {
    id: 5,
    title: 'Kerala Backwaters',
    destination: 'Alleppey & Munnar, Kerala',
    date: 'July 8-13, 2025',
    duration: '5N/6D',
    price: 19999,
    originalPrice: 25999,
    spotsLeft: 7,
    image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    highlights: ['Houseboat Cruise', 'Tea Gardens', 'Ayurveda Spa'],
    rating: 4.8,
    reviews: 167,
    category: 'Nature',
    featured: true
  },
  {
    id: 6,
    title: 'Ladakh Adventure',
    destination: 'Leh-Ladakh, J&K',
    date: 'August 15-22, 2025',
    duration: '7N/8D',
    price: 35999,
    originalPrice: 42999,
    spotsLeft: 3,
    image: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    highlights: ['High Altitude Lakes', 'Monasteries', 'Bike Expedition'],
    rating: 4.9,
    reviews: 98,
    category: 'Adventure',
    featured: true
  }
];

const UpcomingTrips = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showLoginRequired, LoginRequiredModal } = useLoginRequired();
  
  const featuredTrips = upcomingTrips.filter(trip => trip.featured);
  const regularTrips = upcomingTrips.filter(trip => !trip.featured);

  const handleBookTrip = (trip: any) => {
    if (!isAuthenticated) {
      showLoginRequired({
        title: "Login Required to Book",
        message: `You need to be logged in to book "${trip.title}". Please sign in or create an account to continue with your booking.`,
        actionText: "book this trip"
      });
      return;
    }

    // Show booking confirmation
    alert(`Booking initiated for ${trip.title}!\n\nDestination: ${trip.destination}\nDate: ${trip.date}\nPrice: ₹${trip.price}\nDuration: ${trip.duration}\nSpots Left: ${trip.spotsLeft}\n\nBooking system will be implemented to handle this request.`);
  };

  const handleExploreAll = () => {
    router.push('/destinations');
  };

  return (
    <>
      <LoginRequiredModal />
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Mountain className="h-4 w-4 mr-2" />
            UPCOMING ADVENTURES
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Your Next <span className="text-orange-500">Dream Trip</span> Awaits
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of travelers on our expertly crafted journeys across India's most breathtaking destinations
          </p>
        </div>

        {/* Featured Trips - Large Cards */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">✨ Featured Expeditions</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {featuredTrips.slice(0, 2).map((trip) => (
              <Card key={trip.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white rounded-2xl">
                <div className="relative overflow-hidden">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-72 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge className="bg-orange-500 text-white font-medium">
                      FEATURED
                    </Badge>
                    <Badge 
                      variant={trip.spotsLeft <= 5 ? "destructive" : "secondary"}
                      className="bg-white/90 text-gray-900 font-medium"
                    >
                      {trip.spotsLeft} spots left
                    </Badge>
                  </div>

                  {/* Heart Icon */}
                  <div className="absolute top-4 right-4">
                    <Button size="sm" variant="ghost" className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="outline" className="bg-white/90 text-gray-900 border-white/50">
                      {trip.category}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6 lg:p-8">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">{trip.destination}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                      <span className="text-sm font-medium text-gray-700">{trip.rating}</span>
                      <span className="text-xs text-gray-500 ml-1">({trip.reviews})</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-500 transition-colors">
                    {trip.title}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                      <span className="text-sm">{trip.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-orange-500" />
                      <span className="text-sm">{trip.duration}</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {trip.highlights.map((highlight, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline">
                        <span className="text-2xl lg:text-3xl font-bold text-orange-500">
                          ₹{trip.price.toLocaleString()}
                        </span>
                        <span className="text-lg text-gray-400 line-through ml-2">
                          ₹{trip.originalPrice.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">per person</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                        <Camera className="h-4 w-4 mr-2" />
                        Gallery
                      </Button>
                      <Button 
                        onClick={() => handleBookTrip(trip)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Regular Trips - Compact Grid */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">🌟 More Amazing Destinations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {regularTrips.map((trip) => (
              <Card key={trip.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white rounded-xl">
                <div className="relative overflow-hidden">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge 
                      variant={trip.spotsLeft <= 5 ? "destructive" : "secondary"}
                      className="bg-white/90 text-gray-900 font-medium text-xs"
                    >
                      {trip.spotsLeft} left
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center bg-white/90 rounded-full px-2 py-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                      <span className="text-xs font-medium">{trip.rating}</span>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-5">
                  <div className="flex items-center text-gray-500 mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="text-xs">{trip.destination}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-orange-500 transition-colors line-clamp-1">
                    {trip.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{trip.duration}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {trip.category}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {trip.highlights.slice(0, 2).map((highlight, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-orange-500">
                        ₹{trip.price.toLocaleString()}
                      </span>
                      <div className="text-xs text-gray-400 line-through">
                        ₹{trip.originalPrice.toLocaleString()}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleBookTrip(trip)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-4"
                    >
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12 lg:mt-16">
          <Button 
            size="lg" 
            onClick={handleExploreAll}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Explore All Destinations
            <Mountain className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
    </>
  );
};

export default UpcomingTrips;