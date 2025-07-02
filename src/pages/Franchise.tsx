
import React, { useState } from 'react';
import ModernNavbar from '@/components/ModernNavbar';
import Footer from '@/components/Footer';
import FranchiseHero from '@/components/franchise/FranchiseHero';
import FranchiseOpportunity from '@/components/franchise/FranchiseOpportunity';
import FranchiseSupport from '@/components/franchise/FranchiseSupport';
import FranchiseTestimonials from '@/components/franchise/FranchiseTestimonials';
import StickyPaymentReminder from '@/components/franchise/StickyPaymentReminder';
import FranchiseEnquiryModal from '@/components/FranchiseEnquiryModal';
import CatalogueDownloadPopup from '@/components/CatalogueDownloadPopup';
import { useAuth } from '@/contexts/AuthContext';

const Franchise = () => {
  const { user } = useAuth();
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showCataloguePopup, setShowCataloguePopup] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <ModernNavbar />
      
      <FranchiseHero 
        onStartJourney={() => setShowEnquiryModal(true)}
        onDownloadBrochure={() => setShowCataloguePopup(true)}
      />
      <FranchiseOpportunity />
      <FranchiseSupport />
      <FranchiseTestimonials />
      
      <Footer />
      
      {/* Modals */}
      <FranchiseEnquiryModal 
        isOpen={showEnquiryModal} 
        onClose={() => setShowEnquiryModal(false)} 
      />
      
      <CatalogueDownloadPopup 
        isOpen={showCataloguePopup}
        onClose={() => setShowCataloguePopup(false)}
      />
      
      {/* Sticky Payment Reminder for Franchise Users */}
      {user?.role === 'franchise' && (
        <StickyPaymentReminder />
      )}
    </div>
  );
};

export default Franchise;
