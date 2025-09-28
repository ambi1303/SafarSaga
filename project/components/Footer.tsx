import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plane, Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block group mb-4 sm:mb-6">
              <div className="relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 p-3 sm:p-4 transition-all duration-300 group-hover:from-gray-700 group-hover:to-gray-800 group-hover:border-gray-500 group-hover:scale-105 shadow-lg group-hover:shadow-xl">
                <img
                  src="/logo.png.png"
                  alt="SafarSaga"
                  className="h-12 sm:h-16 lg:h-18 w-auto object-contain drop-shadow-md"
                />
              </div>
            </Link>
            <p className="text-gray-400 mb-4 text-sm sm:text-base leading-relaxed">
              Discover extraordinary destinations and create unforgettable memories with our expert-curated travel experiences.
            </p>
            <div className="flex space-x-2 sm:space-x-4">
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800 h-9 w-9 sm:h-10 sm:w-10">
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800 h-9 w-9 sm:h-10 sm:w-10">
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Link
                href="https://www.instagram.com/safarsagatrips?utm_source=ig_web_button_share_sheet&igsh=ZTk5eXVtaHd4bDI="
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800 h-9 w-9 sm:h-10 sm:w-10">
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-1 sm:space-y-2">
              {['Home', 'Destinations', 'Blog', 'About Us', 'Contact'].map((link) => (
                <li key={link}>
                  <Link
                    href={`/${link.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base block py-1"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Services</h3>
            <ul className="space-y-1 sm:space-y-2">
              {['Adventure Tours', 'Beach Vacations', 'Cultural Trips', 'Honeymoon Packages', 'Group Travel'].map((service) => (
                <li key={service}>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base block py-1"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
              Subscribe to our newsletter for the latest travel deals and inspiration.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Enter your email"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 h-10 sm:h-11 text-sm sm:text-base flex-1"
              />
              <Button className="bg-sky-600 hover:bg-sky-700 h-10 sm:h-11 px-4 sm:px-6 flex-shrink-0">
                <Mail className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Subscribe</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            © 2025 SafarSaga Travel Agency. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;