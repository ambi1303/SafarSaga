'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Zap } from 'lucide-react';

const PriceComparison = () => {
  const competitors = [
    { name: 'Other Agency A', price: 2499, rating: 3.8, issues: ['Hidden fees', 'Poor support', 'Limited options'] },
    { name: 'Other Agency B', price: 2299, rating: 4.1, issues: ['No refunds', 'Basic packages', 'Extra charges'] },
    { name: 'Other Agency C', price: 2699, rating: 3.9, issues: ['Outdated hotels', 'No customization', 'Slow response'] },
  ];

  const ourFeatures = [
    'No hidden fees - All inclusive pricing',
    '24/7 premium customer support',
    'Free cancellation up to 48 hours',
    'Handpicked luxury accommodations',
    'Personal travel concierge',
    'Instant booking confirmation',
    'Price match guarantee',
    'Exclusive local experiences'
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Pay More Elsewhere?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compare SafarSaga with other travel agencies and see why thousands choose us for their dream vacations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Competitors */}
          {competitors.map((competitor, index) => (
            <Card key={index} className="relative">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg">{competitor.name}</CardTitle>
                <div className="text-3xl font-bold text-gray-900">${competitor.price}</div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm text-gray-600">{competitor.rating}/5</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {competitor.issues.map((issue, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{issue}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-6" disabled>
                  Limited Options
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* SafarSaga - Our Offer */}
          <Card className="relative border-4 border-orange-500 shadow-2xl transform scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-orange-500 hover:bg-orange-600 px-4 py-1">
                <Crown className="h-4 w-4 mr-1" />
                BEST VALUE
              </Badge>
            </div>
            
            <CardHeader className="text-center pb-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
              <CardTitle className="text-xl">SafarSaga</CardTitle>
              <div className="space-y-1">
                <div className="text-sm line-through opacity-75">$2,499</div>
                <div className="text-4xl font-bold">$1,899</div>
                <div className="text-sm bg-white/20 px-2 py-1 rounded">Save $600!</div>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-yellow-300">★★★★★</span>
                <span className="text-sm">4.9/5</span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-3 mb-6">
                {ourFeatures.slice(0, 6).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3">
                <Zap className="h-4 w-4 mr-2" />
                Book Now - Limited Time!
              </Button>
              
              <div className="text-center mt-3">
                <span className="text-xs text-gray-500">⚡ Only 3 spots left at this price!</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center px-8 py-4 bg-green-100 rounded-full border-2 border-green-300">
            <Check className="h-6 w-6 text-green-600 mr-3" />
            <span className="text-green-800 font-bold text-lg">
              100% Money-Back Guarantee - No Questions Asked!
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PriceComparison;