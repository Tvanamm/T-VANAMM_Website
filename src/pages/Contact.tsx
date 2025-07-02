
import React from 'react';
import ModernNavbar from '@/components/ModernNavbar';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import StickyPaymentReminder from '@/components/franchise/StickyPaymentReminder';
import { useAuth } from '@/contexts/AuthContext';

const Contact = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <ModernNavbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h1>
            <p className="text-lg text-gray-600">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
          
          <ContactForm />
        </div>
      </div>
      
      <Footer />
      
      {/* Sticky Payment Reminder for Franchise Users */}
      {user?.role === 'franchise' && (
        <StickyPaymentReminder />
      )}
    </div>
  );
};

export default Contact;
