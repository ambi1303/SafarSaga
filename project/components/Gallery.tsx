'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import DynamicGallery from './DynamicGallery';

// Simple image interface that doesn't depend on Cloudinary
interface GalleryImage {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  createdAt: string;
  tags: string[];
  title: string;
  altText: string;
  description?: string;
}

// Fallback static gallery items for when Cloudinary is not configured
const fallbackGalleryItems = [
  {
    publicId: 'fallback/manali-kasol',
    url: '/images/gallery/manali-kasol.JPG',
    secureUrl: '/images/gallery/manali-kasol.JPG',
    width: 800,
    height: 600,
    format: 'jpg',
    createdAt: new Date().toISOString(),
    tags: ['manali', 'kasol', 'adventure'],
    title: 'Manali Kasol Adventures',
    altText: 'Beautiful mountain landscape from Manali Kasol adventure tour',
    description: 'Stunning mountain views captured during our Manali Kasol adventure tour'
  },
  {
    publicId: 'fallback/chopta-1',
    url: '/images/gallery/chopta-1.JPG',
    secureUrl: '/images/gallery/chopta-1.JPG',
    width: 800,
    height: 600,
    format: 'jpg',
    createdAt: new Date().toISOString(),
    tags: ['chopta', 'mountains', 'trekking'],
    title: 'Chopta Mountain Views',
    altText: 'Breathtaking mountain views from Chopta trekking expedition',
    description: 'Breathtaking mountain views from our Chopta trekking expedition'
  },
  {
    publicId: 'fallback/jibhi',
    url: '/images/gallery/jibli.JPG',
    secureUrl: '/images/gallery/jibli.JPG',
    width: 800,
    height: 600,
    format: 'jpg',
    createdAt: new Date().toISOString(),
    tags: ['jibhi', 'forest', 'nature'],
    title: 'Jibhi Forest Trails',
    altText: 'Serene forest trails in Jibhi nature walk',
    description: 'Serene forest trails discovered during our Jibhi nature walk'
  },
  {
    publicId: 'fallback/chakrata',
    url: '/images/gallery/chakrata.JPG',
    secureUrl: '/images/gallery/chakrata.JPG',
    width: 800,
    height: 600,
    format: 'jpg',
    createdAt: new Date().toISOString(),
    tags: ['chakrata', 'hills', 'scenic'],
    title: 'Chakrata Hill Station',
    altText: 'Scenic beauty of Chakrata hill station',
    description: 'Scenic beauty of Chakrata hill station during our weekend getaway'
  },
  {
    publicId: 'fallback/manali',
    url: '/images/gallery/manali.JPG',
    secureUrl: '/images/gallery/manali.JPG',
    width: 800,
    height: 600,
    format: 'jpg',
    createdAt: new Date().toISOString(),
    tags: ['manali', 'snow', 'adventure'],
    title: 'Manali Snow Adventures',
    altText: 'Snow-covered landscapes in Manali adventure tour',
    description: 'Snow-covered landscapes from our thrilling Manali adventure tour'
  },
  {
    publicId: 'fallback/chopta2',
    url: '/images/gallery/chopta2.JPG',
    secureUrl: '/images/gallery/chopta2.JPG',
    width: 800,
    height: 600,
    format: 'jpg',
    createdAt: new Date().toISOString(),
    tags: ['chopta', 'meadows', 'nature'],
    title: 'Chopta Meadows',
    altText: 'Lush green meadows of Chopta valley',
    description: 'Lush green meadows of Chopta valley in full bloom'
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
  const [useCloudinary, setUseCloudinary] = useState(true);
  const [initialImages, setInitialImages] = useState<GalleryImage[]>([]);

  // Check if Cloudinary is configured
  useEffect(() => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName || cloudName === 'your_cloud_name_here') {
      setUseCloudinary(false);
      setInitialImages(fallbackGalleryItems.slice(0, itemsPerPage));
    }
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

        {/* Dynamic Gallery */}
        {useCloudinary ? (
          <DynamicGallery
            itemsPerPage={itemsPerPage}
            enableSearch={enableSearch}
            enableFilters={enableFilters}
            enableHoverEffects={true}
            enableLightbox={true}
            gridColumns={{
              mobile: 1,
              tablet: 2,
              desktop: 3
            }}
          />
        ) : (
          <>
            {/* Fallback Static Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialImages.map((item, index) => (
                <div key={item.publicId} className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <img
                    src={item.url}
                    alt={item.altText}
                    className="w-full h-64 object-cover"
                    loading={index < 3 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop";
                    }}
                  />
                  <div className="p-4 bg-white">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Configuration Notice */}
            <div className="text-center mt-8 p-4 bg-orange-50 rounded-lg">
              <p className="text-orange-700 text-sm">
                <strong>Note:</strong> Configure Cloudinary credentials in your .env.local file to enable dynamic gallery features.
              </p>
            </div>
          </>
        )}

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