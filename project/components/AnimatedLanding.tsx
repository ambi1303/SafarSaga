'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Plane, MapPin, Camera, Compass } from 'lucide-react';

const AnimatedLanding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const destinations = [
    {
      name: 'Santorini, Greece',
      image: 'https://images.pexels.com/photos/161815/santorini-oia-greece-water-161815.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      description: 'Breathtaking sunsets and white-washed villages'
    },
    {
      name: 'Bali, Indonesia',
      image: 'https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      description: 'Tropical paradise with ancient temples'
    },
    {
      name: 'Machu Picchu, Peru',
      image: 'https://images.pexels.com/photos/259967/pexels-photo-259967.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      description: 'Ancient wonder in the clouds'
    },
    {
      name: 'Tokyo, Japan',
      image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      description: 'Where tradition meets innovation'
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % destinations.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToContent = () => {
    const element = document.getElementById('main-content');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Animated Background Slideshow */}
      <div className="absolute inset-0">
        {destinations.map((dest, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-2000 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-110'
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url("${dest.image}")` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
          </div>
        ))}
      </div>

      {/* Floating Elements Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Planes */}
        <div className="animate-float-plane-1">
          <Plane className="absolute top-20 left-10 h-8 w-8 text-white/30 transform rotate-45" />
        </div>
        <div className="animate-float-plane-2">
          <Plane className="absolute top-40 right-20 h-6 w-6 text-white/20 transform -rotate-12" />
        </div>
        
        {/* Floating Icons */}
        <div className="animate-float-icon-1">
          <Camera className="absolute top-60 left-1/4 h-5 w-5 text-white/25" />
        </div>
        <div className="animate-float-icon-2">
          <Compass className="absolute bottom-40 right-1/3 h-6 w-6 text-white/30" />
        </div>
        <div className="animate-float-icon-3">
          <MapPin className="absolute top-1/3 right-10 h-5 w-5 text-white/20" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-6xl">
          {/* Logo Animation */}
          <div className={`mb-8 transform transition-all duration-1500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="inline-block p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <img 
                src="/logo.png.png" 
                alt="SafarSaga" 
                className="h-20 w-auto mx-auto drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Main Heading with Typewriter Effect */}
          <div className={`mb-6 transform transition-all duration-2000 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-white via-orange-200 to-white bg-clip-text text-transparent animate-gradient-x">
              SafarSaga
            </h1>
            <div className="text-2xl md:text-4xl font-light mb-4 animate-typewriter">
              Every Journey Has A Story
            </div>
          </div>

          {/* Destination Info */}
          <div className={`mb-8 transform transition-all duration-2000 delay-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="inline-block bg-white/15 backdrop-blur-md rounded-full px-8 py-4 border border-white/30">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-orange-300" />
                <span className="text-lg font-medium">
                  {destinations[currentSlide].name}
                </span>
              </div>
              <p className="text-sm text-white/80 mt-1">
                {destinations[currentSlide].description}
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className={`mb-12 transform transition-all duration-2000 delay-1500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="cta-button text-lg px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-2xl"
                onClick={scrollToContent}
              >
                🚀 Start Your Adventure
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 transform hover:scale-105 transition-all duration-300"
                onClick={scrollToContent}
              >
                ✨ Explore Destinations
              </Button>
            </div>
          </div>

          {/* Stats Animation */}
          <div className={`mb-8 transform transition-all duration-2000 delay-2000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-300 animate-count-up">50K+</div>
                <div className="text-sm text-white/80">Happy Travelers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-300 animate-count-up">150+</div>
                <div className="text-sm text-white/80">Destinations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-300 animate-count-up">4.9★</div>
                <div className="text-sm text-white/80">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer" onClick={scrollToContent}>
        <div className="flex flex-col items-center text-white/80 hover:text-white transition-colors">
          <span className="text-sm mb-2">Discover More</span>
          <ChevronDown className="h-6 w-6 animate-pulse" />
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {destinations.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>

      {/* Particle Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="particles-container">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimatedLanding;