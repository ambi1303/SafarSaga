import { Shield, Award, Clock, Users } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Best Price Guarantee',
    description: 'We match any competitor\'s price and guarantee the best deals on all travel packages.'
  },
  {
    icon: Award,
    title: 'Expert Guides',
    description: 'Our certified local guides provide authentic experiences and deep cultural insights.'
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock customer service to assist you before, during, and after your trip.'
  },
  {
    icon: Users,
    title: 'Trusted by Thousands',
    description: 'Over 50,000 happy travelers have chosen us for their dream vacations.'
  }
];

const WhyChooseUs = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-sky-50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Why Choose SafarSaga?
          </h2>
          <p className="text-sm sm:text-base lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            We're committed to making your travel dreams come true with exceptional service and unforgettable experiences
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="text-center group">
                <div className="bg-white rounded-full w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-5 lg:mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <IconComponent className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-sky-600" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed px-2">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;