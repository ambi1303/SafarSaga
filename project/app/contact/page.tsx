'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Optimized */}
      <section className="relative h-48 sm:h-56 lg:h-64 bg-sky-900 flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url("https://images.pexels.com/photos/1658967/pexels-photo-1658967.jpeg?auto=compress&cs=tinysrgb&w=1920&h=400&fit=crop")'
          }}
        />
        <div className="relative z-10 container mx-auto px-3 sm:px-4 text-white">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-4">
            Contact Us
          </h1>
          <p className="text-sm sm:text-base lg:text-xl">
            We're here to help plan your perfect adventure
          </p>
        </div>
      </section>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Contact Information */}
          <div className="space-y-6 sm:space-y-8 lg:order-1 order-2">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
                Get in Touch
              </h2>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                Have questions about your next trip? Our travel experts are ready to help you plan the perfect adventure.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4 sm:space-y-6">
              <Card>
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="bg-sky-100 rounded-full p-2 sm:p-3 flex-shrink-0">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">
                        Visit Our Office
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                      Shop no 3 basement, Plot no 1,<br/>
                      Tajpur Rd, Badarpur Extension,<br/>
                      Tajpur, badarpur border, New<br/>
                      Delhi, Delhi 110044<br/>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="bg-sky-100 rounded-full p-2 sm:p-3 flex-shrink-0">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">
                        Call Us
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                        <a href="9311706027" className="hover:text-sky-600">
                          +91 9311706027
                        </a><br />
                       
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="bg-sky-100 rounded-full p-2 sm:p-3 flex-shrink-0">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">
                        Email Us
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                        <a href="mailto:safarsagatrips@gmail.com" className="hover:text-sky-600">
                          safarsagatrips@gmail.com
                        </a><br />
                       
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="bg-sky-100 rounded-full p-2 sm:p-3 flex-shrink-0">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">
                        Business Hours
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                        Mon - Sat: 9:00 AM - 7:00 PM<br />
                        Sun: Closed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 lg:order-2 order-1">
            <Card>
              <CardHeader className="p-4 sm:p-5 lg:p-6">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl">
                  Send us a Message
                </CardTitle>
                <p className="text-gray-600 text-sm sm:text-base">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 lg:p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <Label htmlFor="name" className="text-sm sm:text-base">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        className="mt-1 h-10 sm:h-11"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm sm:text-base">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                        className="mt-1 h-10 sm:h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <Label htmlFor="phone" className="text-sm sm:text-base">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                        className="mt-1 h-10 sm:h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject" className="text-sm sm:text-base">
                        Subject *
                      </Label>
                      <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                        <SelectTrigger className="mt-1 h-10 sm:h-11">
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
                    <Label htmlFor="message" className="text-sm sm:text-base">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Tell us about your travel plans or questions..."
                      rows={4}
                      className="mt-1 resize-none"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 h-10 sm:h-11"
                  >
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-8 sm:mt-12 lg:mt-16">
          <Card>
            <CardContent className="p-0">
              <div className="h-64 sm:h-80 lg:h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-600 p-4">
                  <MapPin className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto mb-2 sm:mb-4" />
                  <p className="text-sm sm:text-base lg:text-lg font-medium">
                    Interactive Map Integration
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Google Maps would be embedded here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}