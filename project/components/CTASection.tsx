import { Button } from '@/components/ui/button';
import Link from 'next/link';

const CTASection = () => {
  return (
    <section className="relative py-16 sm:py-20 lg:py-32 overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&fit=crop")'
        }}
      >
        <div className="absolute inset-0 bg-sky-900/80"></div>
      </div>

      {/* Content - Mobile Optimized */}
      <div className="relative z-10 text-center text-white px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Ready for Your Next
            <span className="block text-orange-400 mt-1 sm:mt-2">Adventure?</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-8 sm:mb-10 lg:mb-12 text-gray-200 max-w-2xl mx-auto px-2">
            Join thousands of travelers who have trusted us to create their perfect getaway. Your dream destination awaits!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link href="/packages">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg w-full sm:w-auto"
              >
                Plan Your Trip Today
              </Button>
            </Link>
            <Link href="/packages">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 hover:text-gray-800 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg w-full sm:w-auto"
              >
                View Our Packages
              </Button>
            </Link>
          </div>

          <div className="mt-8 sm:mt-10 lg:mt-12 text-gray-300">
            <p className="text-xs sm:text-sm">
              ⭐ Rated 4.9/5 by over 10,000+ happy travelers
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;