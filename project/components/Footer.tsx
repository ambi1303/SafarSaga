import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plane, Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex items-center space-x-2 text-2xl font-bold mb-4">
              <Plane className="h-8 w-8 text-sky-400" />
              <span>Wanderlust</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Discover extraordinary destinations and create unforgettable memories with our expert-curated travel experiences.
            </p>
            <div className="flex space-x-4">
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800">
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'Destinations', 'Blog', 'About Us', 'Contact'].map((link) => (
                <li key={link}>
                  <Link href={`/${link.toLowerCase().replace(' ', '-')}`} className="text-gray-400 hover:text-white transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {['Adventure Tours', 'Beach Vacations', 'Cultural Trips', 'Honeymoon Packages', 'Group Travel'].map((service) => (
                <li key={service}>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-4">Subscribe to our newsletter for the latest travel deals and inspiration.</p>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter your email"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
              <Button className="bg-sky-600 hover:bg-sky-700">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 Wanderlust Travel Agency. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;