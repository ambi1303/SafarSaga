'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Tag } from 'lucide-react';

const offers = [
  {
    id: 1,
    title: 'Mediterranean Cruise',
    originalPrice: 1999,
    discountedPrice: 1499,
    discount: 25,
    image: 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    duration: '7 days',
    validUntil: '2025-03-15'
  },
  {
    id: 2,
    title: 'African Safari Adventure',
    originalPrice: 2799,
    discountedPrice: 2099,
    discount: 25,
    image: 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    duration: '10 days',
    validUntil: '2025-04-20'
  },
  {
    id: 3,
    title: 'Northern Lights Iceland',
    originalPrice: 1599,
    discountedPrice: 1199,
    discount: 25,
    image: 'https://images.pexels.com/photos/1031588/pexels-photo-1031588.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    duration: '5 days',
    validUntil: '2025-02-28'
  },
  {
    id: 4,
    title: 'Thai Island Hopping',
    originalPrice: 1299,
    discountedPrice: 999,
    discount: 23,
    image: 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    duration: '8 days',
    validUntil: '2025-05-10'
  }
];

const SpecialOffers = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Special Offers</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Limited time deals on our most popular travel packages
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {offers.map((offer) => (
            <Card key={offer.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600">
                  <Tag className="h-3 w-3 mr-1" />
                  {offer.discount}% OFF
                </Badge>
              </div>
              
              <CardContent className="p-5">
                <h3 className="font-bold text-lg mb-3 group-hover:text-sky-600 transition-colors">
                  {offer.title}
                </h3>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">{offer.duration}</span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg text-gray-400 line-through">
                      ${offer.originalPrice}
                    </span>
                    <span className="text-2xl font-bold text-orange-600">
                      ${offer.discountedPrice}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Valid until {new Date(offer.validUntil).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                
                <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white">
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;