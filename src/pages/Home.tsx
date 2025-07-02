
import React from 'react';
import ModernNavbar from '@/components/ModernNavbar';
import HeroSection from '@/components/home/HeroSection';
import TopPicksCarousel from '@/components/home/TopPicksCarousel';
import FeaturesSection from '@/components/home/FeaturesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import Footer from '@/components/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <ModernNavbar />
      <HeroSection />
      <TopPicksCarousel />
      <FeaturesSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default Home;
