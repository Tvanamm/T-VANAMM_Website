
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Users, Trophy, Coffee, Sparkles, Play, CheckCircle, Award, MapPin, TrendingUp, X, Download, FileText, Package, Award as AwardIcon, Shield, CheckCircle2, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import ModernNavbar from '@/components/ModernNavbar';
import Footer from '@/components/Footer';
import FranchiseEnquiryModal from '@/components/FranchiseEnquiryModal';
import CatalogueDownloadPopup from '@/components/CatalogueDownloadPopup';
import StickyPaymentReminder from '@/components/franchise/StickyPaymentReminder';
import TopPicksCarousel from '@/components/home/TopPicksCarousel';
import CountingNumber from '@/components/CountingNumber';
import FranchiseForm from '@/components/FranchiseForm';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedHeroCarousel from '@/components/home/AnimatedHeroCarousel';

const Index = () => {
  const { user } = useAuth();
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showCataloguePopup, setShowCataloguePopup] = useState(false);

  // Show popup automatically after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCataloguePopup(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleDownloadCatalogue = () => {
    setShowCataloguePopup(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <ModernNavbar />
      
      {/* Hero Section */}
      <AnimatedHeroCarousel/>

      {/* Top Picks Carousel */}
      <TopPicksCarousel />

      {/* Key Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Why Choose T VANAMM?
            </h2>
            <p className="text-gray-600">
              We are committed to providing an exceptional tea experience, from sourcing to serving.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <Star 
                className="h-10 w-10 mx-auto mb-4" 
                style={{ color: 'rgb(0, 100, 55)' }} 
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Premium Quality
              </h3>
              <p className="text-gray-700">
                Sourced from the finest tea gardens around the world.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <Users 
                className="h-10 w-10 mx-auto mb-4" 
                style={{ color: 'rgb(0, 100, 55)' }} 
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Expert Blends
              </h3>
              <p className="text-gray-700">
                Crafted by experienced tea masters for a unique taste.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <Trophy 
                className="h-10 w-10 mx-auto mb-4" 
                style={{ color: 'rgb(0, 100, 55)' }} 
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Award-Winning
              </h3>
              <p className="text-gray-700">
                Recognized for excellence in tea quality and innovation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Download Master Catalogue Section */}
      <section className="py-16 bg-gradient-to-br from-teal-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Column - Content */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  Free Download
                </Badge>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Download Our Master Catalogue
              </h2>
              
              <p className="text-lg text-gray-700 mb-6">
                Get instant access to our comprehensive tea collection featuring over 500+ premium varieties, 
                wholesale pricing, and detailed product specifications. Perfect for retailers, distributors, and tea enthusiasts.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-gray-900">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mr-3" />
                  <span className="font-medium">500+ Premium Tea Varieties</span>
                </div>
                <div className="flex items-center text-gray-900">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mr-3" />
                  <span className="font-medium">Wholesale Pricing & Bulk Discounts</span>
                </div>
                <div className="flex items-center text-gray-900">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mr-3" />
                  <span className="font-medium">Complete Product Specifications</span>
                </div>
                <div className="flex items-center text-gray-900">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mr-3" />
                  <span className="font-medium">Packaging & Shipping Information</span>
                </div>
              </div>

              <Button 
                onClick={handleDownloadCatalogue}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Catalogue Now
              </Button>
              
              <p className="text-sm text-gray-600 mt-3">
                * No registration required. Instant PDF download.
              </p>
            </div>

            {/* Right Column - Image */}
            <div className="relative">
              <div className="bg-white p-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300">
                <img
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&h=600&fit=crop"
                  alt="Master Tea Catalogue Preview"
                  className="rounded-xl w-full object-cover aspect-[4/5]"
                />
                <div className="absolute top-8 right-8 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  500+ Products
                </div>
                <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-gray-900">Premium Collection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600">
              Real stories from tea lovers who have experienced the T VANAMM difference.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="p-6 bg-gray-50 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <Coffee className="h-6 w-6 text-emerald-600 mr-2" />
                <h4 className="text-lg font-semibold text-gray-900">
                  Exceptional Tea
                </h4>
              </div>
              <p className="text-gray-700">
                "The quality of tea is unmatched. I enjoy every sip!"
              </p>
              <div className="mt-4 flex items-center">
                <Sparkles className="h-5 w-5 text-yellow-500 mr-1" />
                <Sparkles className="h-5 w-5 text-yellow-500 mr-1" />
                <Sparkles className="h-5 w-5 text-yellow-500 mr-1" />
                <Sparkles className="h-5 w-5 text-yellow-500 mr-1" />
                <Sparkles className="h-5 w-5 text-yellow-500 mr-1" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                - Jane Doe, Tea Enthusiast
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="p-6 bg-gray-50 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <Award className="h-6 w-6 text-teal-600 mr-2" />
                <h4 className="text-lg font-semibold text-gray-900">
                  Great Service
                </h4>
              </div>
              <p className="text-gray-700">
                "The staff is knowledgeable and always ready to help."
              </p>
              <div className="mt-4 flex items-center">
                <Sparkles className="h-5 w-5 text-yellow-500 mr-1" />
                <Sparkles className="h-5 w-5 text-yellow-500 mr-1" />
                <Sparkles className="h-5 w-5 text-yellow-500 mr-1" />
                <Sparkles className="h-5 w-5 text-yellow-500 mr-1" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                - Alex Smith, Loyal Customer
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="p-6 bg-gray-50 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 text-emerald-600 mr-2" />
                <h4 className="text-lg font-semibold text-gray-900">
                  Cozy Atmosphere
                </h4>
              </div>
              <p className="text-gray-700">
                "The tea room is a perfect place to relax and enjoy a cup."
              </p>
              <div className="mt-4 flex items-center">
                <Sparkles className="h-5 w-5 text-yellow-500 mr-1" />
                <Sparkles className="h-5 w-5 text-yellow-500 mr-1" />
                <Sparkles className="h-5 w-5 text-yellow-500 mr-1" />
                <Sparkles className="h-5 w-5 text-yellow-500 mr-1" />
                <Sparkles className="h-5 w-5 text-yellow-500 mr-1" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                - Emily Johnson, Regular Visitor
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Our Growing Impact
            </h2>
            <p className="text-gray-600">
              We are proud to share our achievements and milestones.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Stat 1 */}
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <TrendingUp 
                className="h-10 w-10 mx-auto mb-4" 
                style={{ color: 'rgb(0, 100, 55)' }} 
              />
              <div className="text-4xl font-bold text-gray-900">
                <CountingNumber target={500} />+
              </div>
              <p className="text-gray-700">
                Tea Varieties
              </p>
            </div>

            {/* Stat 2 */}
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <Users 
                className="h-10 w-10 mx-auto mb-4" 
                style={{ color: 'rgb(0, 100, 55)' }} 
              />
              <div className="text-4xl font-bold text-gray-900">
                <CountingNumber target={10000} />+
              </div>
              <p className="text-gray-700">
                Happy Customers
              </p>
            </div>

            {/* Stat 3 */}
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <MapPin 
                className="h-10 w-10 mx-auto mb-4" 
                style={{ color: 'rgb(0, 100, 55)' }} 
              />
              <div className="text-4xl font-bold text-gray-900">
                <CountingNumber target={50} />+
              </div>
              <p className="text-gray-700">
                Locations Worldwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Franchise CTA */}
      <section 
        className="py-20 text-white"
        style={{ backgroundColor: 'rgb(0, 100, 55)' }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Join the Tvanamm Family
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Start your entrepreneurial journey with India's fastest-growing tea franchise
          </p>
          <Link to="/franchise">
            <Button 
              size="lg" 
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300" 
              style={{ color: 'rgb(0, 100, 55)' }}
            >
              Explore Franchise
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Franchise Form */}
      <FranchiseForm />

      {/* MSME Certification & Business Loan Support */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Trusted Business Partner
              </h2>
              <p className="text-gray-600">
                We support our franchise partners with certifications and financial assistance
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* MSME Certification */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-600 rounded-lg">
                    <AwardIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">MSME Certified</h3>
                    <p className="text-sm text-emerald-600">Government Recognized</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  T VANAMM is officially certified under the Micro, Small & Medium Enterprises 
                  (MSME) scheme by the Government of India, ensuring credibility and trust.
                </p>
                <div className="flex items-center text-emerald-700 text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  <span>Verified Business Registration</span>
                </div>
              </div>

              {/* Business Loan Support */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Business Loan Support</h3>
                    <p className="text-sm text-blue-600">Financial Assistance</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  We actively encourage and support our franchise partners in securing business 
                  loans through our network of partner banks and financial institutions.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-blue-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    <span>Bank Partnership Network</span>
                  </div>
                  <div className="flex items-center text-blue-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    <span>Loan Application Support</span>
                  </div>
                  <div className="flex items-center text-blue-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    <span>Documentation Assistance</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                Our MSME certification and business loan support network make T VANAMM 
                a reliable and trustworthy franchise opportunity for aspiring entrepreneurs.
              </p>
            </div>
          </div>
        </div>
      </section>     

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

export default Index;
