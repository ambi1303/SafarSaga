'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/upcoming-trips', label: 'Upcoming Trips' },
    { href: '/destinations', label: 'Destinations' },
    { href: '/booking', label: 'Booking' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact Us' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* Logo - Compact Mobile Design */}
          <Link href="/" className="flex items-center group">
            <div className="relative overflow-hidden rounded-md sm:rounded-lg bg-gradient-to-br from-white to-gray-50 shadow-sm border border-gray-200 p-1 sm:p-1.5 transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
              <img
                src="/logo.png.png"
                alt="SafarSaga"
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-sky-600 transition-colors font-medium text-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden lg:flex">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm h-9">
              Book Now
            </Button>
          </div>

          {/* Mobile CTA + Menu Button */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1.5 text-xs h-8 min-w-[50px]"
            >
              Book
            </Button>
            <button
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors h-8 w-8 flex items-center justify-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Compact */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-3 pb-3 border-t pt-3 animate-fade-in">
            <div className="space-y-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-2.5 px-3 text-gray-700 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-all font-medium text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t">
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 text-sm">
                Book Your Trip Now
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;