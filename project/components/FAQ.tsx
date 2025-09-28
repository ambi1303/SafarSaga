'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Shield, Clock, CreditCard, Phone } from 'lucide-react';

const FAQ = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs = [
    {
      question: "What if I need to cancel my trip?",
      answer: "We offer flexible cancellation policies! Cancel up to 48 hours before departure for a full refund, no questions asked. We understand plans change, and we're here to support you.",
      icon: Shield
    },
    {
      question: "Are there any hidden fees?",
      answer: "Absolutely not! Our prices are 100% transparent. What you see is what you pay - no surprise charges, no hidden fees, no booking fees. We believe in honest, upfront pricing.",
      icon: CreditCard
    },
    {
      question: "How do I know my booking is secure?",
      answer: "Your booking is protected by our 256-bit SSL encryption, IATA certification, and $1M travel insurance. Plus, we're backed by our 100% money-back guarantee.",
      icon: Shield
    },
    {
      question: "What if something goes wrong during my trip?",
      answer: "Our 24/7 emergency support team is always available. We have local representatives in every destination and will resolve any issues immediately. Your peace of mind is our priority.",
      icon: Phone
    },
    {
      question: "How much can I really save compared to booking myself?",
      answer: "Our customers save an average of $800-$1,500 per trip through our exclusive partnerships, group rates, and insider deals. Plus, you save 20+ hours of research time!",
      icon: CreditCard
    },
    {
      question: "Can I customize my package?",
      answer: "Absolutely! Every package is fully customizable. Want to add extra days? Different hotel? Special experiences? Our travel experts will tailor everything to your exact preferences.",
      icon: Clock
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Still Have Questions? We Have Answers!
          </h2>
          <p className="text-sm sm:text-base lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
            Here are the most common questions from travelers like you
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-2 hover:border-blue-200 transition-colors">
                <CardContent className="p-0">
                  <button
                    className="w-full p-4 sm:p-5 lg:p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <faq.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                      </div>
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 pr-2">
                        {faq.question}
                      </h3>
                    </div>
                    <div className="flex-shrink-0">
                      {openFAQ === index ? (
                        <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                  
                  {openFAQ === index && (
                    <div className="px-4 sm:px-5 lg:px-6 pb-4 sm:pb-5 lg:pb-6">
                      <div className="pl-6 sm:pl-8 lg:pl-10">
                        <p className="text-xs sm:text-sm lg:text-base text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Still have questions CTA - Mobile Optimized */}
          <div className="text-center mt-8 sm:mt-10 lg:mt-12">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">
                Still have questions?
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-4 sm:mb-5 lg:mb-6 px-2">
                Our travel experts are standing by to help you plan the perfect trip
              </p>
              <div className="flex flex-col gap-3 sm:gap-4 justify-center">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm lg:text-base py-2 sm:py-2.5 lg:py-3">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-2" />
                  <span className="hidden sm:inline">Call Now: 1-800-SAFAR-SAGA</span>
                  <span className="sm:hidden">Call Now</span>
                </Button>
                <Button size="sm" variant="outline" className="text-xs sm:text-sm lg:text-base py-2 sm:py-2.5 lg:py-3">
                  Live Chat Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;