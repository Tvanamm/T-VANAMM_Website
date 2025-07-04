import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

import type { Variants } from "framer-motion";

const stepVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
};

const Franchise = () => {
  const { user } = useAuth();
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showCataloguePopup, setShowCataloguePopup] = useState(false);

  const steps = [
    { number: 1, title: 'Submit Enquiry', desc: 'Fill out our franchise enquiry form with your details and preferences' },
    { number: 2, title: 'Initial Discussion', desc: 'Our franchise team will contact you within 24 hours for a detailed discussion' },
    { number: 3, title: 'Location Approval', desc: "We'll help you select and approve the perfect location for your outlet" },
    { number: 4, title: 'Setup & Training', desc: 'Complete store setup with our guidance and comprehensive training program' },
    { number: 5, title: 'Agreement & Payment', desc: 'Sign the franchise agreement and complete the initial investment' },
    { number: 6, title: 'Grand Opening', desc: 'Launch your T Vanamm outlet with our marketing support and ongoing assistance' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <ModernNavbar />

      <FranchiseHero
        onStartJourney={() => setShowEnquiryModal(true)}
        onDownloadBrochure={() => setShowCataloguePopup(true)}
      />

      <FranchiseOpportunity />
      <FranchiseSupport />

      {/* Animated Franchise Process */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl font-bold text-center text-emerald-600 mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Franchise Process
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={step.number}
                variants={stepVariants}
                initial="hidden"
                whileInView="visible"
                animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.2, type: "spring", stiffness: 100 } }}
                viewport={{ once: true }}
                className="relative"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="rounded-lg bg-white shadow-lg transition-all duration-300 h-full"
                >
                  <div className="p-8 text-center">
                    <motion.div
                      className="bg-emerald-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.2 + 0.3, type: 'spring' }}
                    >
                      {step.number}
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>

                {/* Arrows */}
                {idx < steps.length - 1 && (
                  <React.Fragment key={`arrow-${step.number}`}>
                    {/* Desktop */}
                    <motion.div
                      className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.7 }}
                      transition={{ delay: idx * 0.2 + 0.5, duration: 0.5 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-emerald-600">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </motion.div>
                    {/* Mobile */}
                    <motion.svg
                      className="lg:hidden absolute top-full left-1/2 transform -translate-x-1/2 mt-4 z-10 h-6 w-6 text-emerald-600"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.7 }}
                      transition={{ delay: idx * 0.2 + 0.5, duration: 0.5 }}
                    >
                      <path d="M12 5v14" />
                      <path d="m19 12-7 7-7-7" />
                    </motion.svg>
                  </React.Fragment>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FranchiseTestimonials />
      <Footer />

      {/* Modals */}
      <FranchiseEnquiryModal isOpen={showEnquiryModal} onClose={() => setShowEnquiryModal(false)} />
      <CatalogueDownloadPopup isOpen={showCataloguePopup} onClose={() => setShowCataloguePopup(false)} />

      {/* Sticky Payment Reminder */}
      {user?.role === 'franchise' && <StickyPaymentReminder />}
    </div>
  );
};

export default Franchise;
