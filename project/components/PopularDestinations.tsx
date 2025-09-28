'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Star } from 'lucide-react';

const destinations = [
  {
    id: 1,
    name: 'Santorini, Greece',
    description: 'Experience breathtaking sunsets and iconic white buildings',
    image: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
    rating: 4.9,
    price: 'From $899'
  },
  {
    id: 2,
    name: 'Bali, Indonesia',
    description: 'Tropical paradise with temples, beaches, and culture',
    image: 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
    rating: 4.8,
    price: 'From $599'
  },
  {
    id: 3,
    name: 'Tokyo, Japan',
    description: 'Modern metropolis blending tradition and innovation',
    image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
    rating: 4.7,
    price: 'From $1,299'
  },
  {
    id: 4,
    name: 'Patagonia, Argentina',
    description: 'Stunning landscapes and adventure activities',
    image: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
    rating: 4.8,
    price: 'From $1,599'
  },
  {
    id: 5,
    name: 'Maldives',
    description: 'Crystal clear waters and overwater bungalows',
    image: 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
    rating: 4.9,
    price: 'From $2,299'
  },
  {
    id: 6,
    name: 'Iceland',
    description: 'Northern lights, geysers, and dramatic landscapes',
    image: 'https://images.pexels.com/photos/1031588/pexels-photo-1031588.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
    rating: 4.6,
    price: 'From $1,199'
  }
];

const PopularDestinations = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Popular Destinations
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            Discover the world's most captivating destinations, handpicked by our travel experts
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {destinations.map((destination) => (
            <Card key={destination.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer">
              {/* Image Container */}
              <div className="relative overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-48 sm:h-56 lg:h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* Rating Badge */}
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white rounded-full px-2 sm:px-3 py-1 flex items-center space-x-1 shadow-md">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs sm:text-sm font-semibold">{destination.rating}</span>
                </div>
              </div>
              
              {/* Card Content */}
              <CardContent className="p-4 sm:p-5 lg:p-6">
                {/* Location */}
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="text-xs sm:text-sm">{destination.name}</span>
                </div>
                
                {/* Title */}
                <h3 className="font-semibold text-base sm:text-lg mb-2 group-hover:text-sky-600 transition-colors line-clamp-1">
                  {destination.name}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 mb-4 text-sm sm:text-base line-clamp-2">
                  {destination.description}
                </p>
                
                {/* Price and CTA */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-sky-600 flex-shrink-0">
                    {destination.price}
                  </span>
                  <Button 
                    size="sm" 
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm px-3 sm:px-4 flex-shrink-0"
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
            className="border-sky-600 text-sky-600 hover:bg-sky-600 hover:text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base"
          >
            View All Destinations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;