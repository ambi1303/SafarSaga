import { Search, Calendar, Plane, Heart } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Discover',
    description: 'Browse our curated collection of extraordinary destinations and experiences'
  },
  {
    icon: Calendar,
    title: 'Book',
    description: 'Reserve your spot with our simple booking process and flexible payment options'
  },
  {
    icon: Plane,
    title: 'Travel',
    description: 'Embark on your adventure with our expert guides and local connections'
  },
  {
    icon: Heart,
    title: 'Remember',
    description: 'Create lasting memories and share your incredible journey with others'
  }
];

const HowItWorks = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4">
            How It <span className="font-bold">Works</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-light">
            Your journey to extraordinary places starts here
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="text-center group">
                  {/* Step Number */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-gray-900 transition-colors duration-300">
                      <IconComponent className="h-7 w-7 sm:h-8 sm:w-8 text-gray-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 font-light leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Connection Lines - Hidden on mobile */}
          <div className="hidden lg:block relative -mt-32 mb-16">
            <div className="absolute top-10 left-1/4 right-1/4 h-px bg-gray-200"></div>
            <div className="absolute top-10 left-1/2 right-1/4 h-px bg-gray-200 transform -translate-x-1/4"></div>
            <div className="absolute top-10 left-3/4 right-0 h-px bg-gray-200 transform -translate-x-1/2"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;