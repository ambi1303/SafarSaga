'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { MapPin, Star, Filter } from 'lucide-react';

const destinations = [
  {
    id: 1,
    name: 'Santorini, Greece',
    type: 'Beach',
    price: 899,
    duration: 5,
    rating: 4.9,
    image: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    description: 'Experience breathtaking sunsets and iconic white buildings'
  },
  {
    id: 2,
    name: 'Swiss Alps, Switzerland',
    type: 'Mountain',
    price: 1599,
    duration: 7,
    rating: 4.8,
    image: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    description: 'Majestic mountain peaks and pristine alpine lakes'
  },
  {
    id: 3,
    name: 'Tokyo, Japan',
    type: 'City',
    price: 1299,
    duration: 6,
    rating: 4.7,
    image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    description: 'Modern metropolis blending tradition and innovation'
  },
  {
    id: 4,
    name: 'Costa Rica Adventure',
    type: 'Adventure',
    price: 1899,
    duration: 10,
    rating: 4.9,
    image: 'https://images.pexels.com/photos/2088208/pexels-photo-2088208.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    description: 'Rainforests, volcanoes, and incredible wildlife'
  },
  {
    id: 5,
    name: 'Maldives',
    type: 'Beach',
    price: 2299,
    duration: 7,
    rating: 4.9,
    image: 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    description: 'Crystal clear waters and overwater bungalows'
  },
  {
    id: 6,
    name: 'New York City, USA',
    type: 'City',
    price: 799,
    duration: 4,
    rating: 4.6,
    image: 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    description: 'The city that never sleeps awaits your exploration'
  }
];

export default function DestinationsPage() {
  const [filteredDestinations, setFilteredDestinations] = useState(destinations);
  const [filters, setFilters] = useState({
    type: 'all',
    priceRange: [0, 3000],
    duration: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = () => {
    let filtered = destinations;

    if (filters.type !== 'all') {
      filtered = filtered.filter(dest => dest.type.toLowerCase() === filters.type.toLowerCase());
    }

    filtered = filtered.filter(dest => 
      dest.price >= filters.priceRange[0] && dest.price <= filters.priceRange[1]
    );

    if (filters.duration !== 'all') {
      if (filters.duration === 'short') {
        filtered = filtered.filter(dest => dest.duration <= 3);
      } else if (filters.duration === 'medium') {
        filtered = filtered.filter(dest => dest.duration >= 4 && dest.duration <= 7);
      } else if (filters.duration === 'long') {
        filtered = filtered.filter(dest => dest.duration >= 8);
      }
    }

    setFilteredDestinations(filtered);
  };

  const resetFilters = () => {
    setFilters({
      type: 'all',
      priceRange: [0, 3000],
      duration: 'all'
    });
    setFilteredDestinations(destinations);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-64 bg-sky-900 flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url("https://images.pexels.com/photos/1658967/pexels-photo-1658967.jpeg?auto=compress&cs=tinysrgb&w=1920&h=400&fit=crop")'
          }}
        />
        <div className="relative z-10 container mx-auto px-4 text-white">
          <h1 className="text-5xl font-bold mb-4">Explore Destinations</h1>
          <p className="text-xl">Discover amazing places around the world</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="flex gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6">
            <Button 
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Filters Sidebar */}
          <aside className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-6">Filter Destinations</h3>
              
              {/* Destination Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Type</label>
                <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="beach">Beach</SelectItem>
                    <SelectItem value="mountain">Mountain</SelectItem>
                    <SelectItem value="city">City</SelectItem>
                    <SelectItem value="adventure">Adventure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => setFilters({...filters, priceRange: value})}
                  max={3000}
                  min={0}
                  step={100}
                  className="mt-2"
                />
              </div>

              {/* Duration */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Duration</label>
                <Select value={filters.duration} onValueChange={(value) => setFilters({...filters, duration: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All durations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Durations</SelectItem>
                    <SelectItem value="short">1-3 days</SelectItem>
                    <SelectItem value="medium">4-7 days</SelectItem>
                    <SelectItem value="long">8+ days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Button onClick={applyFilters} className="w-full bg-sky-600 hover:bg-sky-700">
                  Apply Filters
                </Button>
                <Button onClick={resetFilters} variant="outline" className="w-full">
                  Reset Filters
                </Button>
              </div>
            </Card>
          </aside>

          {/* Destination Grid */}
          <main className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {filteredDestinations.length} destinations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {filteredDestinations.map((destination) => (
                <Card key={destination.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
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
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{destination.type}</span>
                      </div>
                      <span className="text-sm text-gray-600">{destination.duration} days</span>
                    </div>
                    
                    <h3 className="font-bold text-xl mb-2 group-hover:text-sky-600 transition-colors">
                      {destination.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      {destination.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-sky-600">
                        ${destination.price}
                      </span>
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                        View Package
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredDestinations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No destinations match your current filters.</p>
                <Button onClick={resetFilters} className="mt-4" variant="outline">
                  Reset Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}