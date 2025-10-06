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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Calendar,
  Users,
  Star,
  Search,
  Filter,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';

// Travel package data
const packages = [
  {
    id: 1,
    name: "Manali & Kasol 2N/3D",
    destination: "Manali & Kasol",
    price: 5499,
    originalPrice: 7999,
    duration: "2N/3D",
    groupSize: "4-8 people",
    image: "https://liveb4youdie.com/wp-content/uploads/2021/10/lk3gk710you9ms5vu287emjabfd3_0001-5078545066_20210730_154224_0000.jpg",
    description: "Experience the beauty of Himachal with snow-capped mountains and serene valleys",
    highlights: ["Snow Activities", "Valley Views", "Local Culture", "Adventure Sports"],
    rating: 4.8,
    reviews: 124,
    category: "adventure"
  },
  {
    id: 2,
    name: "Chakrata 1N/2D",
    destination: "Chakrata",
    price: 4999,
    originalPrice: 6499,
    duration: "1N/2D",
    groupSize: "2-6 people",
    image: "https://storage.googleapis.com/stateless-www-justwravel-com/2024/11/4e0d5d8a-chakrata-1.jpg",
    description: "Peaceful hill station getaway with pristine nature and tranquil environment",
    highlights: ["Nature Walks", "Tiger Falls", "Peaceful Environment", "Hill Station"],
    rating: 4.7,
    reviews: 89,
    category: "nature"
  },
  {
    id: 3,
    name: "Jibhi 2N/3D",
    destination: "Jibhi",
    price: 5499,
    originalPrice: 7499,
    duration: "2N/3D",
    groupSize: "4-8 people",
    image: "https://www.outdoorkeeda.com/wp-content/uploads/2025/06/Secret-Beauty-of-Jibhi-1536x864.webp",
    description: "Hidden gem of Himachal with untouched natural beauty and serenity",
    highlights: ["Waterfall Trek", "Forest Walks", "Local Villages", "Photography"],
    rating: 4.9,
    reviews: 156,
    category: "nature"
  },
  {
    id: 4,
    name: "Chopta 2N/3D",
    destination: "Chopta",
    price: 5499,
    originalPrice: 7299,
    duration: "2N/3D",
    groupSize: "4-10 people",
    image: "https://euttarakhandpackage.com/wp-content/uploads/2019/09/chopta.jpg",
    description: "Mini Switzerland of India with breathtaking meadows and mountain views",
    highlights: ["Tungnath Trek", "Chandrashila Peak", "Meadows", "Mountain Views"],
    rating: 4.8,
    reviews: 203,
    category: "adventure"
  },
  {
    id: 5,
    name: "Udaipur 2N/3D",
    destination: "Udaipur",
    price: 5999,
    originalPrice: 8499,
    duration: "2N/3D",
    groupSize: "2-8 people",
    image: "https://s7ap1.scene7.com/is/image/incredibleindia/jag-mandir-palace-udaipur-rajasthan-2-new-attr-hero?qlt=82&ts=1742169192999",
    description: "City of Lakes with royal palaces and rich cultural heritage",
    highlights: ["City Palace", "Lake Pichola", "Boat Rides", "Royal Heritage"],
    rating: 4.9,
    reviews: 198,
    category: "cultural"
  },
  {
    id: 6,
    name: "Auli 2N/3D",
    destination: "Auli",
    price: 6999,
    originalPrice: 9499,
    duration: "2N/3D",
    groupSize: "4-8 people",
    image: "https://s3.india.com/wp-content/uploads/2024/08/Skiing-on-Pristine-Slopes.jpg?impolicy=Medium_Widthonly&w=350&h=263",
    description: "Skiing paradise with panoramic Himalayan views and adventure activities",
    highlights: ["Skiing", "Cable Car", "Himalayan Views", "Adventure Sports"],
    rating: 4.8,
    reviews: 167,
    category: "adventure"
  },
  {
    id: 7,
    name: "Jaisalmer 2N/3D",
    destination: "Jaisalmer",
    price: 5499,
    originalPrice: 7799,
    duration: "2N/3D",
    groupSize: "4-10 people",
    image: "https://www.adventurush.com/wp-content/uploads/2023/01/shutterstock_171674846.jpg",
    description: "Golden city with magnificent forts, desert safaris and cultural experiences",
    highlights: ["Desert Safari", "Jaisalmer Fort", "Camel Rides", "Cultural Shows"],
    rating: 4.7,
    reviews: 142,
    category: "cultural"
  },
  {
    id: 8,
    name: "Manali & Kasol 3N/4D",
    destination: "Manali & Kasol",
    price: 5999,
    originalPrice: 8799,
    duration: "3N/4D",
    groupSize: "4-8 people",
    image: "https://liveb4youdie.com/wp-content/uploads/2021/10/lk3gk710you9ms5vu287emjabfd3_0001-5078545066_20210730_154224_0000.jpg",
    description: "Extended Himachal experience with more time to explore the beautiful valleys",
    highlights: ["Extended Stay", "Multiple Destinations", "Adventure Activities", "Local Culture"],
    rating: 4.9,
    reviews: 186,
    category: "adventure"
  }
];

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Delhi",
    text: "Amazing experience in Manali! The team was professional and the itinerary was perfect.",
    rating: 5,
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
  },
  {
    name: "Rahul Gupta",
    location: "Mumbai",
    text: "Goa trip was fantastic! Great value for money and excellent service throughout.",
    rating: 5,
    image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
  },
  {
    name: "Anjali Patel",
    location: "Bangalore",
    text: "Kashmir was breathtaking! SafarSaga made our dream trip come true.",
    rating: 5,
    image: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
  }
];

const faqs = [
  {
    question: "What's included in the package price?",
    answer: "Our packages typically include accommodation, meals, transportation, sightseeing, and a dedicated tour guide. Specific inclusions vary by package."
  },
  {
    question: "Can I customize my trip?",
    answer: "Yes! We offer customizable packages. Contact us to discuss your preferences and we'll create a personalized itinerary."
  },
  {
    question: "What's your cancellation policy?",
    answer: "Cancellations made 15+ days before travel get 90% refund. 7-14 days: 50% refund. Less than 7 days: 25% refund."
  },
  {
    question: "Do you provide travel insurance?",
    answer: "We recommend travel insurance and can help you get coverage. It's not included in the base package price."
  }
];

export default function PackagesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showLoginRequired, LoginRequiredModal } = useLoginRequired();
  const [packages, setPackages] = useState<any[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<BookingDestination | null>(null);

  // Load packages from backend
  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const backendDestinations = await DestinationsService.getDestinations({
        is_active: true,
        limit: 50
      });
      
      // Convert backend destinations to package format
      const uiPackages = backendDestinations.items.map((dest: Destination) => ({
        id: dest.id, // Keep original UUID format
        name: dest.name,
        destination: `${dest.name}, ${dest.state}`,
        price: Math.round(dest.average_cost_per_day ? dest.average_cost_per_day * 3 : 5499), // 3 days default
        originalPrice: Math.round(dest.average_cost_per_day ? dest.average_cost_per_day * 3 * 1.4 : 7699), // 40% markup
        duration: "2N/3D", // Default duration
        groupSize: "2-8 people", // Default group size
        image: dest.featured_image_url || 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
        description: dest.description || `Explore the beautiful ${dest.name} with our carefully crafted travel package.`,
        highlights: dest.popular_activities?.slice(0, 4) || ['Adventure', 'Sightseeing', 'Local Culture', 'Photography'],
        rating: 4.8, // Default rating
        reviews: Math.floor(Math.random() * 200) + 50, // Random reviews between 50-250
        category: dest.difficulty_level?.toLowerCase() === 'easy' ? 'nature' : 
                 dest.difficulty_level?.toLowerCase() === 'challenging' ? 'adventure' : 'cultural'
      }));
      
      setPackages(uiPackages);
      setFilteredPackages(uiPackages);
    } catch (error) {
      console.error('Failed to load packages:', error);
      // Use mock data as fallback
      const mockPackages = [
        {
          id: 1,
          name: "Manali & Kasol 2N/3D",
          destination: "Manali & Kasol",
          price: 5499,
          originalPrice: 7999,
          duration: "2N/3D",
          groupSize: "4-8 people",
          image: "https://liveb4youdie.com/wp-content/uploads/2021/10/lk3gk710you9ms5vu287emjabfd3_0001-5078545066_20210730_154224_0000.jpg",
          description: "Experience the beauty of Himachal with snow-capped mountains and serene valleys",
          highlights: ["Snow Activities", "Valley Views", "Local Culture", "Adventure Sports"],
          rating: 4.8,
          reviews: 124,
          category: "adventure"
        },
        {
          id: 2,
          name: "Chakrata 1N/2D",
          destination: "Chakrata",
          price: 4999,
          originalPrice: 6499,
          duration: "1N/2D",
          groupSize: "2-6 people",
          image: "https://storage.googleapis.com/stateless-www-justwravel-com/2024/11/4e0d5d8a-chakrata-1.jpg",
          description: "Peaceful hill station getaway with pristine nature and tranquil environment",
          highlights: ["Nature Walks", "Tiger Falls", "Peaceful Environment", "Hill Station"],
          rating: 4.7,
          reviews: 89,
          category: "nature"
        }
      ];
      setPackages(mockPackages);
      setFilteredPackages(mockPackages);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterPackages(term, categoryFilter, priceFilter);
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    filterPackages(searchTerm, category, priceFilter);
  };

  const handlePriceFilter = (price: string) => {
    setPriceFilter(price);
    filterPackages(searchTerm, categoryFilter, price);
  };

  const handleBookNow = (pkg: any) => {
    if (!isAuthenticated) {
      showLoginRequired({
        title: "Login Required to Book",
        message: `You need to be logged in to book "${pkg.name}". Please sign in or create an account to continue with your booking.`,
        actionText: "book this package"
      });
      return;
    }

    // Convert package to BookingDestination format
    const bookingDestination: BookingDestination = {
      id: pkg.id.toString(),
      name: pkg.name,
      destination: pkg.destination,
      location: pkg.destination,
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      duration: pkg.duration,
      groupSize: pkg.groupSize,
      image: pkg.image,
      description: pkg.description,
      highlights: pkg.highlights,
      rating: pkg.rating,
      reviews: pkg.reviews,
      category: pkg.category
    };

    setSelectedPackage(bookingDestination);
    setBookingModalOpen(true);
  };

  const filterPackages = (search: string, category: string, price: string) => {
    let filtered = packages;

    if (search) {
      filtered = filtered.filter(pkg =>
        pkg.name.toLowerCase().includes(search.toLowerCase()) ||
        pkg.destination.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== 'all') {
      filtered = filtered.filter(pkg => pkg.category === category);
    }

    if (price !== 'all') {
      if (price === 'low') {
        filtered = filtered.filter(pkg => pkg.price < 6000);
      } else if (price === 'medium') {
        filtered = filtered.filter(pkg => pkg.price >= 6000 && pkg.price < 7000);
      } else if (price === 'high') {
        filtered = filtered.filter(pkg => pkg.price >= 7000);
      }
    }

    setFilteredPackages(filtered);
  };

  return (
    <>
      <LoginRequiredModal />
      {selectedPackage && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedPackage(null);
          }}
          destination={selectedPackage}
          onBookingComplete={(bookingId) => {
            console.log('Booking completed:', bookingId);
            // Close the modal first
            setBookingModalOpen(false);
            setSelectedPackage(null);
            // Show success message and redirect to dashboard
            setTimeout(() => {
              router.push('/dashboard?booking=success');
            }, 500);
          }}
        />
      )}
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Explore the Unexplored
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Discover amazing destinations with our carefully crafted travel packages
          </p>
          <Button 
            size="lg" 
            onClick={() => {
              if (!isAuthenticated) {
                showLoginRequired({
                  title: "Login Required",
                  message: "You need to be logged in to book an adventure. Please sign in or create an account to continue.",
                  actionText: "book your adventure"
                });
              } else {
                // Scroll to packages section
                document.querySelector('#packages-section')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg"
          >
            Book Your Adventure Now
          </Button>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="adventure">Adventure</SelectItem>
                <SelectItem value="beach">Beach</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="nature">Nature</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priceFilter} onValueChange={handlePriceFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="low">Under ₹6,000</SelectItem>
                <SelectItem value="medium">₹6,000 - ₹7,000</SelectItem>
                <SelectItem value="high">Above ₹7,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Package Listings */}
      <section id="packages-section" className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Travel Packages
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our handpicked destinations and create memories that last a lifetime
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="flex justify-between items-center mb-6">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-10 bg-gray-200 rounded flex-1"></div>
                      <div className="h-10 bg-gray-200 rounded flex-1"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPackages.map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="relative overflow-hidden">
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-orange-500 text-white">
                      Save ₹{pkg.originalPrice - pkg.price}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 rounded-full px-2 py-1 flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium ml-1">{pkg.rating}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {pkg.destination}
                    <Calendar className="h-4 w-4 ml-4 mr-1" />
                    {pkg.duration}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 mb-4">{pkg.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {pkg.highlights.map((highlight, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Users className="h-4 w-4 mr-1" />
                      {pkg.groupSize}
                    </div>
                    <div className="text-sm text-gray-500">
                      {pkg.reviews} reviews
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-2xl font-bold text-orange-500">₹{pkg.price.toLocaleString()}</span>
                      <span className="text-sm text-gray-500 line-through ml-2">₹{pkg.originalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      Read More
                    </Button>
                    <Button 
                      onClick={() => handleBookNow(pkg)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                    >
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Book your perfect trip in just 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Select Destination",
                description: "Browse and choose your perfect travel package",
                icon: MapPin
              },
              {
                step: "2",
                title: "Book & Pay",
                description: "Secure your booking with easy payment options",
                icon: CheckCircle
              },
              {
                step: "3",
                title: "Travel",
                description: "Pack your bags and start your adventure",
                icon: Calendar
              },
              {
                step: "4",
                title: "Enjoy",
                description: "Create unforgettable memories",
                icon: Star
              }
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured/Upcoming Trips */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Trips
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't miss out on these amazing upcoming adventures
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop"
                alt="Featured Trip"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <Badge className="bg-red-500 mb-2">Limited Seats</Badge>
                <h3 className="text-2xl font-bold mb-2">Ladakh Expedition</h3>
                <p className="text-lg mb-4">Starting from ₹35,999</p>
                <Button 
                  onClick={() => handleBookNow({
                    id: 'ladakh-expedition',
                    name: 'Ladakh Expedition',
                    destination: 'Ladakh',
                    price: 35999,
                    duration: '7N/8D',
                    groupSize: '6-12 people'
                  })}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Book Now
                </Button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop"
                alt="Featured Trip"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <Badge className="bg-green-500 mb-2">Early Bird</Badge>
                <h3 className="text-2xl font-bold mb-2">Andaman Islands</h3>
                <p className="text-lg mb-4">Starting from ₹28,999</p>
                <Button 
                  onClick={() => handleBookNow({
                    id: 'andaman-islands',
                    name: 'Andaman Islands',
                    destination: 'Andaman & Nicobar Islands',
                    price: 28999,
                    duration: '5N/6D',
                    groupSize: '4-10 people'
                  })}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Travelers Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real experiences from real travelers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Got questions? We've got answers
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact/Inquiry */}
      <section className="py-16 bg-orange-500 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Need a Custom Package?
            </h2>
            <p className="text-lg max-w-2xl mx-auto mb-8">
              Can't find what you're looking for? Let us create a personalized travel experience just for you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div>
              <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3" />
                  <a
                    href="tel:+919311706027"
                    className="hover:text-orange-300 transition-colors"
                  >
                    +91 9311706027
                  </a>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3" />
                  <a
                    href="mailto:safarsagatrips@gmail.com"
                    className="hover:text-orange-300 transition-colors"
                  >
                    safarsagatrips@gmail.com
                  </a>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-3" />
                  <span>WhatsApp Support Available</span>
                </div>
              </div>
            </div>

            <div>
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Inquiry</h3>
                <div className="space-y-4">
                  <Input placeholder="Your Name" />
                  <Input placeholder="Your Email" />
                  <Input placeholder="Your Phone" />
                  <Input placeholder="Preferred Destination" />
                  <textarea
                    placeholder="Tell us about your dream trip..."
                    className="w-full p-3 border rounded-lg resize-none h-24"
                  />
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    Send Inquiry
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}