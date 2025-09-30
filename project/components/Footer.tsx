import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';

const Footer = () => {
  const galleryImages = [
    'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
    'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
    'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop'
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Section */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">▶</span>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">▶</span>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">▶</span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">▶</span>
                  Terms & Condition
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">▶</span>
                  FAQs & Help
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                <div className="text-gray-400 text-sm leading-relaxed">
                  Shop no 3 basement, Plot no 1,Tajpur Rd, Badarpur Extension,Tajpur, badarpur border, NewDelhi, Delhi 110044
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                <a
                  href="tel:+919311706027"
                  className="text-gray-400 text-sm hover:text-white transition-colors"
                >
                  +91 9311706027
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                <a
                  href="mailto:safarsagatrips@gmail.com"
                  className="text-gray-400 text-sm hover:text-white transition-colors"
                >
                  safarsagatrips@gmail.com
                </a>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex space-x-3 mt-6">
              <Link
                href="https://www.instagram.com/safarsagatrips?utm_source=ig_web_button_share_sheet&igsh=ZTk5eXVtaHd4bDI="
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-700 h-10 w-10 rounded-full bg-gray-800">
                  <Instagram className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-700 h-10 w-10 rounded-full bg-gray-800">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-700 h-10 w-10 rounded-full bg-gray-800">
                <Youtube className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-700 h-10 w-10 rounded-full bg-gray-800">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Gallery Section */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Gallery</h3>
            <div className="grid grid-cols-3 gap-2">
              {galleryImages.map((image, index) => (
                <div key={index} className="relative group cursor-pointer">
                  <img
                    src={image}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-16 object-cover rounded transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Get Every Monthly Newsletter
            </p>
            <div className="flex">
              <Input
                placeholder="Your email"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-r-none focus:ring-0 focus:border-gray-600"
              />
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-4 rounded-l-none">
                Signup
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © Copyright 2025 by SafarSaga. All Right Reserved. Designed By SafarSaga Team
            </p>
            <p className="text-gray-400 text-sm">
              Created by Ambikesh Jha
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;