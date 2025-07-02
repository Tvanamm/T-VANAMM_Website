
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Users } from 'lucide-react';
import ModernNavbar from '@/components/ModernNavbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <ModernNavbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600 text-lg">Last updated: January 2025</p>
          </div>

          {/* Introduction */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-6 w-6 text-emerald-600 mr-2" />
                Our Commitment to Your Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                At Tvanamm, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, and safeguard your data when you use our services.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-6 w-6 text-emerald-600 mr-2" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Name, email address, and phone number</li>
                  <li>Location and address information</li>
                  <li>Franchise inquiry details</li>
                  <li>Order and payment information</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Usage Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Website usage patterns and preferences</li>
                  <li>Device information and IP address</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 text-emerald-600 mr-2" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>To process franchise inquiries and applications</li>
                <li>To fulfill orders and provide customer support</li>
                <li>To send important updates about our services</li>
                <li>To improve our website and user experience</li>
                <li>To comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-6 w-6 text-emerald-600 mr-2" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. We use industry-standard encryption 
                and secure servers to safeguard your data.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Your Rights</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                You have the right to access, update, or delete your personal information. You may also opt-out of 
                marketing communications at any time. To exercise these rights, please contact us using the information below.
              </p>
              <h3 className="font-semibold text-gray-900 mb-4">Contact Us</h3>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                Email: info@tvanamm.com
                <br />
                Phone: +91 9000008479
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
