'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Play, Heart, Share2 } from 'lucide-react';
import { FadeIn, StaggerContainer } from '@/components/ScrollAnimations';

const galleryItems = [
  {
    id: 1,
    type: 'image',
    src: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    title: 'Manali Snow Adventures',
    location: 'Himachal Pradesh',
    likes: 245
  },
  {
    id: 2,
    type: 'video',
    src: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    title: 'Kashmir Valley Beauty',
    location: 'Jammu & Kashmir',
    likes: 189
  },
  {
    id: 3,
    type: 'image',
    src: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    title: 'Jaipur City Palace',
    location: 'Rajasthan',
    likes: 312
  },
  {
    id: 4,
    type: 'image',
    src: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    title: 'Goa Beach Sunset',
    location: 'Goa',
    likes: 278
  },
  {
    id: 5,
    type: 'video',
    src: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    title: 'Alleppey Backwaters',
    location: 'Kerala',
    likes: 167
  },
  {
    id: 6,
    type: 'image',
    src: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    title: 'Leh Ladakh Expedition',
    location: 'Ladakh',
    likes: 398
  },
  {
    id: 7,
    type: 'image',
    src: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    title: 'Rishikesh Adventure',
    location: 'Uttarakhand',
    likes: 156
  },
  {
    id: 8,
    type: 'video',
    src: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    title: 'Andaman Islands',
    location: 'Andaman & Nicobar',
    likes: 234
  },
  {
    id: 9,
    type: 'image',
    src: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    title: 'Agra Taj Mahal',
    location: 'Uttar Pradesh',
    likes: 445
  }
];

const Gallery = () => {
  const [likedItems, setLikedItems] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    setLikedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Camera className="h-4 w-4 mr-2" />
            TRAVEL GALLERY
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Memories from <span className="text-orange-500">Our Travelers</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            See the incredible moments captured by our travelers across India's most beautiful destinations
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, index) => (
            <Card 
              key={item.id} 
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
              style={{ 
                animationDelay: `${index * 50}ms`,
                opacity: 0,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                
                {/* Video Play Button */}
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="h-8 w-8 text-white ml-1" />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white p-0"
                    onClick={() => toggleLike(item.id)}
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        likedItems.includes(item.id) ? 'fill-red-500 text-red-500' : ''
                      }`} 
                    />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white p-0"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-white/80 text-sm mb-2">{item.location}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-white/80 text-sm">
                      <Heart className="h-4 w-4 mr-1" />
                      {item.likes + (likedItems.includes(item.id) ? 1 : 0)} likes
                    </div>
                    <div className="text-white/60 text-xs bg-orange-500/20 px-2 py-1 rounded-full">
                      {item.type === 'video' ? 'Video' : 'Photo'}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full"
          >
            <Camera className="h-5 w-5 mr-2" />
            View More Photos
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Gallery;