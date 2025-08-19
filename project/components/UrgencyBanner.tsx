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
    <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 sticky top-0 z-40 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Limited Time Offer */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 animate-pulse" />
              <span className="font-bold">LIMITED TIME: 25% OFF ALL PACKAGES!</span>
            </div>
            
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <Clock className="h-4 w-4" />
              <span className="font-mono font-bold">
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Social Proof & CTA */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              <span>{viewersCount} people viewing now</span>
            </div>
            
            <Button 
              size="sm" 
              className="bg-white text-red-600 hover:bg-gray-100 font-bold animate-pulse"
            >
              Book Now & Save!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrgencyBanner;