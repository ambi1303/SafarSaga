'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Star } from 'lucide-react';
import { FadeIn, StaggerContainer } from '@/components/ScrollAnimations';

const destinations = [
  {
    id: 1,
    name: 'Manali, Himachal Pradesh',
    location: 'Himachal Pradesh',
    description: 'Snow-capped mountains, adventure sports, and scenic valleys',
    image: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
    rating: 4.8,
    price: 'From ₹12,999',
    duration: '3N/4D'
  },
  {
    id: 2,
    name: 'Srinagar, Kashmir',
    location: 'Jammu & Kashmir',
    description: 'Paradise on earth with pristine lakes and houseboats',
    image: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
    rating: 4.9,
    price: 'From ₹22,999',
    duration: '5N/6D'
  },
  {
    id: 3,
    name: 'Jaipur, Rajasthan',
    location: 'Rajasthan',
    description: 'Royal palaces, desert safaris, and rich cultural heritage',
    image: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
    rating: 4.7,
    price: 'From ₹18,999',
    duration: '4N/5D'
  },
  {
    id: 4,
    name: 'Goa Beaches',
    location: 'Goa',
    description: 'Pristine beaches, water sports, and vibrant nightlife',
    image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
    rating: 4.6,
    price: 'From ₹15,999',
    duration: '4N/5D'
  },
  {
    id: 5,
    name: 'Alleppey, Kerala',
    location: 'Kerala',
    description: 'Serene backwaters, houseboat cruises, and spice gardens',
    image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
    rating: 4.8,
    price: 'From ₹19,999',
    duration: '5N/6D'
  },
  {
    id: 6,
    name: 'Leh, Ladakh',
    location: 'Ladakh',
    description: 'High altitude desert, pristine lakes, and ancient monasteries',
    image: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
    rating: 4.9,
    price: 'From ₹35,999',
    duration: '7N/8D'
  }
];

const PopularDestinations = () => {
  return (
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
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 transition-colors duration-200"
                  >
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">View</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8 sm:mt-10 lg:mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base"
          >
            View All Destinations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;