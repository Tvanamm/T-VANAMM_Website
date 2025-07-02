
import React from 'react';
import ModernNavbar from '@/components/ModernNavbar';
import Footer from '@/components/Footer';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <ModernNavbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
          
          <ForgotPasswordForm />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ForgotPassword;
