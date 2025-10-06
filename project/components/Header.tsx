'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Star,
  Shield,
  User,
  LogOut,
  Settings,
  Calendar
} from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  const navItems = [
    { href: '/', label: 'Home' },
    {
      href: '/packages',
      label: 'Packages',
      badge: 'New'
    },
    { href: '/destinations', label: 'Destinations' },
    { href: '/gallery', label: 'Gallery' },
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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen && !(event.target as Element).closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

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
                  SafarSagaTrips
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
            <div className="hidden lg:flex items-center space-x-4">
              {!loading && (
                <>
                  {user ? (
                    <div className="relative user-menu">
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-gray-700 font-medium">{user.full_name}</span>
                      </button>
                      
                      {userMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                          <Link
                            href={user.is_admin ? "/admin" : "/dashboard"}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            {user.is_admin ? "Admin Dashboard" : "My Dashboard"}
                          </Link>
                          <Link
                            href="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Profile Settings
                          </Link>
                          <button
                            onClick={() => {
                              signOut();
                              setUserMenuOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Link href="/auth/login">
                        <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/auth/register">
                        <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2 lg:hidden">
              {!loading && user && (
                <Link href={user.is_admin ? "/admin" : "/dashboard"}>
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 text-xs rounded-lg"
                  >
                    {user.is_admin ? "Admin" : "Dashboard"}
                  </Button>
                </Link>
              )}
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

              {/* Mobile Contact Info & Auth */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-gray-700">
                      <User className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">{user.full_name}</span>
                    </div>
                    <Link
                      href={user.is_admin ? "/admin" : "/dashboard"}
                      className="flex items-center space-x-3 text-gray-600 hover:text-orange-500"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Calendar className="h-4 w-4 text-orange-500" />
                      <span>{user.is_admin ? "Admin Dashboard" : "My Dashboard"}</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 text-gray-600 hover:text-orange-500"
                    >
                      <LogOut className="h-4 w-4 text-orange-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/auth/login"
                      className="flex items-center justify-center w-full py-2 px-4 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="flex items-center justify-center w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 text-sm">
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
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;