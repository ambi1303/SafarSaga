'use client';

import { useState, useEffect } from 'react';
import { Camera, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import {
  getAlbums,
  getAlbumWithImages,
  type GalleryAlbum,
  type GalleryAlbumWithImages,
} from '@/lib/gallery-api';

interface AlbumGalleryProps {
  className?: string;
}

export default function AlbumGallery({ className = '' }: AlbumGalleryProps) {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbumWithImages | null>(null);
  const [lightboxImage, setLightboxImage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const albumsData = await getAlbums();
      setAlbums(albumsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleAlbumClick = async (albumId: string) => {
    try {
      const albumData = await getAlbumWithImages(albumId);
      setSelectedAlbum(albumData);
    } catch (err: any) {
      setError(err.message || 'Failed to load album');
    }
  };

  const handlePrevImage = () => {
    if (lightboxImage !== null && selectedAlbum) {
      setLightboxImage((lightboxImage - 1 + selectedAlbum.images.length) % selectedAlbum.images.length);
    }
  };

  const handleNextImage = () => {
    if (lightboxImage !== null && selectedAlbum) {
      setLightboxImage((lightboxImage + 1) % selectedAlbum.images.length);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-red-600 mb-2">{error}</p>
        <button
          onClick={loadAlbums}
          className="text-orange-500 hover:text-orange-600 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="text-center py-20">
        <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Albums Yet</h3>
        <p className="text-gray-500">Check back soon for amazing travel photos!</p>
      </div>
    );
  }

  // Album Detail View
  if (selectedAlbum) {
    return (
      <div className={`${className}`}>
        {/* Back Button */}
        <button
          onClick={() => setSelectedAlbum(null)}
          className="mb-6 flex items-center text-orange-500 hover:text-orange-600 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Albums
        </button>

        {/* Album Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedAlbum.title}</h2>
          {selectedAlbum.description && (
            <p className="text-gray-600">{selectedAlbum.description}</p>
          )}
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span>{selectedAlbum.images.length} photos</span>
            {selectedAlbum.destination_name && (
              <>
                <span>•</span>
                <span>{selectedAlbum.destination_name}</span>
              </>
            )}
          </div>
        </div>

        {/* Images Grid */}
        {selectedAlbum.images.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No images in this album yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedAlbum.images.map((image, index) => (
              <div
                key={image.id}
                onClick={() => setLightboxImage(index)}
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[4/3] relative">
                  <img
                    src={image.image_url}
                    alt={image.caption || `Image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white text-sm font-medium">{image.caption}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {lightboxImage !== null && selectedAlbum.images[lightboxImage] && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              onClick={handlePrevImage}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <ChevronLeft className="w-12 h-12" />
            </button>

            <button
              onClick={handleNextImage}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <ChevronRight className="w-12 h-12" />
            </button>

            <div className="max-w-7xl max-h-[90vh] mx-4">
              <img
                src={selectedAlbum.images[lightboxImage].image_url}
                alt={selectedAlbum.images[lightboxImage].caption || ''}
                className="max-w-full max-h-[90vh] object-contain"
              />
              {selectedAlbum.images[lightboxImage].caption && (
                <div className="text-center mt-4">
                  <p className="text-white text-lg">{selectedAlbum.images[lightboxImage].caption}</p>
                </div>
              )}
              <div className="text-center mt-2">
                <p className="text-gray-400 text-sm">
                  {lightboxImage + 1} / {selectedAlbum.images.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Albums Grid View
  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album) => (
          <div
            key={album.id}
            onClick={() => handleAlbumClick(album.id)}
            className="group cursor-pointer bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Album Cover */}
            <div className="aspect-[16/10] relative overflow-hidden bg-gray-200">
              {album.cover_image_url ? (
                <img
                  src={album.cover_image_url}
                  alt={album.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Image Count Badge */}
              <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                {album.image_count} {album.image_count === 1 ? 'photo' : 'photos'}
              </div>
            </div>

            {/* Album Info */}
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors">
                {album.title}
              </h3>
              {album.description && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">{album.description}</p>
              )}
              {album.destination_name && (
                <div className="flex items-center text-sm text-gray-500">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {album.destination_name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
