// Browser-compatible Cloudinary service (no server-side dependencies)

// Types for our gallery system
export interface GalleryImage {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  createdAt: string;
  tags: string[];
  context?: Record<string, string>;
  altText?: string;
  title?: string;
  description?: string;
}

export interface FetchOptions {
  folder?: string;
  tags?: string[];
  maxResults?: number;
  nextCursor?: string;
  sortBy?: 'created_at' | 'public_id' | 'uploaded_at';
  sortOrder?: 'asc' | 'desc';
}

export interface GalleryResponse {
  images: GalleryImage[];
  nextCursor?: string;
  totalCount: number;
}

export interface TransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'limit';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}

class CloudinaryGalleryService {
  private cloudName: string;

  constructor() {
    this.cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  }

  /**
   * This method will be called from the API route, not directly from the browser
   * The browser will use the /api/gallery endpoint instead
   */
  async fetchGalleryImages(options: FetchOptions = {}): Promise<GalleryResponse> {
    // This method is now only used server-side via API routes
    throw new Error('This method should only be called from server-side API routes');
  }

  /**
   * Generate optimized image URL with transformations
   */
  generateOptimizedUrl(publicId: string, options: TransformOptions = {}): string {
    const {
      width = 400,
      height = 300,
      crop = 'fill',
      quality = 'auto',
      format = 'auto'
    } = options;

    const transformations = [
      `w_${width}`,
      `h_${height}`,
      `c_${crop}`,
      `q_${quality}`,
      `f_${format}`
    ].join(',');

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformations}/${publicId}`;
  }

  /**
   * Generate thumbnail URL for grid display
   */
  generateThumbnailUrl(publicId: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const sizes = {
      small: { width: 300, height: 200 },
      medium: { width: 400, height: 300 },
      large: { width: 600, height: 400 }
    };

    return this.generateOptimizedUrl(publicId, {
      ...sizes[size],
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    });
  }

  /**
   * Generate full-size URL for lightbox
   */
  generateFullSizeUrl(publicId: string): string {
    return this.generateOptimizedUrl(publicId, {
      width: 1200,
      height: 800,
      crop: 'limit',
      quality: 'auto',
      format: 'auto'
    });
  }

  /**
   * Generate alt text from public ID
   */
  private generateAltText(publicId: string): string {
    const filename = publicId.split('/').pop() || '';
    const cleanName = filename
      .replace(/[-_]/g, ' ')
      .replace(/\.[^/.]+$/, '')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    return `SafarSaga travel photo: ${cleanName}`;
  }

  /**
   * Generate title from public ID
   */
  private generateTitle(publicId: string): string {
    const filename = publicId.split('/').pop() || '';
    const cleanName = filename
      .replace(/[-_]/g, ' ')
      .replace(/\.[^/.]+$/, '')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    return cleanName;
  }

  /**
   * Search images by query - server-side only
   */
  async searchImages(query: string, options: FetchOptions = {}): Promise<GalleryResponse> {
    // This method is now only used server-side via API routes
    throw new Error('This method should only be called from server-side API routes');
  }
}

// Export singleton instance
export const cloudinaryService = new CloudinaryGalleryService();