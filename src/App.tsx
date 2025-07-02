
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from '@/contexts/AuthContext';
import { FranchiseCartProvider } from '@/contexts/FranchiseCartContext';
import SitemapGenerator from '@/components/seo/sitemapGenerator';
import Index from '@/pages/Index';
import LoginPage from '@/pages/Login';
import SignupPage from '@/pages/Signup';
import OwnerDashboard from '@/pages/OwnerDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import FranchiseDashboard from '@/pages/FranchiseDashboard';
import About from '@/pages/About';
import Franchise from '@/pages/Franchise';
import Order from '@/pages/Order';
import Payment from '@/pages/Payment';
import PaymentSuccess from '@/pages/PaymentSuccess';
import EnhancedCheckoutPage from '@/components/franchise/EnhancedCheckoutPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FranchiseCartProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <SitemapGenerator />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/owner-dashboard" element={<OwnerDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/franchise-dashboard" element={<FranchiseDashboard />} />
                <Route path="/about" element={<About />} />
                <Route path="/franchise" element={<Franchise />} />
                <Route path="/order" element={<Order />} />
                <Route path="/franchise-inventory" element={<Order />} />
                <Route path="/franchise-checkout" element={<EnhancedCheckoutPage />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/success" element={<PaymentSuccess />} />
              </Routes>
              <Toaster />
              <Sonner />
            </div>
          </Router>
        </FranchiseCartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
