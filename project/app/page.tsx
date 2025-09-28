'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FadeIn, ScaleIn } from '@/components/ScrollAnimations';
import UrgencyBanner from '@/components/UrgencyBanner';
import HeroSection from '@/components/HeroSection';
import TrustIndicators from '@/components/TrustIndicators';
import PopularDestinations from '@/components/PopularDestinations';
import SpecialOffers from '@/components/SpecialOffers';
import PriceComparison from '@/components/PriceComparison';
import VideoTestimonials from '@/components/VideoTestimonials';
import WhyChooseUs from '@/components/WhyChooseUs';
import FAQ from '@/components/FAQ';
import CTASection from '@/components/CTASection';
import SocialProof from '@/components/SocialProof';

// Dynamically import LoadingScreen to prevent SSR issues
const LoadingScreen = dynamic(() => import('@/components/LoadingScreen'), {
  ssr: false,
});

export default function Home() {
  const [showContent, setShowContent] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLoadingComplete = () => {
    setShowContent(true);
  };

  // Show loading screen only after component mounts
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-purple-600" />
    );
  }

  if (!showContent) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <>
      <UrgencyBanner />
      <HeroSection />
      <FadeIn delay={100}>
        <TrustIndicators />
      </FadeIn>
      <FadeIn delay={200}>
        <PopularDestinations />
      </FadeIn>
      <ScaleIn delay={300}>
        <SpecialOffers />
      </ScaleIn>
      <FadeIn delay={400}>
        <PriceComparison />
      </FadeIn>
      <FadeIn delay={500}>
        <VideoTestimonials />
      </FadeIn>
      <ScaleIn delay={600}>
        <WhyChooseUs />
      </ScaleIn>
      <FadeIn delay={700}>
        <FAQ />
      </FadeIn>
      <FadeIn delay={800}>
        <CTASection />
      </FadeIn>
      <SocialProof />
    </>
  );
}