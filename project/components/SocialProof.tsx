'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, CheckCircle, X } from 'lucide-react';

const SocialProof = () => {
  const [currentBooking, setCurrentBooking] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const recentBookings = [
    { name: 'Sarah M.', destination: 'Bali, Indonesia', time: '2 minutes ago', package: 'Luxury Beach Resort' },
    { name: 'John D.', destination: 'Paris, France', time: '5 minutes ago', package: 'Romantic Getaway' },
    { name: 'Emily R.', destination: 'Tokyo, Japan', time: '8 minutes ago', package: 'Cultural Experience' },
    { name: 'Michael K.', destination: 'Santorini, Greece', time: '12 minutes ago', package: 'Island Hopping' },
    { name: 'Lisa W.', destination: 'Dubai, UAE', time: '15 minutes ago', package: 'Desert Safari' },
    { name: 'David L.', destination: 'Maldives', time: '18 minutes ago', package: 'Overwater Villa' },
  ];

  // Handle scroll effects
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    // Determine scroll direction
    setIsScrollingDown(currentScrollY > lastScrollY);
    setLastScrollY(currentScrollY);
    setScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    // Booking rotation interval
    const interval = setInterval(() => {
      setCurrentBooking(prev => (prev + 1) % recentBookings.length);
    }, 4000);

    // Scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  // Calculate dynamic styles based on scroll
  const opacity = Math.max(0.3, 1 - scrollY / 1000);
  const translateY = isScrollingDown ? Math.min(20, scrollY / 50) : 0;
  const scale = Math.max(0.85, 1 - scrollY / 2000);
  const blur = Math.min(2, scrollY / 500);

  // Hide notification when scrolled too far down
  const shouldShow = scrollY < 1500;

  if (!shouldShow) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-6 left-6 z-50 max-w-sm transition-all duration-300 ease-out ${
        scrollY < 100 ? 'animate-float-notification' : ''
      }`}
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        filter: `blur(${blur}px)`,
      }}
    >
      <Card className={`bg-white/95 backdrop-blur-sm shadow-2xl border-l-4 border-l-green-500 transition-all duration-500 ${
        isScrollingDown ? 'animate-pulse' : 'animate-slide-up'
      } hover:shadow-3xl hover:scale-105 animate-notification-glow`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 bg-green-100 rounded-full flex items-center justify-center transition-all duration-300 ${
                isScrollingDown ? 'animate-spin' : ''
              }`}>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-semibold text-gray-900 transition-all duration-300 ${
                  scrollY > 500 ? 'text-sm' : 'text-base'
                }`}>
                  {recentBookings[currentBooking].name}
                </span>
                <Badge 
                  variant="secondary" 
                  className={`text-xs bg-green-100 text-green-800 transition-all duration-300 ${
                    isScrollingDown ? 'animate-bounce' : ''
                  }`}
                >
                  Booked
                </Badge>
              </div>
              
              <p className={`text-gray-600 mb-2 transition-all duration-300 ${
                scrollY > 500 ? 'text-xs' : 'text-sm'
              }`}>
                {recentBookings[currentBooking].package}
              </p>
              
              <div className={`flex items-center justify-between text-gray-500 transition-all duration-300 ${
                scrollY > 500 ? 'text-xs' : 'text-xs'
              }`}>
                <div className="flex items-center gap-1">
                  <MapPin className={`transition-all duration-300 ${
                    scrollY > 500 ? 'h-2 w-2' : 'h-3 w-3'
                  }`} />
                  <span>{recentBookings[currentBooking].destination}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className={`transition-all duration-300 ${
                    scrollY > 500 ? 'h-2 w-2' : 'h-3 w-3'
                  }`} />
                  <span>{recentBookings[currentBooking].time}</span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className={`flex-shrink-0 p-0 hover:bg-gray-100 rounded-full transition-all duration-300 ${
                scrollY > 500 ? 'h-5 w-5' : 'h-6 w-6'
              }`}
            >
              <X className={`text-gray-400 hover:text-gray-600 transition-all duration-300 ${
                scrollY > 500 ? 'h-3 w-3' : 'h-4 w-4'
              }`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialProof;