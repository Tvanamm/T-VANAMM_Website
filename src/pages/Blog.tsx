
import React from 'react';
import ModernNavbar from '@/components/ModernNavbar';
import Footer from '@/components/Footer';
import StickyPaymentReminder from '@/components/franchise/StickyPaymentReminder';
import { useAuth } from '@/contexts/AuthContext';

const Blog = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <ModernNavbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Tea Stories & Insights
            </h1>
            <p className="text-lg text-gray-600">
              Discover the world of premium tea through our curated articles
            </p>
          </div>
          
          <div className="grid gap-8">
            {/* Blog posts would go here */}
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Coming Soon
              </h2>
              <p className="text-gray-600">
                We're preparing amazing content about tea culture, brewing techniques, and more.
              </p>
            </div>
          </div>
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

export default Blog;
