'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLoginRequired } from '@/components/auth/LoginRequiredModal';
import { BookingModal } from '@/components/booking/BookingModal';
import { BookingDestination } from '@/lib/booking-service';
import { DestinationsService, Destination } from '@/lib/destinations-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MapPin,
  Star,
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

const categories = [
  { id: 'all', name: 'All Destinations', icon: Compass, count: 0 },
  { id: 'adventure', name: 'Adventure', icon: Mountain, count: 0 },
  { id: 'beach', name: 'Beaches', icon: Waves, count: 0 },
  { id: 'nature', name: 'Nature', icon: Mountain, count: 0 },
  { id: 'cultural', name: 'Cultural', icon: Building, count: 0 }
];

export default function DestinationsPage() {
  const { isAuthenticated } = useAuth();
  const { showLoginRequired, LoginRequiredModal } = useLoginRequired();
  const [destinations, setDestinations] = useState<any[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<BookingDestination | null>(null);

  // Load destinations from backend
  useEffect(() => {
    loadDestinations();
  }, []);

  // Update categories count when destinations change
  const updateCategoryCounts = () => {
    categories[0].count = destinations.length;
    categories[1].count = destinations.filter(d => d.type === 'Adventure').length;
    categories[2].count = destinations.filter(d => d.type === 'Beach').length;
    categories[3].count = destinations.filter(d => d.type === 'Nature').length;
    categories[4].count = destinations.filter(d => d.type === 'Cultural').length;
  };

  useEffect(() => {
    updateCategoryCounts();
  }, [destinations]);

  const loadDestinations = async () => {
    try {
      setLoading(true);
      const backendDestinations = await DestinationsService.getDestinations({
        is_active: true,
        limit: 50
      });

      if (backendDestinations.items && backendDestinations.items.length > 0) {
        // Convert backend destinations to the format expected by the UI
        const uiDestinations = backendDestinations.items.map((dest: Destination) => ({
          id: dest.id, // Keep original UUID format
          name: dest.name,
          location: dest.state || 'India',
          type: dest.difficulty_level || 'Adventure',
          price: dest.package_price || 0,
          originalPrice: Math.round((dest.package_price || 0) * 1.3), // Mock original price
          duration: '2N/3D', // Default duration
          rating: 4.8, // Mock rating
          reviews: 100, // Mock reviews
          image: dest.featured_image_url || '/images/placeholder-destination.svg',
          description: dest.description || 'Amazing travel experience awaits you',
          highlights: dest.popular_activities?.slice(0, 3) || ['Great Experience', 'Professional Guide', 'Memorable Journey'],
          bestTime: dest.best_time_to_visit || 'Oct-Feb',
          groupSize: '2-8 people',
          featured: true // All destinations are featured for now
        }));

        setDestinations(uiDestinations);
        setFilteredDestinations(uiDestinations);
      } else {
        // Remove fallback to mockDestinations
        setDestinations([]);
        setFilteredDestinations([]);
      }
    } catch (error) {
      console.error('Failed to load destinations:', error);
      // Remove fallback to mockDestinations
      setDestinations([]);
      setFilteredDestinations([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleBookNow = (destination: any) => {
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
      price: destination.price,
      originalPrice: destination.originalPrice,
      duration: destination.duration,
      groupSize: destination.groupSize,
      image: destination.image,
      description: destination.description,
      highlights: destination.highlights,
      rating: destination.rating,
      reviews: destination.reviews,
      category: destination.type
    };

    setSelectedDestination(bookingDestination);
    setBookingModalOpen(true);
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
        filtered = filtered.filter(dest => dest.price < 6000);
      } else if (price === 'mid') {
        filtered = filtered.filter(dest => dest.price >= 6000 && dest.price < 7000);
      } else if (price === 'luxury') {
        filtered = filtered.filter(dest => dest.price >= 7000);
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
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative h-80 sm:h-96 lg:h-[500px] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url("https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop")'
            }}
          >
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
          <div className="relative z-10 text-center text-white w-full max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-orange-500/20 text-orange-200 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <MapPin className="h-4 w-4 mr-2" />
              EXPLORE DESTINATIONS
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 px-4">
              Discover <span className="text-orange-400">Incredible India</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 lg:mb-8 max-w-2xl mx-auto px-4">
              From snow-capped mountains to pristine beaches, explore the diverse beauty of India
            </p>

            {/* Search Bar */}
            <div className="max-w-sm lg:max-w-md mx-auto relative px-4 lg:px-0">
              <Search className="absolute left-6 lg:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 lg:h-5 lg:w-5" />
              <Input
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 lg:pl-10 pr-4 py-2 lg:py-3 bg-white/90 border-0 rounded-full text-gray-900 text-sm lg:text-base w-full"
              />
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 lg:py-12">
          {/* Category Filters */}
          <div className="mb-8 lg:mb-12">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6 text-center">Browse by Category</h2>
            <div className="flex flex-wrap justify-center gap-2 lg:gap-4">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Button
                    key={category.id}
                    onClick={() => handleCategoryFilter(category.id)}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className={`flex items-center gap-1 lg:gap-2 px-3 lg:px-6 py-2 lg:py-3 rounded-full text-xs lg:text-sm ${selectedCategory === category.id
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300'
                      }`}
                  >
                    <IconComponent className="h-3 w-3 lg:h-4 lg:w-4" />
                    <span className="hidden sm:inline">{category.name}</span>
                    <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {category.count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col gap-4 mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              <Select value={priceRange} onValueChange={handlePriceFilter}>
                <SelectTrigger className="w-full sm:w-40 lg:w-48">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="budget">Budget (Under ₹6k)</SelectItem>
                  <SelectItem value="mid">Mid-range (₹6k-7k)</SelectItem>
                  <SelectItem value="luxury">Premium (Above ₹7k)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={handleSort}>
                <SelectTrigger className="w-full sm:w-40 lg:w-48">
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

            <div className="text-center sm:text-left">
              <p className="text-gray-600 text-sm">
                Showing {filteredDestinations.length} of {destinations.length} destinations
              </p>
            </div>
          </div>

          {/* Destinations Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl lg:rounded-2xl overflow-hidden animate-pulse">
                  <div className="w-full h-40 sm:h-48 bg-gray-200"></div>
                  <div className="p-3 lg:p-5">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4 w-1/2"></div>
                    <div className="flex gap-2 mb-3">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {filteredDestinations.map((destination) => (
                <Card key={destination.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white rounded-xl lg:rounded-2xl">
                  <div className="relative overflow-hidden">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 lg:top-3 lg:left-3 flex flex-col gap-1 lg:gap-2">
                      {destination.featured && (
                        <Badge className="bg-orange-500 text-white text-xs font-medium px-2 py-1">
                          FEATURED
                        </Badge>
                      )}
                      <Badge variant="outline" className="bg-white/90 text-gray-900 text-xs px-2 py-1">
                        {destination.type}
                      </Badge>
                    </div>

                    {/* Rating and Heart */}
                    <div className="absolute top-2 right-2 lg:top-3 lg:right-3 flex flex-col gap-1 lg:gap-2">
                      <Button size="sm" variant="ghost" className="h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-white/20 hover:bg-white/30 text-white p-0">
                        <Heart className="h-3 w-3 lg:h-4 lg:w-4" />
                      </Button>
                      <div className="flex items-center bg-white/90 rounded-full px-2 py-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                        <span className="text-xs font-medium text-gray-900">{destination.rating}</span>
                      </div>
                    </div>

                    {/* Best Time */}
                    <div className="absolute bottom-2 left-2 lg:bottom-3 lg:left-3">
                      <Badge variant="outline" className="bg-white/90 text-gray-900 text-xs px-2 py-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {destination.bestTime}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-3 lg:p-5">
                    <div className="flex items-center justify-between mb-2 text-xs lg:text-sm">
                      <div className="flex items-center text-gray-500 min-w-0 flex-1">
                        <MapPin className="h-3 w-3 lg:h-4 lg:w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{destination.location}</span>
                      </div>
                      <div className="flex items-center text-gray-500 ml-2">
                        <Clock className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                        <span className="whitespace-nowrap">{destination.duration}</span>
                      </div>
                    </div>

                    <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors line-clamp-2">
                      {destination.name}
                    </h3>

                    <p className="text-gray-600 mb-3 text-xs lg:text-sm line-clamp-2">
                      {destination.description}
                    </p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-1 mb-3 lg:mb-4">
                      {destination.highlights.slice(0, 2).map((highlight: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200 px-2 py-1">
                          {highlight}
                        </Badge>
                      ))}
                    </div>

                    {/* Group Size and Reviews */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3 lg:mb-4">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        <span className="truncate">{destination.groupSize}</span>
                      </div>
                      <span className="whitespace-nowrap">{destination.reviews} reviews</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline">
                          <span className="text-lg lg:text-xl font-bold text-orange-500">
                            ₹{destination.price.toLocaleString()}
                          </span>
                          <span className="text-xs lg:text-sm text-gray-400 line-through ml-1 lg:ml-2">
                            ₹{destination.originalPrice.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-gray-500 text-xs">per person</span>
                      </div>
                      <div className="flex gap-1 lg:gap-2 ml-2">
                        <Button size="sm" variant="outline" className="p-1 lg:p-2 h-7 w-7 lg:h-8 lg:w-8">
                          <Camera className="h-3 w-3 lg:h-4 lg:w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleBookNow(destination)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-2 lg:px-4 text-xs lg:text-sm"
                        >
                          Book
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

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
            <div className="text-center mt-8 lg:mt-12">
              <Button
                size="lg"
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-50 px-6 lg:px-8 py-3 lg:py-4 rounded-full text-sm lg:text-base"
              >
                Load More Destinations
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}