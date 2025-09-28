'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Star, 
  Filter, 
  Search, 
  Calendar, 
  Users, 
  Camera, 
  Heart,
  Mountain,
  Waves,
  Building,
  Compass,
  Clock,
  ArrowRight
} from 'lucide-react';

const destinations = [
  {
    id: 1,
    name: 'Manali Adventure',
    location: 'Himachal Pradesh',
    type: 'Mountain',
    price: 12999,
    originalPrice: 16999,
    duration: '3N/4D',
    rating: 4.8,
    reviews: 245,
    image: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    description: 'Experience snow-capped mountains, adventure sports, and scenic valleys',
    highlights: ['Solang Valley', 'Rohtang Pass', 'Adventure Sports'],
    bestTime: 'Oct-Feb',
    groupSize: '4-8 people',
    featured: true
  },
  {
    id: 2,
    name: 'Kashmir Paradise',
    location: 'Jammu & Kashmir',
    type: 'Nature',
    price: 22999,
    originalPrice: 28999,
    duration: '5N/6D',
    rating: 4.9,
    reviews: 189,
    image: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    description: 'Heaven on earth with pristine lakes, houseboats, and snow-capped peaks',
    highlights: ['Dal Lake', 'Gulmarg', 'Pahalgam'],
    bestTime: 'Apr-Oct',
    groupSize: '2-6 people',
    featured: true
  },
  {
    id: 3,
    name: 'Rajasthan Royal',
    location: 'Rajasthan',
    type: 'Cultural',
    price: 18999,
    originalPrice: 24999,
    duration: '4N/5D',
    rating: 4.7,
    reviews: 312,
    image: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    description: 'Explore magnificent palaces, forts, and rich cultural heritage',
    highlights: ['City Palace', 'Amber Fort', 'Desert Safari'],
    bestTime: 'Oct-Mar',
    groupSize: '6-12 people',
    featured: false
  },
  {
    id: 4,
    name: 'Goa Beach Bliss',
    location: 'Goa',
    type: 'Beach',
    price: 15999,
    originalPrice: 19999,
    duration: '4N/5D',
    rating: 4.6,
    reviews: 278,
    image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    description: 'Pristine beaches, water sports, and vibrant nightlife',
    highlights: ['Beach Activities', 'Water Sports', 'Nightlife'],
    bestTime: 'Nov-Feb',
    groupSize: '2-8 people',
    featured: false
  },
  {
    id: 5,
    name: 'Kerala Backwaters',
    location: 'Kerala',
    type: 'Nature',
    price: 19999,
    originalPrice: 25999,
    duration: '5N/6D',
    rating: 4.8,
    reviews: 167,
    image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    description: 'Serene backwaters, lush greenery, and traditional houseboats',
    highlights: ['Houseboat Cruise', 'Tea Gardens', 'Ayurveda'],
    bestTime: 'Sep-Mar',
    groupSize: '2-6 people',
    featured: true
  },
  {
    id: 6,
    name: 'Ladakh Expedition',
    location: 'Ladakh',
    type: 'Adventure',
    price: 35999,
    originalPrice: 42999,
    duration: '7N/8D',
    rating: 4.9,
    reviews: 98,
    image: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    description: 'High altitude desert, pristine lakes, and ancient monasteries',
    highlights: ['Pangong Lake', 'Nubra Valley', 'Monasteries'],
    bestTime: 'May-Sep',
    groupSize: '4-8 people',
    featured: true
  },
  {
    id: 7,
    name: 'Uttarakhand Hills',
    location: 'Uttarakhand',
    type: 'Mountain',
    price: 14999,
    originalPrice: 18999,
    duration: '4N/5D',
    rating: 4.5,
    reviews: 134,
    image: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    description: 'Spiritual journey through hill stations and holy temples',
    highlights: ['Rishikesh', 'Haridwar', 'Mussoorie'],
    bestTime: 'Mar-Jun',
    groupSize: '4-10 people',
    featured: false
  },
  {
    id: 8,
    name: 'Andaman Islands',
    location: 'Andaman & Nicobar',
    type: 'Beach',
    price: 28999,
    originalPrice: 35999,
    duration: '6N/7D',
    rating: 4.7,
    reviews: 156,
    image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    description: 'Pristine beaches, coral reefs, and crystal clear waters',
    highlights: ['Radhanagar Beach', 'Scuba Diving', 'Island Hopping'],
    bestTime: 'Oct-May',
    groupSize: '2-6 people',
    featured: false
  }
];

const categories = [
  { id: 'all', name: 'All Destinations', icon: Compass, count: destinations.length },
  { id: 'mountain', name: 'Mountains', icon: Mountain, count: destinations.filter(d => d.type === 'Mountain').length },
  { id: 'beach', name: 'Beaches', icon: Waves, count: destinations.filter(d => d.type === 'Beach').length },
  { id: 'nature', name: 'Nature', icon: Mountain, count: destinations.filter(d => d.type === 'Nature').length },
  { id: 'cultural', name: 'Cultural', icon: Building, count: destinations.filter(d => d.type === 'Cultural').length },
  { id: 'adventure', name: 'Adventure', icon: Compass, count: destinations.filter(d => d.type === 'Adventure').length }
];

export default function DestinationsPage() {
  const [filteredDestinations, setFilteredDestinations] = useState(destinations);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterDestinations(term, selectedCategory, priceRange, sortBy);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    filterDestinations(searchTerm, category, priceRange, sortBy);
  };

  const handlePriceFilter = (price: string) => {
    setPriceRange(price);
    filterDestinations(searchTerm, selectedCategory, price, sortBy);
  };

  const handleSort = (sort: string) => {
    setSortBy(sort);
    filterDestinations(searchTerm, selectedCategory, priceRange, sort);
  };

  const filterDestinations = (search: string, category: string, price: string, sort: string) => {
    let filtered = destinations;

    // Search filter
    if (search) {
      filtered = filtered.filter(dest => 
        dest.name.toLowerCase().includes(search.toLowerCase()) ||
        dest.location.toLowerCase().includes(search.toLowerCase()) ||
        dest.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category filter
    if (category !== 'all') {
      filtered = filtered.filter(dest => dest.type.toLowerCase() === category.toLowerCase());
    }

    // Price filter
    if (price !== 'all') {
      if (price === 'budget') {
        filtered = filtered.filter(dest => dest.price < 20000);
      } else if (price === 'mid') {
        filtered = filtered.filter(dest => dest.price >= 20000 && dest.price < 30000);
      } else if (price === 'luxury') {
        filtered = filtered.filter(dest => dest.price >= 30000);
      }
    }

    // Sort
    if (sort === 'price-low') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      filtered = filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      filtered = filtered.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'featured') {
      filtered = filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    setFilteredDestinations([...filtered]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 lg:h-[500px] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop")'
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <div className="inline-flex items-center bg-orange-500/20 text-orange-200 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <MapPin className="h-4 w-4 mr-2" />
            EXPLORE DESTINATIONS
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Discover <span className="text-orange-400">Incredible India</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            From snow-capped mountains to pristine beaches, explore the diverse beauty of India
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search destinations..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white/90 border-0 rounded-full text-gray-900"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Category Filters */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Browse by Category</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.id)}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full ${
                    selectedCategory === category.id 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {category.name}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {category.count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Select value={priceRange} onValueChange={handlePriceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="budget">Budget (Under ₹20k)</SelectItem>
                <SelectItem value="mid">Mid-range (₹20k-30k)</SelectItem>
                <SelectItem value="luxury">Luxury (Above ₹30k)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={handleSort}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-gray-600">
            Showing {filteredDestinations.length} of {destinations.length} destinations
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDestinations.map((destination) => (
            <Card key={destination.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white rounded-2xl">
              <div className="relative overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {destination.featured && (
                    <Badge className="bg-orange-500 text-white text-xs font-medium">
                      FEATURED
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-white/90 text-gray-900 text-xs">
                    {destination.type}
                  </Badge>
                </div>

                {/* Rating and Heart */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white p-0">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center bg-white/90 rounded-full px-2 py-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                    <span className="text-xs font-medium text-gray-900">{destination.rating}</span>
                  </div>
                </div>

                {/* Best Time */}
                <div className="absolute bottom-3 left-3">
                  <Badge variant="outline" className="bg-white/90 text-gray-900 text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {destination.bestTime}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{destination.location}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">{destination.duration}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors">
                  {destination.name}
                </h3>
                
                <p className="text-gray-600 mb-3 text-sm line-clamp-2">
                  {destination.description}
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {destination.highlights.slice(0, 2).map((highlight, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                      {highlight}
                    </Badge>
                  ))}
                </div>

                {/* Group Size and Reviews */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    <span>{destination.groupSize}</span>
                  </div>
                  <span>{destination.reviews} reviews</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-xl font-bold text-orange-500">
                        ₹{destination.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400 line-through ml-2">
                        ₹{destination.originalPrice.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-gray-500 text-xs">per person</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="p-2 h-8 w-8">
                      <Camera className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white px-4">
                      Book
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredDestinations.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No destinations found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setPriceRange('all');
                  setSortBy('featured');
                  setFilteredDestinations(destinations);
                }}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Reset All Filters
              </Button>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {filteredDestinations.length > 0 && (
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-4 rounded-full"
            >
              Load More Destinations
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}