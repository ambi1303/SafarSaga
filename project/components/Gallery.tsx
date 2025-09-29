'use client';

import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

const galleryItems = [
  {
    id: 1,
    src: '/images/gallery/manali-kasol.JPG',
    title: 'Manali Kasol Adventures'
  },
  {
    id: 2,
    src: '/images/gallery/chopta-1.JPG',
    title: 'Chopta Mountain Views'
  },
  {
    id: 3,
    src: '/images/gallery/jibli.JPG',
    title: 'Jibhi Forest Trails'
  },
  {
    id: 4,
    src: '/images/gallery/chakrata.JPG',
    title: 'Chakrata Hill Station'
  },
  {
    id: 5,
    src: '/images/gallery/manali.JPG',
    title: 'Manali Snow Adventures'
  },
  {
    id: 6,
    src: '/images/gallery/chopta2.JPG',
    title: 'Chopta Meadows'
  },
  {
    id: 7,
    src: '/images/gallery/chopta3.JPG',
    title: 'Chopta Trekking'
  }
];

const Gallery = () => {
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
            Discover the incredible moments captured by our travelers on their unforgettable journeys
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-lg shadow-md">
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-64 object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop";
                }}
              />
              <div className="p-4 bg-white">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
            <Camera className="h-5 w-5 mr-2" />
            View More Photos
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Gallery;