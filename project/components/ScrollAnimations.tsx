'use client';

import { useEffect, useRef, useState } from 'react';

// Intersection Observer Hook for scroll animations
export const useInView = (threshold = 0.1) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return [ref, isInView] as const;
};

// Fade In Animation Component
export const FadeIn = ({ 
  children, 
  delay = 0, 
  direction = 'up',
  className = '' 
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}) => {
  const [ref, isInView] = useInView();

  const getTransform = () => {
    switch (direction) {
      case 'up': return 'translateY(50px)';
      case 'down': return 'translateY(-50px)';
      case 'left': return 'translateX(50px)';
      case 'right': return 'translateX(-50px)';
      default: return 'translateY(50px)';
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translate(0)' : getTransform(),
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

// Scale In Animation Component
export const ScaleIn = ({ 
  children, 
  delay = 0,
  className = '' 
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const [ref, isInView] = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'scale(1)' : 'scale(0.8)',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

// Stagger Animation for Lists
export const StaggerContainer = ({ 
  children, 
  staggerDelay = 100,
  className = '' 
}: {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}) => {
  const [ref, isInView] = useInView();

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <div
              key={index}
              className="transition-all duration-700 ease-out"
              style={{
                opacity: isInView ? 1 : 0,
                transform: isInView ? 'translateY(0)' : 'translateY(30px)',
                transitionDelay: `${index * staggerDelay}ms`
              }}
            >
              {child}
            </div>
          ))
        : children
      }
    </div>
  );
};

// Parallax Effect Component
export const Parallax = ({ 
  children, 
  speed = 0.5,
  className = '' 
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) => {
  const [offset, setOffset] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const rate = scrolled * -speed;
        setOffset(rate);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translateY(${offset}px)`
      }}
    >
      {children}
    </div>
  );
};

// Floating Animation Component
export const FloatingElement = ({ 
  children, 
  duration = 3000,
  className = '' 
}: {
  children: React.ReactNode;
  duration?: number;
  className?: string;
}) => {
  return (
    <div
      className={`animate-float ${className}`}
      style={{
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

// Smooth Scroll Hook
export const useSmoothScroll = () => {
  const scrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return scrollTo;
};