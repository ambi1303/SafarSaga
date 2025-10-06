'use client';

import { useState, useRef } from 'react';
import { cloudinaryService, GalleryImage, TransformOptions } from '@/lib/cloudinary';

interface OptimizedImageProps {
  image: GalleryImage;
  width?: number;
  height?: number;
  quality?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'limit';
  loading?: 'lazy' | 'eager';
  placeholder?: 'blur' | 'empty';
  className?: string;
  alt?: string;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  image,
  width,
  height,
  quality = 'auto',
  crop = 'fill',
  loading = 'lazy',
  placeholder = 'blur',
  className = '',
  alt,
  onClick,
  size = 'medium'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate optimized URL
  const optimizedUrl = width && height 
    ? cloudinaryService.generateOptimizedUrl(image.publicId, {
        width,
        height,
        crop,
        quality,
        format: 'auto'
      })
    : cloudinaryService.generateThumbnailUrl(image.publicId, size);

  // Generate blur placeholder URL (very small, low quality)
  const placeholderUrl = cloudinaryService.generateOptimizedUrl(image.publicId, {
    width: 20,
    height: 15,
    crop: 'fill',
    quality: 10,
    format: 'auto'
  });

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const finalAlt = alt || image.altText || `SafarSaga travel photo: ${image.title}`;

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center text-gray-500 ${className}`}
        style={{ width: width || 400, height: height || 300 }}
      >
        <div className="text-center">
          <div className="text-sm">Image unavailable</div>
          <div className="text-xs mt-1">{image.title}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} onClick={onClick}>
      {/* Blur placeholder */}
      {placeholder === 'blur' && isLoading && (
        <img
          src={placeholderUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          aria-hidden="true"
        />
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={optimizedUrl}
        alt={finalAlt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;