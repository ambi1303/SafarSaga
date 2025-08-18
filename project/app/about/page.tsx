import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Users, Award, Globe, Heart, Star } from 'lucide-react';

const teamMembers = [
  {
    name: 'Sarah Johnson',
    role: 'Founder & CEO',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    bio: 'With 15 years in travel industry, Sarah founded Wanderlust to make extraordinary travel accessible to everyone.'
  },
  {
    name: 'Michael Chen',
    role: 'Head of Operations',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    bio: 'Michael ensures every trip runs smoothly, coordinating with partners worldwide to deliver seamless experiences.'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Travel Curator',
    image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    bio: 'Emily handpicks unique destinations and creates unforgettable itineraries based on cultural immersion.'
  },
  {
    name: 'David Kim',
    role: 'Customer Experience Director',
    image: 'https://images.pexels.com/photos/846741/pexels-photo-846741.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    bio: 'David leads our customer service team, ensuring every traveler feels supported throughout their journey.'
  }
];

const stats = [
  { icon: Users, number: '50,000+', label: 'Happy Travelers' },
  { icon: MapPin, number: '120+', label: 'Destinations' },
  { icon: Award, number: '25+', label: 'Awards Won' },
  { icon: Star, number: '4.9', label: 'Average Rating' }
];

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
      {/* Hero Section */}
      <section className="relative h-96 flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop")'
          }}
        >
          <div className="absolute inset-0 bg-sky-900/80"></div>
        </div>
        <div className="relative z-10 container mx-auto px-4 text-white text-center">
          <h1 className="text-6xl font-bold mb-6">About Wanderlust</h1>
          <p className="text-2xl max-w-3xl mx-auto leading-relaxed">
            We're passionate about creating extraordinary travel experiences that inspire, educate, and transform lives through the power of exploration.
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="w-20 h-1 bg-orange-500 mx-auto mb-8"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Founded in 2015, Wanderlust began as a small dream to make authentic travel experiences accessible to everyone. What started as a passion project has grown into a trusted travel partner for thousands of adventurers worldwide.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Our founder, Sarah Johnson, discovered her love for travel during a solo backpacking trip through Southeast Asia. She realized that the most meaningful experiences came from connecting with local cultures and communities, not just visiting famous landmarks.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Today, we continue that mission by partnering with local guides, supporting community-based tourism, and creating itineraries that go beyond the surface to reveal the heart and soul of each destination.
                </p>
              </div>
              
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
                  alt="Travel collage"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-orange-500 text-white p-6 rounded-2xl">
                  <div className="text-3xl font-bold">10+</div>
                  <div className="text-sm">Years of Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-sky-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Numbers that reflect our commitment to excellence and customer satisfaction
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <IconComponent className="h-8 w-8 text-sky-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do and every experience we create
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="bg-sky-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="h-8 w-8 text-sky-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The passionate travel experts behind your unforgettable experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8">
                  <Avatar className="w-32 h-32 mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-sky-600 font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-sky-900 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who trust Wanderlust to create their perfect getaway
          </p>
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg">
            Explore Destinations
          </Button>
        </div>
      </section>
    </div>
  );
}