'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

// Static gallery image interface
interface GalleryImage {
  id: string;
  url: string;
  title: string;
  altText: string;
  description?: string;
  destination: string;
  tags: string[];
}

// Static gallery items from actual gallery albums only
const staticGalleryItems = [
  {
    id: 'manali-kasol-1',
    url: '/images/gallery/manali-kasol.JPG',
    title: 'Manali Kasol Adventures',
    altText: 'Beautiful mountain landscape from Manali Kasol adventure tour',
    description: 'Stunning mountain views captured during our Manali Kasol adventure tour',
    destination: 'Manali Kasol',
    tags: ['manali', 'kasol', 'adventure', 'mountains']
  },
  {
    id: 'chopta-1',
    url: '/images/gallery/chopta-1.JPG',
    title: 'Chopta Mountain Views',
    altText: 'Breathtaking mountain views from Chopta trekking expedition',
    description: 'Breathtaking mountain views from our Chopta trekking expedition',
    destination: 'Chopta',
    tags: ['chopta', 'mountains', 'trekking', 'himalaya']
  },
  {
    id: 'jibhi-1',
    url: '/images/gallery/jibli.JPG',
    title: 'Jibhi Forest Trails',
    altText: 'Serene forest trails in Jibhi nature walk',
    description: 'Serene forest trails discovered during our Jibhi nature walk',
    destination: 'Jibhi',
    tags: ['jibhi', 'forest', 'nature', 'himachal']
  },
  {
    id: 'chakrata-1',
    url: '/images/gallery/chakrata.JPG',
    title: 'Chakrata Hill Station',
    altText: 'Scenic beauty of Chakrata hill station',
    description: 'Scenic beauty of Chakrata hill station during our weekend getaway',
    destination: 'Chakrata',
    tags: ['chakrata', 'hills', 'scenic', 'uttarakhand']
  },
  {
    id: 'manali-2',
    url: '/images/gallery/manali.JPG',
    title: 'Manali Snow Adventures',
    altText: 'Snow-covered landscapes in Manali adventure tour',
    description: 'Snow-covered landscapes from our thrilling Manali adventure tour',
    destination: 'Manali',
    tags: ['manali', 'snow', 'adventure', 'winter']
  },
  {
    id: 'chopta-2',
    url: '/images/gallery/chopta2.JPG',
    title: 'Chopta Meadows',
    altText: 'Lush green meadows of Chopta valley',
    description: 'Lush green meadows of Chopta valley in full bloom',
    destination: 'Chopta',
    tags: ['chopta', 'meadows', 'nature', 'green']
  },
  {
    id: 'chopta-3',
    url: '/images/gallery/chopta3.JPG',
    title: 'Chopta Valley Views',
    altText: 'Panoramic valley views from Chopta',
    description: 'Spectacular panoramic views of the Chopta valley and surrounding peaks',
    destination: 'Chopta',
    tags: ['chopta', 'valley', 'panoramic', 'peaks']
  }
] as GalleryImage[];

interface GalleryProps {
  showHeader?: boolean;
  itemsPerPage?: number;
  enableSearch?: boolean;
  enableFilters?: boolean;
}

const Gallery: React.FC<GalleryProps> = ({
  showHeader = true,
  itemsPerPage = 6,
  enableSearch = false,
  enableFilters = false
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [displayImages, setDisplayImages] = useState<GalleryImage[]>([]);

  // Rotating gallery effect
  useEffect(() => {
    setDisplayImages(staticGalleryItems.slice(0, itemsPerPage));
    
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => {
        const nextIndex = (prev + 1) % staticGalleryItems.length;
        const newImages = [];
        for (let i = 0; i < itemsPerPage; i++) {
          newImages.push(staticGalleryItems[(nextIndex + i) % staticGalleryItems.length]);
        }
        setDisplayImages(newImages);
        return nextIndex;
      });
    }, 4000); // Change images every 4 seconds

    return () => clearInterval(interval);
  }, [itemsPerPage]);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        {showHeader && (
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
        )}

        {/* Static Gallery with Rotating Effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayImages.map((item, index) => (
            <div 
              key={`${item.id}-${currentImageIndex}`} 
              className="group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2"
              style={{
                animationDelay: `${index * 200}ms`
              }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.url}
                  alt={item.altText}
                  className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                  loading={index < 3 ? 'eager' : 'lazy'}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop";
                  }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Destination badge */}
                <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {item.destination}
                </div>
                
                {/* Tags on hover */}
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white">
                <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Gallery Info */}
        <div className="text-center mt-8 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
          <p className="text-orange-800 text-sm">
            <strong>✨ Live Gallery:</strong> Images rotate automatically every 4 seconds from our actual travel albums!
          </p>
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Link href="/gallery">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
              <Camera className="h-5 w-5 mr-2" />
              View Full Gallery
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Gallery;