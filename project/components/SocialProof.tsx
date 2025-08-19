'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, CheckCircle } from 'lucide-react';

const SocialProof = () => {
  const [currentBooking, setCurrentBooking] = useState(0);

  const recentBookings = [
    { name: 'Sarah M.', destination: 'Bali, Indonesia', time: '2 minutes ago', package: 'Luxury Beach Resort' },
    { name: 'John D.', destination: 'Paris, France', time: '5 minutes ago', package: 'Romantic Getaway' },
    { name: 'Emily R.', destination: 'Tokyo, Japan', time: '8 minutes ago', package: 'Cultural Experience' },
    { name: 'Michael K.', destination: 'Santorini, Greece', time: '12 minutes ago', package: 'Island Hopping' },
    { name: 'Lisa W.', destination: 'Dubai, UAE', time: '15 minutes ago', package: 'Desert Safari' },
    { name: 'David L.', destination: 'Maldives', time: '18 minutes ago', package: 'Overwater Villa' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBooking(prev => (prev + 1) % recentBookings.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm">
      <Card className="bg-white shadow-2xl border-l-4 border-l-green-500 animate-slide-up">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">{recentBookings[currentBooking].name}</span>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  Booked
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {recentBookings[currentBooking].package}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{recentBookings[currentBooking].destination}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{recentBookings[currentBooking].time}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialProof;