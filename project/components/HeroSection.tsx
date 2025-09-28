'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, Users, MapPin } from 'lucide-react';

const HeroSection = () => {
  const [searchData, setSearchData] = useState({
    destination: '',
    date: '',
    travelers: ''
  });

  const handleSearch = () => {
    console.log('Search data:', searchData);
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop")'
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-6xl w-full">
        {/* Main Heading */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight animate-slide-in-up">
            Explore the World
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-6 text-orange-400 animate-slide-in-up text-shimmer" style={{ animationDelay: '0.2s' }}>
            with SafarSaga
          </h2>
        </div>
        
        {/* Subheading */}
        <p className="text-lg sm:text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          Discover incredible destinations across India with our expertly crafted travel packages
        </p>

        {/* Search Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto mb-12 shadow-2xl animate-bounce-in hover-glow" style={{ animationDelay: '0.6s' }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Destination */}
            <div className="relative">
              <label className="block text-gray-700 text-sm font-medium mb-2 text-left">
                Where to?
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Select value={searchData.destination} onValueChange={(value) => setSearchData({...searchData, destination: value})}>
                  <SelectTrigger className="pl-10 h-12 border-gray-300">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manali">Manali, Himachal Pradesh</SelectItem>
                    <SelectItem value="kashmir">Kashmir, J&K</SelectItem>
                    <SelectItem value="rajasthan">Rajasthan</SelectItem>
                    <SelectItem value="goa">Goa</SelectItem>
                    <SelectItem value="kerala">Kerala</SelectItem>
                    <SelectItem value="ladakh">Ladakh</SelectItem>
                    <SelectItem value="uttarakhand">Uttarakhand</SelectItem>
                    <SelectItem value="andaman">Andaman Islands</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date */}
            <div className="relative">
              <label className="block text-gray-700 text-sm font-medium mb-2 text-left">
                When?
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="date"
                  value={searchData.date}
                  onChange={(e) => setSearchData({...searchData, date: e.target.value})}
                  className="pl-10 h-12 border-gray-300"
                />
              </div>
            </div>

            {/* Travelers */}
            <div className="relative">
              <label className="block text-gray-700 text-sm font-medium mb-2 text-left">
                Travelers
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Select value={searchData.travelers} onValueChange={(value) => setSearchData({...searchData, travelers: value})}>
                  <SelectTrigger className="pl-10 h-12 border-gray-300">
                    <SelectValue placeholder="How many?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Person</SelectItem>
                    <SelectItem value="2">2 People</SelectItem>
                    <SelectItem value="3-4">3-4 People</SelectItem>
                    <SelectItem value="5-8">5-8 People</SelectItem>
                    <SelectItem value="9+">9+ People</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button 
                onClick={handleSearch}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium"
              >
                <Search className="h-5 w-5 mr-2" />
                Search Trips
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-12 text-white/90 stagger-animation">
          <div className="text-center hover-bounce">
            <div className="text-2xl sm:text-3xl font-bold text-white animate-heartbeat">2,500+</div>
            <div className="text-sm sm:text-base">Happy Travelers</div>
          </div>
          <div className="text-center hover-bounce">
            <div className="text-2xl sm:text-3xl font-bold text-white animate-heartbeat">50+</div>
            <div className="text-sm sm:text-base">Destinations</div>
          </div>
          <div className="text-center hover-bounce">
            <div className="text-2xl sm:text-3xl font-bold text-white animate-heartbeat">4.9★</div>
            <div className="text-sm sm:text-base">Rating</div>
          </div>
          <div className="text-center hover-bounce">
            <div className="text-2xl sm:text-3xl font-bold text-white animate-heartbeat">24/7</div>
            <div className="text-sm sm:text-base">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;