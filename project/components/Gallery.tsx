'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const galleryImages = [
  {
    id: 1,
    src: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    location: 'Santorini, Greece',
    category: 'Islands'
  },
  {
    id: 2,
    src: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    location: 'Tokyo, Japan',
    category: 'Cities'
  },
  {
    id: 3,
    src: 'https://images.pexels.com/photos/1031588/pexels-photo-1031588.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    location: 'Iceland',
    category: 'Nature'
  },
  {
    id: 4,
    src: 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    location: 'Serengeti, Tanzania',
    category: 'Wildlife'
  },
  {
    id: 5,
    src: 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    location: 'Bali, Indonesia',
    category: 'Tropical'
  },
  {
    id: 6,
    src: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    location: 'Patagonia, Argentina',
    category: 'Adventure'
  }
];

const categories = ['All', 'Islands', 'Cities', 'Nature', 'Wildlife', 'Tropical', 'Adventure'];

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredImages = selectedCategory === 'All' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4">
            Travel <span className="font-bold">Gallery</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-light">
            Moments captured from our extraordinary journeys around the world
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {filteredImages.map((image, index) => (
            <Card 
              key={image.id} 
              className={`group overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-500 border-0 ${
                index % 3 === 0 ? 'sm:row-span-2' : ''
              }`}
            >
              <div className="relative overflow-hidden">
                <img
                  src={image.src}
                  alt={image.location}
                  className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${
                    index % 3 === 0 ? 'h-64 sm:h-96' : 'h-64'
                  }`}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 sm:p-6 text-white">
                    <Badge className="bg-white/20 text-white mb-2 font-light">
                      {image.category}
                    </Badge>
                    <h3 className="text-lg sm:text-xl font-bold">
                      {image.location}
                    </h3>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12 lg:mt-16">
          <button className="text-gray-900 font-medium hover:underline">
            View More Photos →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Gallery;