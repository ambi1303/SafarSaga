'use client';

import { useEffect, useCallback, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface LightboxProps {
  images: GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  enableZoom?: boolean;
  showMetadata?: boolean;
}

const Lightbox: React.FC<LightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  enableZoom = true,
  showMetadata = true
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const currentImage = images[currentIndex];

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        if (currentIndex > 0) {
          onNavigate('prev');
        }
        break;
      case 'ArrowRight':
        if (currentIndex < images.length - 1) {
          onNavigate('next');
        }
        break;
      case 'i':
      case 'I':
        setShowInfo(prev => !prev);
        break;
      case 'z':
      case 'Z':
        if (enableZoom) {
          setIsZoomed(prev => !prev);
        }
        break;
    }
  }, [isOpen, currentIndex, images.length, onClose, onNavigate, enableZoom]);

  // Add/remove keyboard event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  // Reset zoom when image changes
  useEffect(() => {
    setIsZoomed(false);
    setImageLoading(true);
  }, [currentIndex]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Handle download
  const handleDownload = async () => {
    if (!currentImage) return;

    try {
      const response = await fetch(currentImage.secureUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `safarsaga-${currentImage.title || 'photo'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  if (!isOpen || !currentImage) return null;

  const fullSizeUrl = currentImage.secureUrl;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <span className="text-sm">
              {currentIndex + 1} of {images.length}
            </span>
            {currentImage.title && (
              <span className="text-sm font-medium">
                • {currentImage.title}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            {enableZoom && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsZoomed(!isZoomed)}
                className="text-white hover:bg-white/20"
              >
                {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
              </Button>
            )}
            
            {/* Info Toggle */}
            {showMetadata && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInfo(!showInfo)}
                className="text-white hover:bg-white/20"
              >
                <Info className="h-4 w-4" />
              </Button>
            )}
            
            {/* Download */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-white hover:bg-white/20"
            >
              <Download className="h-4 w-4" />
            </Button>
            
            {/* Close */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {currentIndex > 0 && (
        <Button
          variant="ghost"
          size="lg"
          onClick={() => onNavigate('prev')}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}

      {currentIndex < images.length - 1 && (
        <Button
          variant="ghost"
          size="lg"
          onClick={() => onNavigate('next')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}

      {/* Main Image */}
      <div className={`relative max-w-full max-h-full transition-transform duration-300 ${
        isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
      }`}>
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <img
          src={fullSizeUrl}
          alt={currentImage.altText || currentImage.title}
          className="max-w-full max-h-full object-contain"
          onLoad={() => setImageLoading(false)}
          onClick={() => enableZoom && setIsZoomed(!isZoomed)}
        />
      </div>

      {/* Metadata Panel */}
      {showMetadata && showInfo && (
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
          <div className="max-w-2xl">
            {currentImage.title && (
              <h2 className="text-xl font-semibold mb-2">{currentImage.title}</h2>
            )}
            
            {currentImage.description && (
              <p className="text-gray-200 mb-3">{currentImage.description}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
              <span>
                Uploaded: {new Date(currentImage.createdAt).toLocaleDateString()}
              </span>
              
              <span>
                Size: {currentImage.width} × {currentImage.height}
              </span>
              
              {currentImage.tags.length > 0 && (
                <span>
                  Tags: {currentImage.tags.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Touch/Swipe Indicators for Mobile */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 md:hidden">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Lightbox;