'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Delhi, India',
    rating: 5,
    text: 'Our Manali trip with SafarSaga was absolutely amazing! The snow activities were thrilling and the accommodation was top-notch. Highly recommend for families!',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    id: 2,
    name: 'Rahul Gupta',
    location: 'Mumbai, India',
    rating: 5,
    text: 'Kashmir was truly paradise on earth! The houseboat stay and Gulmarg experience exceeded all expectations. SafarSaga made our dream trip come true!',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    id: 3,
    name: 'Anjali Patel',
    location: 'Bangalore, India',
    rating: 5,
    text: 'The Rajasthan heritage tour was incredible! From palaces to desert safari, every moment was magical. Professional service throughout the journey!',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4">
            Traveler <span className="font-bold">Stories</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-light">
            Real experiences from our community of explorers
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-50 border-0 shadow-none">
            <CardContent className="p-8 sm:p-12 lg:p-16 text-center">
              <div className="flex justify-center mb-6 sm:mb-8">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 sm:h-6 sm:w-6 fill-gray-900 text-gray-900" />
                ))}
              </div>
              
              <blockquote className="text-xl sm:text-2xl lg:text-3xl text-gray-900 mb-8 sm:mb-12 leading-relaxed font-light">
                "{currentTestimonial.text}"
              </blockquote>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                  <AvatarImage src={currentTestimonial.avatar} />
                  <AvatarFallback className="text-xl font-bold bg-gray-200">
                    {currentTestimonial.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h4 className="font-bold text-lg sm:text-xl text-gray-900">
                    {currentTestimonial.name}
                  </h4>
                  <p className="text-gray-600 font-light">
                    {currentTestimonial.location}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevTestimonial}
                  className="border-gray-300 hover:bg-gray-100 h-10 w-10 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextTestimonial}
                  className="border-gray-300 hover:bg-gray-100 h-10 w-10 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-gray-900' : 'bg-gray-300'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;