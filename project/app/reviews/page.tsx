'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Star, 
  Quote, 
  Camera, 
  MapPin, 
  Calendar, 
  Users, 
  Heart,
  Filter,
  Search,
  ThumbsUp,
  MessageCircle,
  Share2,
  Award,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Delhi',
    destination: 'Manali Adventure',
    rating: 5,
    date: '2 weeks ago',
    title: 'Absolutely Amazing Experience!',
    content: 'Our Manali trip with SafarSaga was beyond expectations! The snow activities were thrilling, and the accommodation was top-notch. The team was very professional and took care of every detail. Highly recommend for adventure lovers!',
    images: [
      'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
    ],
    likes: 24,
    helpful: 18,
    verified: true,
    tripType: 'Family',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    id: 2,
    name: 'Rahul Gupta',
    location: 'Mumbai',
    destination: 'Kashmir Paradise',
    rating: 5,
    date: '1 month ago',
    title: 'Heaven on Earth - Kashmir Trip',
    content: 'Kashmir is truly paradise! The houseboat stay on Dal Lake was magical. SafarSaga arranged everything perfectly - from airport pickup to sightseeing. The Gulmarg gondola ride was breathtaking. Worth every penny!',
    images: [
      'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
    ],
    likes: 31,
    helpful: 25,
    verified: true,
    tripType: 'Couple',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    id: 3,
    name: 'Anjali Patel',
    location: 'Bangalore',
    destination: 'Rajasthan Royal',
    rating: 4,
    date: '3 weeks ago',
    title: 'Royal Treatment in Rajasthan',
    content: 'The palaces and forts were magnificent! Our guide was very knowledgeable about the history. The desert safari was an unforgettable experience. Only minor issue was the hotel room, but overall excellent trip.',
    images: [
      'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
    ],
    likes: 19,
    helpful: 14,
    verified: true,
    tripType: 'Friends',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    id: 4,
    name: 'Vikram Singh',
    location: 'Pune',
    destination: 'Goa Beach Bliss',
    rating: 5,
    date: '2 months ago',
    title: 'Perfect Beach Vacation',
    content: 'Goa was exactly what we needed! Beautiful beaches, great water sports, and amazing nightlife. The resort was beachfront with all amenities. SafarSaga team was available 24/7 for any assistance. Will definitely book again!',
    images: [
      'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
    ],
    likes: 27,
    helpful: 21,
    verified: true,
    tripType: 'Friends',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    id: 5,
    name: 'Meera Reddy',
    location: 'Hyderabad',
    destination: 'Kerala Backwaters',
    rating: 5,
    date: '1 week ago',
    title: 'Serene and Peaceful Kerala',
    content: 'The backwater cruise was so relaxing! The houseboat was clean and comfortable. The Ayurveda spa treatments were rejuvenating. Tea garden visit in Munnar was beautiful. Excellent service throughout the trip.',
    images: [
      'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
    ],
    likes: 22,
    helpful: 17,
    verified: true,
    tripType: 'Family',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    id: 6,
    name: 'Arjun Mehta',
    location: 'Chennai',
    destination: 'Ladakh Expedition',
    rating: 5,
    date: '3 months ago',
    title: 'Adventure of a Lifetime!',
    content: 'Ladakh exceeded all expectations! The high altitude lakes were stunning, especially Pangong Tso. The bike expedition was thrilling but well-organized with safety measures. Monasteries were peaceful and spiritual. Unforgettable experience!',
    images: [
      'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
    ],
    likes: 35,
    helpful: 28,
    verified: true,
    tripType: 'Solo',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  }
];

const stats = [
  { label: 'Total Reviews', value: '2,847', icon: MessageCircle },
  { label: 'Average Rating', value: '4.8', icon: Star },
  { label: 'Happy Customers', value: '98%', icon: Heart },
  { label: 'Repeat Bookings', value: '76%', icon: TrendingUp }
];

const ratingDistribution = [
  { stars: 5, count: 2156, percentage: 76 },
  { stars: 4, count: 512, percentage: 18 },
  { stars: 3, count: 142, percentage: 5 },
  { stars: 2, count: 28, percentage: 1 },
  { stars: 1, count: 9, percentage: 0 }
];

export default function ReviewsPage() {
  const [filteredReviews, setFilteredReviews] = useState(reviews);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [tripTypeFilter, setTripTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showWriteReview, setShowWriteReview] = useState(false);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterReviews(term, ratingFilter, tripTypeFilter, sortBy);
  };

  const handleRatingFilter = (rating: string) => {
    setRatingFilter(rating);
    filterReviews(searchTerm, rating, tripTypeFilter, sortBy);
  };

  const handleTripTypeFilter = (type: string) => {
    setTripTypeFilter(type);
    filterReviews(searchTerm, ratingFilter, type, sortBy);
  };

  const handleSort = (sort: string) => {
    setSortBy(sort);
    filterReviews(searchTerm, ratingFilter, tripTypeFilter, sort);
  };

  const filterReviews = (search: string, rating: string, tripType: string, sort: string) => {
    let filtered = reviews;

    // Search filter
    if (search) {
      filtered = filtered.filter(review => 
        review.name.toLowerCase().includes(search.toLowerCase()) ||
        review.destination.toLowerCase().includes(search.toLowerCase()) ||
        review.title.toLowerCase().includes(search.toLowerCase()) ||
        review.content.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Rating filter
    if (rating !== 'all') {
      filtered = filtered.filter(review => review.rating === parseInt(rating));
    }

    // Trip type filter
    if (tripType !== 'all') {
      filtered = filtered.filter(review => review.tripType.toLowerCase() === tripType.toLowerCase());
    }

    // Sort
    if (sort === 'recent') {
      // Already sorted by recent
    } else if (sort === 'rating') {
      filtered = filtered.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'helpful') {
      filtered = filtered.sort((a, b) => b.helpful - a.helpful);
    } else if (sort === 'likes') {
      filtered = filtered.sort((a, b) => b.likes - a.likes);
    }

    setFilteredReviews([...filtered]);
  };

  const renderStars = (rating: number, size: string = 'h-4 w-4') => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 lg:h-[400px] flex items-center justify-center">
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
            <Star className="h-4 w-4 mr-2" />
            CUSTOMER REVIEWS
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            What Our <span className="text-orange-400">Travelers Say</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Real experiences from real travelers who have explored incredible destinations with SafarSaga
          </p>
          
          <Button 
            onClick={() => setShowWriteReview(true)}
            size="lg" 
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full"
          >
            Write a Review
            <MessageCircle className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="h-6 w-6 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-6">Filter Reviews</h3>
              
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search reviews..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="mb-6">
                <h4 className="font-semibold mb-4">Rating Distribution</h4>
                <div className="space-y-2">
                  {ratingDistribution.map((item) => (
                    <div key={item.stars} className="flex items-center gap-2">
                      <button
                        onClick={() => handleRatingFilter(item.stars.toString())}
                        className="flex items-center gap-1 text-sm hover:text-orange-500"
                      >
                        <span>{item.stars}</span>
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      </button>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <Select value={ratingFilter} onValueChange={handleRatingFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Ratings" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Trip Type</label>
                  <Select value={tripTypeFilter} onValueChange={handleTripTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="couple">Couple</SelectItem>
                      <SelectItem value="friends">Friends</SelectItem>
                      <SelectItem value="solo">Solo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <Select value={sortBy} onValueChange={handleSort}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="rating">Highest Rating</SelectItem>
                      <SelectItem value="helpful">Most Helpful</SelectItem>
                      <SelectItem value="likes">Most Liked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Customer Reviews ({filteredReviews.length})
              </h2>
            </div>

            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <Card key={review.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">{review.name}</h4>
                            {review.verified && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="h-3 w-3" />
                            <span>{review.location}</span>
                            <span>•</span>
                            <span>{review.date}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {review.tripType}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          {renderStars(review.rating)}
                          <div className="text-sm text-gray-500 mt-1">{review.destination}</div>
                        </div>
                      </div>

                      <h3 className="font-semibold text-lg mb-2">{review.title}</h3>
                      <p className="text-gray-700 mb-4 leading-relaxed">{review.content}</p>

                      {/* Images */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mb-4">
                          {review.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Review image ${index + 1}`}
                              className="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-gray-500 hover:text-orange-500 transition-colors">
                            <ThumbsUp className="h-4 w-4" />
                            <span className="text-sm">{review.likes}</span>
                          </button>
                          <button className="flex items-center gap-1 text-gray-500 hover:text-orange-500 transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm">Reply</span>
                          </button>
                          <button className="flex items-center gap-1 text-gray-500 hover:text-orange-500 transition-colors">
                            <Share2 className="h-4 w-4" />
                            <span className="text-sm">Share</span>
                          </button>
                        </div>
                        <div className="text-sm text-gray-500">
                          {review.helpful} people found this helpful
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" size="lg" className="px-8">
                Load More Reviews
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Write Review Modal Placeholder */}
      {showWriteReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Write a Review</h3>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowWriteReview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name</label>
                  <Input placeholder="Enter your name" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Destination</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manali">Manali Adventure</SelectItem>
                      <SelectItem value="kashmir">Kashmir Paradise</SelectItem>
                      <SelectItem value="rajasthan">Rajasthan Royal</SelectItem>
                      <SelectItem value="goa">Goa Beach Bliss</SelectItem>
                      <SelectItem value="kerala">Kerala Backwaters</SelectItem>
                      <SelectItem value="ladakh">Ladakh Expedition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-6 w-6 text-gray-300 hover:text-yellow-500 cursor-pointer" />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Review Title</label>
                  <Input placeholder="Give your review a title" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Your Review</label>
                  <Textarea 
                    placeholder="Share your experience with other travelers..."
                    rows={5}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1 bg-orange-500 hover:bg-orange-600">
                    Submit Review
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowWriteReview(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}