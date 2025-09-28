'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, Users } from 'lucide-react';

const HeroSection = () => {
  const [searchData, setSearchData] = useState({
    destination: '',
    date: '',
    travelers: ''
  });

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/1658967/pexels-photo-1658967.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop")'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-6xl w-full">
        {/* Main Heading - Minimalist Style */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light mb-6 leading-tight tracking-wide">
          Discover
          <span className="block font-bold">Extraordinary Places</span>
        </h1>
        
        {/* Subheading */}
        <p className="text-lg sm:text-xl md:text-2xl mb-12 text-white/90 font-light max-w-3xl mx-auto leading-relaxed">
          Curated travel experiences for the modern explorer
        </p>

        {/* Social Proof Metrics */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-12 mb-16 text-white/80">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">50K+</div>
            <div className="text-sm sm:text-base font-light">Happy Travelers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">120+</div>
            <div className="text-sm sm:text-base font-light">Destinations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">4.9</div>
            <div className="text-sm sm:text-base font-light">Rating</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Button 
            size="lg" 
            className="bg-white text-gray-900 hover:bg-gray-100 font-medium px-8 py-4 text-base"
          >
            Explore Trips
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-gray-900 font-medium px-8 py-4 text-base"
          >
            Plan Custom Trip
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;