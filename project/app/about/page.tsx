'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Users, Award, Globe, Heart, Star, Bus, Phone, Building } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Passion for Travel',
    description: 'We believe travel transforms lives and creates lasting memories that enrich the human experience.'
  },
  {
    icon: Users,
    title: 'Customer First',
    description: 'Every decision we make is centered around delivering exceptional value and service to our travelers.'
  },
  {
    icon: Globe,
    title: 'Cultural Respect',
    description: 'We promote responsible tourism that respects local cultures and supports community development.'
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'We set the highest standards in everything we do, from partner selection to customer service.'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Optimized */}
      <section className="relative h-64 sm:h-80 lg:h-96 flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop")'
          }}
        >
          <div className="absolute inset-0 bg-sky-900/80"></div>
        </div>
        <div className="relative z-10 container mx-auto px-3 sm:px-4 text-white text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 lg:mb-6">
            About SafarSaga
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl max-w-4xl mx-auto leading-relaxed px-2">
            We're passionate about creating extraordinary travel experiences that inspire, educate, and transform lives through the power of exploration.
          </p>
        </div>
      </section>

      {/* Welcome Section with Gallery */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
              {/* Photo Gallery */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-3 sm:space-y-4">
                  <img
                    src="/images/gallery/manali-kasol.JPG"
                    alt="Manali Kasol adventure experiences"
                    className="rounded-lg w-full h-32 sm:h-40 object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop";
                    }}
                  />
                  <img
                    src="/images/gallery/jibli.JPG"
                    alt="Jibhi beautiful landscapes"
                    className="rounded-lg w-full h-32 sm:h-40 object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop";
                    }}
                  />
                </div>
                <div className="space-y-3 sm:space-y-4 mt-6">
                  <img
                    src="/images/gallery/chopta-1.JPG"
                    alt="Chopta memorable travel moments"
                    className="rounded-lg w-full h-32 sm:h-40 object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop";
                    }}
                  />
                  <img
                    src="/images/gallery/chakrata.JPG"
                    alt="Chakrata amazing travel experiences"
                    className="rounded-lg w-full h-32 sm:h-40 object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop";
                    }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <p className="text-orange-500 font-semibold text-sm sm:text-base mb-2">ABOUT US</p>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Welcome to <span className="text-orange-500">SafarSaga</span>
                  </h2>
                </div>

                <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed mb-6">
                  At SafarSaga, we believe travel is more than just visiting places – it's about creating unforgettable experiences. Whether it's a group adventure, a customized getaway, or a corporate retreat, we ensure every journey is seamless, exciting, and memorable.
                </p>

                <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed mb-6">
                  From the serene landscapes of Uttarakhand and Himachal to the cultural richness of Rajasthan and J&K, we curate trips that cater to every traveler's dream.
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-gray-700">Group & Custom Tours</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-gray-700">Handpicked Stays</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bus className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-gray-700">Comfortable Transport</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-gray-700">150+ Premium City Tours</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-gray-700">24/7 Customer Assistance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-gray-700">Corporate & Luxury Travel</span>
                  </div>
                </div>

                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg">
                  Read More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Values Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
              Our Values
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              The principles that guide everything we do and every experience we create
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="bg-sky-100 rounded-full w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-sky-600" />
                    </div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">
                      {value.title}
                    </h3>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-sky-900 text-white text-center">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 lg:mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-sm sm:text-base lg:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Join thousands of travelers who trust SafarSaga to create their perfect getaway
          </p>
          <Button
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg"
          >
            Explore Destinations
          </Button>
        </div>
      </section>
    </div>
  );
}