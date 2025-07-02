
import React from 'react';
import ModernNavbar from '@/components/ModernNavbar';
import Footer from '@/components/Footer';
import { FranchiseCartProvider } from '@/contexts/FranchiseCartContext';
import FranchiseCartModal from '@/components/franchise/FranchiseCartModal';
import StickyPaymentReminder from '@/components/franchise/StickyPaymentReminder';
import { useAuth } from '@/contexts/AuthContext';

const Cart = () => {
  const { user } = useAuth();

  return (
    <FranchiseCartProvider>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <ModernNavbar />
        
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Your Cart
              </h1>
              <p className="text-lg text-gray-600">
                Review your items and proceed to checkout
              </p>
            </div>
            
            <FranchiseCartModal isOpen={true} onClose={() => {}} />
          </div>
        </div>
        
        <Footer />
        
        {/* Sticky Payment Reminder for Franchise Users */}
        {user?.role === 'franchise' && (
          <StickyPaymentReminder />
        )}
      </div>
    </FranchiseCartProvider>
  );
};

export default Cart;
