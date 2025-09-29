import HeroSection from '@/components/HeroSection';
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