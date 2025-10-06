import { v2 as cloudinary } from 'cloudinary';
import { GalleryImage, FetchOptions, GalleryResponse } from './cloudinary';

// Configure Cloudinary (server-side only)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryServerService {
  /**
   * Fetch gallery images from Cloudinary (server-side)
   */
  async fetchGalleryImages(options: FetchOptions = {}): Promise<GalleryResponse> {
    try {
      const {
        folder = process.env.NEXT_PUBLIC_GALLERY_FOLDER || 'safarsaga-gallery',
        tags = [],
        maxResults = 12,
        nextCursor,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;

      // Build search expression
      let expression = `folder:${folder}`;
      if (tags.length > 0) {
        expression += ` AND tags:(${tags.join(' OR ')})`;
      }

      const searchOptions: any = {
        expression,
        sort_by: `${sortBy},${sortOrder}`,
        max_results: maxResults,
        resource_type: 'image',
      };

      if (nextCursor) {
        searchOptions.next_cursor = nextCursor;
      }

      const result = await cloudinary.search.execute(searchOptions);

      const images: GalleryImage[] = result.resources.map((resource: any) => ({
        publicId: resource.public_id,
        url: resource.url,
        secureUrl: resource.secure_url,
        width: resource.width,
        height: resource.height,
        format: resource.format,
        createdAt: resource.created_at,
        tags: resource.tags || [],
        context: resource.context,
        altText: resource.context?.alt || this.generateAltText(resource.public_id),
        title: resource.context?.caption || this.generateTitle(resource.public_id),
        description: resource.context?.description || '',
      }));

      return {
        images,
        nextCursor: result.next_cursor,
        totalCount: result.total_count,
      };
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      throw new Error('Failed to fetch gallery images');
    }
  }

  /**
   * Search images by query (server-side)
   */
  async searchImages(query: string, options: FetchOptions = {}): Promise<GalleryResponse> {
    try {
      const {
        folder = process.env.NEXT_PUBLIC_GALLERY_FOLDER || 'safarsaga-gallery',
        maxResults = 12,
        nextCursor
      } = options;

      const searchOptions: any = {
        expression: `folder:${folder} AND (tags:${query} OR context.caption:${query})`,
        sort_by: 'created_at,desc',
        max_results: maxResults,
        resource_type: 'image',
      };

      if (nextCursor) {
        searchOptions.next_cursor = nextCursor;
      }

      const result = await cloudinary.search.execute(searchOptions);

      const images: GalleryImage[] = result.resources.map((resource: any) => ({
        publicId: resource.public_id,
        url: resource.url,
        secureUrl: resource.secure_url,
        width: resource.width,
        height: resource.height,
        format: resource.format,
        createdAt: resource.created_at,
        tags: resource.tags || [],
        context: resource.context,
        altText: resource.context?.alt || this.generateAltText(resource.public_id),
        title: resource.context?.caption || this.generateTitle(resource.public_id),
        description: resource.context?.description || '',
      }));

      return {
        images,
        nextCursor: result.next_cursor,
        totalCount: result.total_count,
      };
    } catch (error) {
      console.error('Error searching images:', error);
      throw new Error('Failed to search images');
    }
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
}

// Export singleton instance for server-side use
export const cloudinaryServerService = new CloudinaryServerService();
export default cloudinary;