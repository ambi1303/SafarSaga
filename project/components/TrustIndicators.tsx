'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Award, Users, Clock, Star, CheckCircle } from 'lucide-react';

const TrustIndicators = () => {
  const stats = [
    { icon: Users, number: '50,000+', label: 'Happy Travelers', color: 'text-blue-600' },
    { icon: Award, number: '15+', label: 'Years Experience', color: 'text-orange-600' },
    { icon: Star, number: '4.9/5', label: 'Customer Rating', color: 'text-yellow-600' },
    { icon: Shield, number: '100%', label: 'Secure Booking', color: 'text-green-600' },
  ];

  const certifications = [
    'IATA Certified',
    'ISO 9001:2015',
    'TripAdvisor Excellence',
    'BBB A+ Rating',
    'Secure Payment Gateway',
    '24/7 Customer Support'
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-sky-50 to-orange-50">
      <div className="container mx-auto px-4">
        {/* Trust Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Certifications */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Trusted & Certified</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {certifications.map((cert, index) => (
              <Badge key={index} variant="outline" className="px-4 py-2 bg-white/80 border-gray-300 text-gray-700 hover:bg-white transition-colors">
                <CheckCircle className="h-3 w-3 mr-2 text-green-600" />
                {cert}
              </Badge>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-green-100 rounded-full border border-green-200">
            <Shield className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">Your booking is protected by our 100% Money-Back Guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;