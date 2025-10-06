import { Metadata } from 'next';
import DynamicGallery from '@/components/DynamicGallery';

export const metadata: Metadata = {
  title: 'Gallery Demo - SafarSagaTrips',
  description: 'Demo of the dynamic gallery system with Cloudinary integration',
};

export default function GalleryDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dynamic Gallery Demo
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This demo shows the dynamic gallery system. Configure your Cloudinary credentials
            in .env.local to see your uploaded images, or view the fallback static gallery.
          </p>
        </div>

        <DynamicGallery
          itemsPerPage={12}
          enableSearch={true}
          enableFilters={true}
          enableHoverEffects={true}
          enableLightbox={true}
          gridColumns={{
            mobile: 1,
            tablet: 2,
            desktop: 3
          }}
        />

        <div className="mt-12 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">How to Use:</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-medium">1. Configure Cloudinary:</h3>
              <p>Update your .env.local file with your Cloudinary credentials (see CLOUDINARY_SETUP.md)</p>
            </div>
            <div>
              <h3 className="font-medium">2. Upload Images:</h3>
              <p>Use your Cloudinary dashboard to upload images to the "safarsaga-gallery" folder</p>
            </div>
            <div>
              <h3 className="font-medium">3. Add Metadata:</h3>
              <p>Add tags, captions, and descriptions to your images for better organization</p>
            </div>
            <div>
              <h3 className="font-medium">4. View Results:</h3>
              <p>Images will automatically appear in the gallery with search and filter capabilities</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}