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
      <div className="relative z-10 text-center text-white px-4 max-w-4xl">
        <div className="mb-4">
          <div className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-full text-sm font-bold animate-pulse mb-4">
            🔥 LIMITED TIME: 25% OFF ALL PACKAGES
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
          Turn Your Dream Trip Into
          <span className="block text-orange-400">Reality Today</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-fade-in delay-300">
          Join 50,000+ travelers who trusted us with their perfect vacation
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm">
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <span className="text-green-400">✓</span>
            <span>No Hidden Fees</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <span className="text-green-400">✓</span>
            <span>24/7 Support</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <span className="text-green-400">✓</span>
            <span>Money-Back Guarantee</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl animate-fade-in delay-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Destination</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Where do you want to go?"
                  className="pl-10 h-12 text-gray-900"
                  value={searchData.destination}
                  onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="date"
                  className="pl-10 h-12 text-gray-900"
                  value={searchData.date}
                  onChange={(e) => setSearchData({...searchData, date: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Travelers</label>
              <Select value={searchData.travelers} onValueChange={(value) => setSearchData({...searchData, travelers: value})}>
                <SelectTrigger className="h-12">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-2" />
                    <SelectValue placeholder="Select travelers" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Traveler</SelectItem>
                  <SelectItem value="2">2 Travelers</SelectItem>
                  <SelectItem value="3">3 Travelers</SelectItem>
                  <SelectItem value="4">4 Travelers</SelectItem>
                  <SelectItem value="5+">5+ Travelers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200">
              🚀 Find My Dream Trip
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;