'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Flame, Users } from 'lucide-react';

const UrgencyBanner = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  });

  const [viewersCount, setViewersCount] = useState(127);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    // Simulate viewer count changes
    const viewerTimer = setInterval(() => {
      setViewersCount(prev => {
        const change = Math.floor(Math.random() * 10) - 5;
        return Math.max(100, Math.min(200, prev + change));
      });
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(viewerTimer);
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-2 sm:py-3 sticky top-0 z-40 shadow-lg">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          {/* Limited Time Offer - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <div className="flex items-center gap-1 sm:gap-2">
              <Flame className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
              <span className="font-bold text-xs sm:text-sm lg:text-base">
                <span className="hidden sm:inline">LIMITED TIME: 25% OFF ALL PACKAGES!</span>
                <span className="sm:hidden">25% OFF ALL PACKAGES!</span>
              </span>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 bg-white/20 px-2 sm:px-3 py-1 rounded-full">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="font-mono font-bold text-xs sm:text-sm">
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Social Proof & CTA - Mobile Optimized */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              <span>{viewersCount} people viewing now</span>
            </div>
            
            <Button 
              size="sm" 
              className="bg-white text-red-600 hover:bg-gray-100 font-bold animate-pulse text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 h-7 sm:h-8"
            >
              <span className="hidden sm:inline">Book Now & Save!</span>
              <span className="sm:hidden">Book Now!</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrgencyBanner;