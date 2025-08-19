'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Star, Quote } from 'lucide-react';

const VideoTestimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah & Mike Johnson',
      location: 'California, USA',
      trip: 'Maldives Honeymoon',
      thumbnail: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      quote: 'SafarSaga made our honeymoon absolutely magical. Every detail was perfect!',
      rating: 5,
      savings: '$800'
    },
    {
      id: 2,
      name: 'David Chen',
      location: 'New York, USA',
      trip: 'Japan Cultural Tour',
      thumbnail: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      quote: 'The attention to detail and local experiences were beyond our expectations.',
      rating: 5,
      savings: '$650'
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      location: 'Texas, USA',
      trip: 'European Adventure',
      thumbnail: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      quote: 'Best travel agency ever! They saved us money and gave us memories for life.',
      rating: 5,
      savings: '$1,200'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-purple-100 text-purple-800 px-4 py-2">
            Real Stories, Real Savings
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            See Why Our Customers Choose Us Again & Again
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it - watch real customers share their incredible experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={testimonial.thumbnail}
                  alt={testimonial.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border-2 border-white">
                    <Play className="h-6 w-6 mr-2" />
                    Watch Story
                  </Button>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-500 hover:bg-green-600 text-white">
                    Saved {testimonial.savings}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <div className="relative mb-4">
                  <Quote className="h-6 w-6 text-gray-300 absolute -top-2 -left-1" />
                  <p className="text-gray-700 italic pl-6">
                    "{testimonial.quote}"
                  </p>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                  <p className="text-sm text-blue-600 font-medium">{testimonial.trip}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">4.9/5</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">50K+</div>
              <div className="text-sm text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">$2M+</div>
              <div className="text-sm text-gray-600">Money Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">98%</div>
              <div className="text-sm text-gray-600">Would Recommend</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoTestimonials;