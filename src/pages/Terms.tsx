
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import ModernNavbar from '@/components/ModernNavbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Terms = () => {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-600 text-lg">Last updated: January 2025</p>
          </div>

          {/* Introduction */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-6 w-6 text-emerald-600 mr-2" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using Tvanamm's services, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services.
              </p>
            </CardContent>
          </Card>

          {/* Use of Services */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-6 w-6 text-emerald-600 mr-2" />
                Use of Our Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Permitted Uses</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Browsing our website and services</li>
                  <li>Placing orders for our products</li>
                  <li>Applying for franchise opportunities</li>
                  <li>Contacting us for legitimate business purposes</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Account Responsibilities</h3>
                <p className="text-gray-600">
                  You are responsible for maintaining the confidentiality of your account information and 
                  for all activities that occur under your account.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Prohibited Activities */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <XCircle className="h-6 w-6 text-red-600 mr-2" />
                Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Using our services for any unlawful purpose</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Interfering with the proper functioning of our website</li>
                <li>Impersonating any person or entity</li>
                <li>Submitting false or misleading information</li>
              </ul>
            </CardContent>
          </Card>

          {/* Franchise Terms */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Franchise Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed mb-4">
                Franchise opportunities are subject to separate franchise agreements. The information provided 
                on our website is for informational purposes only and does not constitute an offer to sell a franchise.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Franchise availability may vary by location and is subject to qualification requirements and approval.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-6 w-6 text-amber-600 mr-2" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Tvanamm shall not be liable for any indirect, incidental, special, or consequential damages 
                arising from your use of our services. Our total liability shall not exceed the amount paid 
                by you for the specific service giving rise to the claim.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Us</h3>
              <p className="text-gray-600">
                If you have any questions about these Terms of Service, please contact us at:
                <br />
                Email: info@tvanamm.com
                <br />
                Phone: +91 9000008479
                <br />
                Address: Kukatpally, Hyderabad, Telangana 500072
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
