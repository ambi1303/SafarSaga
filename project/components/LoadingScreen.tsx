'use client';

import { useEffect, useState } from 'react';
import { Plane, MapPin, Camera, Compass, Mountain, Palmtree, Star, Globe } from 'lucide-react';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentDestination, setCurrentDestination] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  const destinations = [
    'Crafting Your Perfect Journey...',
    'Discovering Hidden Gems...',
    'Planning Unforgettable Adventures...',
    'Finding Exclusive Deals...',
    'Preparing Amazing Experiences...',
    'Welcome to SafarSaga!'
  ];

  const travelIcons = [
    { Icon: Plane, delay: '0s', position: 'top-20 left-20' },
    { Icon: MapPin, delay: '0.5s', position: 'top-32 right-24' },
    { Icon: Camera, delay: '1s', position: 'bottom-32 left-16' },
    { Icon: Compass, delay: '1.5s', position: 'bottom-20 right-20' },
    { Icon: Mountain, delay: '2s', position: 'top-40 left-1/2' },
    { Icon: Palmtree, delay: '2.5s', position: 'bottom-40 right-1/3' }
  ];

  useEffect(() => {
    // Progress animation over 5 seconds
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2; // Increment by 2% every 100ms = 5 seconds total
      });
    }, 100);

    // Destination text changes
    const destinationInterval = setInterval(() => {
      setCurrentDestination(prev => (prev + 1) % destinations.length);
    }, 800);

    // Show welcome message at 80% progress
    const welcomeTimeout = setTimeout(() => {
      setShowWelcome(true);
    }, 4000);

    // Complete loading after 5 seconds
    const completeTimeout = setTimeout(() => {
      onLoadingComplete();
    }, 5000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(destinationInterval);
      clearTimeout(welcomeTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onLoadingComplete]);



  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-sky-400 via-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Clouds */}
        <div className="absolute top-10 left-0 w-32 h-16 bg-white/20 rounded-full animate-float-slow"></div>
        <div className="absolute top-32 right-0 w-24 h-12 bg-white/15 rounded-full animate-float-medium"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-20 bg-white/10 rounded-full animate-float-fast"></div>
        
        {/* Travel Icons Floating Around */}
        {travelIcons.map(({ Icon, delay, position }, index) => (
          <div
            key={index}
            className={`absolute ${position} text-white/30 animate-float-icon`}
            style={{ animationDelay: delay }}
          >
            <Icon className="h-8 w-8" />
          </div>
        ))}
      </div>

      {/* Main Loading Content */}
      <div className="relative z-10 text-center text-white">
        {/* Rotating Globe/Compass */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto relative">
            {/* Outer Ring */}
            <div className="absolute inset-0 border-4 border-white/30 rounded-full animate-spin-slow"></div>
            
            {/* Inner Globe */}
            <div className="absolute inset-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <Compass className="h-8 w-8 text-white animate-spin" />
              </div>
            </div>
            
            {/* Orbiting Plane */}
            <div className="absolute inset-0 animate-orbit">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <Plane className="h-6 w-6 text-orange-300 rotate-45" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="h-8 w-8 text-orange-400 animate-spin" />
            <h2 className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              SafarSaga
            </h2>
            <Star className="h-6 w-6 text-yellow-400 animate-pulse" />
          </div>
          
          <p className="text-2xl font-semibold text-orange-300 mb-2">
            Every Journey Has A Story
          </p>
          
          <p className="text-xl text-white/90 mb-4 h-8 flex items-center justify-center">
            <span className="animate-fade-in-out" key={currentDestination}>
              {destinations[currentDestination]}
            </span>
          </p>

          {showWelcome && (
            <div className="animate-bounce-in">
              <p className="text-lg text-yellow-300 font-semibold">
                🎉 Get Ready for Amazing Adventures!
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-80 mx-auto mb-6">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-400 to-pink-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-white/80 mt-2">
            {Math.round(Math.min(progress, 100))}% Complete
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      {/* Bottom Wave Animation */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" className="w-full h-24 text-white/10">
          <path
            d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"
            fill="currentColor"
            className="animate-wave"
          />
        </svg>
      </div>
    </div>
  );
};

export default LoadingScreen;