'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

const upcomingTrips = [
  {
    id: 1,
    title: 'Northern Lights Iceland',
    destination: 'Reykjavik, Iceland',
    date: 'March 15-22, 2025',
    duration: '8 days',
    price: 2299,
    spotsLeft: 3,
    image: 'https://images.pexels.com/photos/1031588/pexels-photo-1031588.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    highlights: ['Northern Lights', 'Blue Lagoon', 'Golden Circle']
  },
  {
    id: 2,
    title: 'Cherry Blossom Japan',
    destination: 'Tokyo & Kyoto, Japan',
    date: 'April 5-14, 2025',
    duration: '10 days',
    price: 3199,
    spotsLeft: 7,
    image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    highlights: ['Cherry Blossoms', 'Traditional Temples', 'Cultural Immersion']
  },
  {
    id: 3,
    title: 'Mediterranean Escape',
    destination: 'Santorini & Mykonos, Greece',
    date: 'May 20-28, 2025',
    duration: '9 days',
    price: 2799,
    spotsLeft: 5,
    image: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    highlights: ['Island Hopping', 'Sunset Views', 'Local Cuisine']
  },
  {
    id: 4,
    title: 'Safari Adventure',
    destination: 'Serengeti, Tanzania',
    date: 'June 10-18, 2025',
    duration: '9 days',
    price: 4299,
    spotsLeft: 2,
    image: 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    highlights: ['Big Five Safari', 'Luxury Lodges', 'Migration Season']
  }
];

const UpcomingTrips = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4">
            Upcoming <span className="font-bold">Adventures</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-light">
            Join our carefully curated group trips to extraordinary destinations
          </p>
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {upcomingTrips.map((trip) => (
            <Card key={trip.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white">
              <div className="relative overflow-hidden">
                <img
                  src={trip.image}
                  alt={trip.title}
                  className="w-full h-64 sm:h-72 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <Badge 
                    variant={trip.spotsLeft <= 3 ? "destructive" : "secondary"}
                    className="bg-white/90 text-gray-900 font-medium"
                  >
                    {trip.spotsLeft} spots left
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center text-gray-500 mb-3">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm font-light">{trip.destination}</span>
                </div>
                
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {trip.title}
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                    <span className="text-sm">{trip.date}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-3 text-gray-400" />
                    <span className="text-sm">{trip.duration}</span>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {trip.highlights.map((highlight, index) => (
                      <Badge key={index} variant="outline" className="text-xs font-light">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl lg:text-3xl font-bold text-gray-900">
                      ${trip.price.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">per person</span>
                  </div>
                  <Button className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-6">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12 lg:mt-16">
          <Button 
            variant="outline" 
            size="lg" 
            className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-medium px-8"
          >
            View All Upcoming Trips
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UpcomingTrips;