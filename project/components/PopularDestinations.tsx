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
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Destinations</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the world's most captivating destinations, handpicked by our travel experts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <Card key={destination.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <div className="relative overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold">{destination.rating}</span>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{destination.name}</span>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 group-hover:text-sky-600 transition-colors">
                  {destination.name}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {destination.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-sky-600">{destination.price}</span>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="border-sky-600 text-sky-600 hover:bg-sky-600 hover:text-white">
            View All Destinations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;