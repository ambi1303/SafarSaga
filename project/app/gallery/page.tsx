import { Metadata } from 'next';
import AlbumGallery from '@/components/AlbumGallery';

export const metadata: Metadata = {
  title: 'Travel Photo Gallery - SafarSaga Adventures | India Travel Photos',
  description: 'Explore stunning travel photos from SafarSaga\'s India destinations. View beautiful landscapes, cultural experiences, and adventure moments from our travel packages.',
  keywords: 'travel photos, India travel gallery, SafarSaga photos, travel destinations, adventure photos, India tourism, travel experiences',
  openGraph: {
    title: 'Travel Photo Gallery - SafarSaga Adventures',
    description: 'Explore stunning travel photos from SafarSaga\'s India destinations and adventure experiences.',
    type: 'website',
    images: [
      {
        url: '/images/gallery/manali-kasol.JPG',
        width: 1200,
        height: 630,
        alt: 'SafarSaga Travel Gallery - Beautiful India destinations',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Photo Gallery - SafarSaga Adventures',
    description: 'Explore stunning travel photos from SafarSaga\'s India destinations.',
    images: ['/images/gallery/manali-kasol.JPG'],
  },
};

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section for Gallery Page */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Travel Photo Gallery
          </h1>
          <p className="text-xl lg:text-2xl text-orange-100 max-w-3xl mx-auto">
            Discover the incredible moments captured by our travelers on their unforgettable journeys across India
          </p>
        </div>
      </section>

      {/* Album Gallery */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <AlbumGallery className="max-w-7xl mx-auto" />
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Create Your Own Memories?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who have experienced the magic of India with SafarSaga. 
            Book your adventure today and become part of our gallery!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/packages" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View Packages
            </a>
            <a 
              href="/contact" 
              className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}