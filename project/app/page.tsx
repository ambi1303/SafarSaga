import HeroSection from '@/components/HeroSection';
import PopularDestinations from '@/components/PopularDestinations';
import SpecialOffers from '@/components/SpecialOffers';
import WhyChooseUs from '@/components/WhyChooseUs';
import Testimonials from '@/components/Testimonials';
import CTASection from '@/components/CTASection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <PopularDestinations />
      <SpecialOffers />
      <WhyChooseUs />
      <Testimonials />
      <CTASection />
    </>
  );
}