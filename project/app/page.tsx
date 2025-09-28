import HeroSection from '@/components/HeroSection';
import TrustIndicators from '@/components/TrustIndicators';
import PopularDestinations from '@/components/PopularDestinations';
import Gallery from '@/components/Gallery';
import UpcomingTrips from '@/components/UpcomingTrips';
import WhyChooseUs from '@/components/WhyChooseUs';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import CTASection from '@/components/CTASection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustIndicators />
      <PopularDestinations />
      <Gallery />
      <UpcomingTrips />
      <WhyChooseUs />
      <Testimonials />
      <FAQ />
      <CTASection />
    </>
  );
}