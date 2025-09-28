'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FadeIn } from '@/components/ScrollAnimations';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  MessageCircle,
  Globe,
  Users,
  Star,
  CheckCircle
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Our Office',
      content: 'shop no 3 basement, Plot no 1,Tajpur Rd, Badarpur Extension,Tajpur, badarpur border, NewDelhi, Delhi 110044',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+91 9311706027',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Mail,
      title: 'Email Us',
      content: 'safarsagatrips@gmail.com',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      content: 'Mon - Sat: 9:00 AM - 7:00 PM',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const stats = [
    { icon: Users, number: '2,500+', label: 'Happy Customers' },
    { icon: Globe, number: '50+', label: 'Destinations' },
    { icon: Star, number: '4.9', label: 'Average Rating' },
    { icon: MessageCircle, number: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 lg:h-[500px] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop")'
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <div className="inline-flex items-center bg-orange-500/20 text-orange-200 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <MessageCircle className="h-4 w-4 mr-2" />
            GET IN TOUCH
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Contact <span className="text-orange-400">SafarSaga</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Ready to plan your next adventure? Our travel experts are here to help you create unforgettable memories
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Stats Section */}
        <FadeIn delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </Card>
              );
            })}
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <FadeIn delay={200}>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Let's Start Planning Your Journey
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Have questions about destinations, bookings, or need a custom itinerary? We're here to help make your travel dreams come true.
              </p>

              {/* Contact Cards */}
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-orange-500">
                      <div className="flex items-start space-x-4">
                        <div className={`rounded-full p-3 ${info.color}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            {info.title}
                          </h3>
                          <p className="text-gray-600">
                            {info.content}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Why Choose Us */}
              <Card className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Why Choose SafarSaga?</h3>
                <div className="space-y-3">
                  {[
                    'Expert travel consultants with local knowledge',
                    'Customized itineraries for every budget',
                    '24/7 customer support during your trip',
                    'Best price guarantee on all packages'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </FadeIn>

          {/* Contact Form */}
          <FadeIn delay={300}>
            <Card className="p-8 shadow-xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Send Us a Message
                </h3>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you within 24 hours
                </p>
              </div>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600">Thank you for contacting us. We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        className="h-12"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                        className="h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="booking">Booking Assistance</SelectItem>
                          <SelectItem value="support">Customer Support</SelectItem>
                          <SelectItem value="custom">Custom Trip Planning</SelectItem>
                          <SelectItem value="group">Group Travel</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Tell us about your travel plans, preferred destinations, budget, or any specific requirements..."
                      rows={5}
                      className="resize-none"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-lg font-medium"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending Message...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </div>
                    )}
                  </Button>
                </form>
              )}
            </Card>
          </FadeIn>
        </div>

        {/* Map Section */}
        <FadeIn delay={400}>
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Us Here</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Visit our office for personalized travel consultation and planning services
              </p>
            </div>
            
            <Card className="overflow-hidden">
              <div className="h-96 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <div className="text-center text-gray-600 p-8">
                  <MapPin className="h-16 w-16 mx-auto mb-4 text-orange-500" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Interactive Map
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Jaipur extn ishmalpur road new delhi-110044
                  </p>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Get Directions
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </FadeIn>

        {/* Quick Contact CTA */}
        <FadeIn delay={500}>
          <Card className="mt-16 p-8 bg-gradient-to-r from-orange-500 to-red-500 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Need Immediate Assistance?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Call us now for instant support and travel guidance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-orange-500 hover:bg-gray-100 font-medium"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call +91 9311706027
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-orange-500 font-medium"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp Chat
              </Button>
            </div>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}