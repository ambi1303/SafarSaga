'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Award, Users, Clock, Star, CheckCircle } from 'lucide-react';
import { FadeIn, StaggerContainer } from '@/components/ScrollAnimations';

const TrustIndicators = () => {
  const stats = [
    { icon: Users, number: '2,500+', label: 'Happy Travelers', color: 'text-blue-600' },
    { icon: Award, number: '50+', label: 'Destinations Covered', color: 'text-orange-600' },
    { icon: Star, number: '4.8/5', label: 'Customer Rating', color: 'text-yellow-600' },
    { icon: Clock, number: '24/7', label: 'Customer Support', color: 'text-green-600' },
  ];

  const certifications = [
    'Government Approved',
    'IATO Member',
    'Secure Payment Gateway',
    'Best Price Guarantee',
    'Expert Local Guides',
    'Customized Itineraries'
  ];

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-r from-sky-50 to-orange-50">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Trust Stats - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10 lg:mb-12">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
              style={{ 
                animationDelay: `${index * 100}ms`,
                opacity: 0,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mx-auto mb-2 sm:mb-3 ${stat.color}`} />
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-xs sm:text-sm text-gray-600 leading-tight">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Certifications - Mobile Optimized */}
        <div className="text-center">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Trusted & Certified</h3>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {certifications.map((cert, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-white/80 border-gray-300 text-gray-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-all duration-200 text-xs sm:text-sm"
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  opacity: 0,
                  animation: 'fadeIn 0.5s ease-out forwards'
                }}
              >
                <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-2 text-green-600" />
                <span className="whitespace-nowrap">{cert}</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Security Notice - Mobile Optimized */}
        <div className="mt-6 sm:mt-8 text-center px-2">
          <div className="inline-flex items-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-green-100 rounded-full border border-green-200 max-w-full">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 flex-shrink-0" />
            <span className="text-green-800 font-medium text-xs sm:text-sm lg:text-base text-center">
              <span className="hidden sm:inline">Your booking is protected by our 100% Money-Back Guarantee</span>
              <span className="sm:hidden">100% Money-Back Guarantee</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;