'use client';

import { useState, useEffect, useCallback } from 'react';
import { Camera, Search, Filter, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Lightbox from './Lightbox';

// Simple image interface for fallback
interface SimpleGalleryImage {
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

interface SimpleDynamicGalleryProps {
  initialImages?: SimpleGalleryImage[];
  itemsPerPage?: number;
  enableLightbox?: boolean;
  enableHoverEffects?: boolean;
  enableSearch?: boolean;
  enableFilters?: boolean;
  gridColumns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  className?: string;
}

interface GalleryState {
  images: SimpleGalleryImage[];
  loading: boolean;
  hasMore: boolean;
  nextCursor?: string;
  selectedImageIndex: number;
  lightboxOpen: boolean;
  error?: string;
  searchQuery: string;
  selectedTags: string[];
  availableTags: string[];
}

const SimpleDynamicGallery: React.FC<SimpleDynamicGalleryProps> = ({
  initialImages = [],
  itemsPerPage = 12,
  enableLightbox = true,
  enableHoverEffects = true,
  enableSearch = true,
  enableFilters = true,
  gridColumns = {
    mobile: 1,
    tablet: 2,
    desktop: 3
  },
  className = ''
}) => {
  const [state, setState] = useState<GalleryState>({
    images: initialImages,
    loading: false,
    hasMore: true,
    selectedImageIndex: 0,
    lightboxOpen: false,
    searchQuery: '',
    selectedTags: [],
    availableTags: []
  });

  // Extract unique tags from images
  const extractUniqueTags = (images: SimpleGalleryImage[]): string[] => {
    const tagSet = new Set<string>();
    images.forEach(image => {
      image.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  // Fetch images from API
  const fetchImages = useCallback(async (
    reset: boolean = false,
    searchQuery?: string,
    selectedTags?: string[]
  ) => {
    setState(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      const params = new URLSearchParams({
        maxResults: itemsPerPage.toString(),
        ...(selectedTags?.length && { tags: selectedTags.join(',') }),
        ...(searchQuery && { query: searchQuery }),
        ...(!reset && state.nextCursor && { nextCursor: state.nextCursor })
      });

      const response = await fetch(`/api/gallery?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();

      setState(prev => ({
        ...prev,
        images: reset ? data.images : [...prev.images, ...data.images],
        hasMore: !!data.nextCursor,
        nextCursor: data.nextCursor,
        loading: false,
        availableTags: reset ? extractUniqueTags(data.images) : prev.availableTags
      }));
    } catch (error) {
      console.error('Error fetching images:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load images. Please try again.'
      }));
    }
  }, [itemsPerPage, state.nextCursor]);

  // Initial load
  useEffect(() => {
    if (initialImages.length === 0) {
      fetchImages(true, state.searchQuery, state.selectedTags);
    } else {
      setState(prev => ({
        ...prev,
        availableTags: extractUniqueTags(initialImages)
      }));
    }
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
    fetchImages(true, query, state.selectedTags);
  }, [fetchImages, state.selectedTags]);

  // Handle tag filter
  const handleTagFilter = useCallback((tag: string) => {
    const newSelectedTags = state.selectedTags.includes(tag)
      ? state.selectedTags.filter(t => t !== tag)
      : [...state.selectedTags, tag];
    
    setState(prev => ({ ...prev, selectedTags: newSelectedTags }));
    fetchImages(true, state.searchQuery, newSelectedTags);
  }, [fetchImages, state.searchQuery, state.selectedTags]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      fetchImages(false, state.searchQuery, state.selectedTags);
    }
  }, [fetchImages, state.loading, state.hasMore, state.searchQuery, state.selectedTags]);

  // Handle image click
  const handleImageClick = useCallback((index: number) => {
    if (enableLightbox) {
      setState(prev => ({
        ...prev,
        selectedImageIndex: index,
        lightboxOpen: true
      }));
    }
  }, [enableLightbox]);

  // Handle lightbox navigation
  const handleLightboxNavigate = useCallback((direction: 'prev' | 'next') => {
    setState(prev => {
      const newIndex = direction === 'prev' 
        ? Math.max(0, prev.selectedImageIndex - 1)
        : Math.min(prev.images.length - 1, prev.selectedImageIndex + 1);
      
      return { ...prev, selectedImageIndex: newIndex };
    });
  }, []);

  // Grid CSS classes based on breakpoints
  const gridClasses = `
    grid gap-4 sm:gap-6
    grid-cols-${gridColumns.mobile}
    sm:grid-cols-${gridColumns.tablet}
    lg:grid-cols-${gridColumns.desktop}
    xl:grid-cols-${Math.min(gridColumns.desktop + 1, 4)}
  `;

  return (
    <div className={`w-full ${className}`}>
      {/* Search and Filter Section */}
      {(enableSearch || enableFilters) && (
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          {enableSearch && (
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search photos..."
                value={state.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          )}

          {/* Tag Filters */}
          {enableFilters && state.availableTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <div className="flex items-center text-sm text-gray-600 mr-2">
                <Filter className="h-4 w-4 mr-1" />
                Filter:
              </div>
              {state.availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagFilter(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    state.selectedTags.includes(tag)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {state.error && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{state.error}</p>
          <Button 
            onClick={() => fetchImages(true, state.searchQuery, state.selectedTags)}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!state.loading && !state.error && state.images.length === 0 && (
        <div className="text-center py-12">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            {state.searchQuery || state.selectedTags.length > 0 
              ? 'No photos found matching your criteria'
              : 'No photos available yet'
            }
          </p>
          {(state.searchQuery || state.selectedTags.length > 0) && (
            <Button 
              onClick={() => {
                setState(prev => ({ ...prev, searchQuery: '', selectedTags: [] }));
                fetchImages(true);
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Gallery Grid */}
      {state.images.length > 0 && (
        <div className={gridClasses}>
          {state.images.map((image, index) => (
            <SimpleGalleryItem
              key={`${image.publicId}-${index}`}
              image={image}
              index={index}
              onClick={() => handleImageClick(index)}
              enableHoverEffects={enableHoverEffects}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {state.hasMore && !state.error && (
        <div className="text-center mt-8">
          <Button
            onClick={handleLoadMore}
            disabled={state.loading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
          >
            {state.loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Load More Photos
              </>
            )}
          </Button>
        </div>
      )}

      {/* Lightbox */}
      {enableLightbox && (
        <Lightbox
          images={state.images}
          currentIndex={state.selectedImageIndex}
          isOpen={state.lightboxOpen}
          onClose={() => setState(prev => ({ ...prev, lightboxOpen: false }))}
          onNavigate={handleLightboxNavigate}
        />
      )}
    </div>
  );
};

// Simple Gallery Item Component
interface SimpleGalleryItemProps {
  image: SimpleGalleryImage;
  index: number;
  onClick: () => void;
  enableHoverEffects: boolean;
}

const SimpleGalleryItem: React.FC<SimpleGalleryItemProps> = ({
  image,
  index,
  onClick,
  enableHoverEffects
}) => {
  return (
    <div 
      className={`
        relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer
        transition-all duration-300 hover:shadow-lg
        ${enableHoverEffects ? 'hover:-translate-y-1' : ''}
      `}
      onClick={onClick}
    >
      <img
        src={image.url}
        alt={image.altText}
        className="w-full h-full object-cover"
        loading={index < 6 ? 'eager' : 'lazy'}
      />
      
      {/* Hover Overlay */}
      {enableHoverEffects && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-semibold text-sm mb-1 line-clamp-1">
              {image.title}
            </h3>
            {image.description && (
              <p className="text-xs text-gray-200 line-clamp-2">
                {image.description}
              </p>
            )}
            <p className="text-xs text-gray-300 mt-1">
              {new Date(image.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleDynamicGallery;