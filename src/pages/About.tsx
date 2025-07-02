
import React from 'react';
import ModernNavbar from '@/components/ModernNavbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/about/HeroSection';
import StorySection from '@/components/about/StorySection';
import VisionMissionSection from '@/components/about/VisionMissionSection';
import ValuesSection from '@/components/about/ValuesSection';
import FounderSection from '@/components/about/FounderSection';
import AchievementsSection from '@/components/about/AchievementsSection';
import StickyPaymentReminder from '@/components/franchise/StickyPaymentReminder';
import { useAuth } from '@/contexts/AuthContext';

const About = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <ModernNavbar />
      
      <HeroSection />
      <StorySection />
      <VisionMissionSection />
      <ValuesSection />
      <FounderSection />
      <AchievementsSection />
      
      <Footer />

      {/* Sticky Payment Reminder for Franchise Users */}
      {user?.role === 'franchise' && (
        <StickyPaymentReminder />
      )}
    </div>
  );
};

export default About;
