'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Star,
  Shield
} from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    {
      href: '/packages',
      label: 'Packages',
      badge: 'New'
    },
    { href: '/destinations', label: 'Destinations' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact Us' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top Bar - Enterprise Level */}
      <div className="bg-gray-900 text-white py-2 hidden lg:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-orange-400" />
                <a href="tel:+919311706027" className="hover:text-orange-400 transition-colors">
                  +91 9311706027
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-orange-400" />
                <a href="mailto:safarsagatrips@gmail.com" className="hover:text-orange-400 transition-colors">
                  safarsagatrips@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-orange-400" />
                <span>Delhi, India</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="font-medium">4.8/5</span>
                <span className="text-gray-300">|</span>
                <span>2,500+ Reviews</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4 text-green-400" />
                <span>Secure Booking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/98 backdrop-blur-lg shadow-lg border-b border-gray-200'
        : 'bg-white/95 backdrop-blur-md border-b border-gray-100'
        }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo - Enhanced */}
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-2 lg:p-3 transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                  <img
                    src="/logo.png.png"
                    alt="SafarSaga"
                    className="h-8 lg:h-12 w-auto object-contain"
                  />
                </div>
              </div>
              <div className="ml-3 hidden sm:block">
                <div className="text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors">
                  SafarSaga
                </div>
                <div className="text-xs lg:text-sm text-gray-500 -mt-1">
                  Explore Incredible India
                </div>
              </div>
            </Link>

            {/* Desktop Navigation - Enhanced */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${pathname === item.href
                      ? 'text-orange-500 bg-orange-50'
                      : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50'
                      }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0.5 ml-1">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                  {pathname === item.href && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                Book Now
              </Button>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2 lg:hidden">
              <Button
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 text-xs rounded-lg"
              >
                Book
              </Button>
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation - Enhanced */}
          {isMenuOpen && (
            <nav className="lg:hidden py-4 border-t border-gray-100 animate-fadeInUp">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between py-3 px-4 rounded-lg font-medium transition-all ${pathname === item.href
                      ? 'text-orange-500 bg-orange-50'
                      : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-orange-500 text-white text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>

              {/* Mobile Contact Info */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Phone className="h-4 w-4 text-orange-500" />
                    <a href="tel:+919311706027" className="hover:text-orange-500">
                      +91 9311706027
                    </a>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Mail className="h-4 w-4 text-orange-500" />
                    <a href="mailto:safarsagatrips@gmail.com" className="hover:text-orange-500">
                      safarsagatrips@gmail.com
                    </a>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-lg font-medium">
                  Book Your Trip Now
                </Button>
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;