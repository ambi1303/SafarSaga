import { Button } from '@/components/ui/button';

const CTASection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&fit=crop")'
        }}
      >
        <div className="absolute inset-0 bg-sky-900/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Ready for Your Next
            <span className="block text-orange-400">Adventure?</span>
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-2xl mx-auto">
            Join thousands of travelers who have trusted us to create their perfect getaway. Your dream destination awaits!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg">
              Plan Your Trip Today
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg">
              View Our Packages
            </Button>
          </div>
          
          <div className="mt-12 text-gray-300">
            <p className="text-sm">
              ⭐ Rated 4.9/5 by over 10,000+ happy travelers
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;