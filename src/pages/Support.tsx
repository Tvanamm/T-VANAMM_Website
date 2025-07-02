
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Clock, MessageCircle, HelpCircle, Users } from 'lucide-react';
import ModernNavbar from '@/components/ModernNavbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Support = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <ModernNavbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <Link to="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Customer Support</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We're here to help! Get in touch with our support team for any questions or assistance you need.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Phone Support */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-700">
                  <Phone className="h-6 w-6 mr-2" />
                  Phone Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-900">+91 9000008479</p>
                  <p className="text-lg font-semibold text-gray-900">+91 9390658544</p>
                  <p className="text-sm text-gray-600">Available 7:00 AM - 11:00 PM, Daily</p>
                </div>
                <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              </CardContent>
            </Card>

            {/* Email Support */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-700">
                  <Mail className="h-6 w-6 mr-2" />
                  Email Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gray-900 mb-2">info@tvanamm.com</p>
                <p className="text-sm text-gray-600 mb-4">We typically respond within 24 hours</p>
                <Button variant="outline" className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </CardContent>
            </Card>

            {/* Live Chat */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-700">
                  <MessageCircle className="h-6 w-6 mr-2" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Chat with our support team in real-time</p>
                <p className="text-xs text-gray-500 mb-4">Available during business hours</p>
                <Link to="/contact">
                  <Button variant="outline" className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Chat
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Location & Hours */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-700">
                  <MapPin className="h-6 w-6 mr-2" />
                  Visit Our Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Rama Rao Nagar Kukatpally – Jagathgiri Gutta Rd,<br />
                  Paparayadu Nagar, Kukatpally,<br />
                  Hyderabad, Telangana 500072
                </p>
                <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-700">
                  <Clock className="h-6 w-6 mr-2" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Monday - Sunday</span>
                    <span className="font-semibold text-gray-900">7:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Holidays</span>
                    <span className="font-semibold text-gray-900">Special Hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-emerald-700">
                <HelpCircle className="h-6 w-6 mr-2" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How do I apply for a franchise?</h3>
                  <p className="text-gray-600 text-sm">You can apply through our franchise form or download our master catalogue for detailed information.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What are your operating hours?</h3>
                  <p className="text-gray-600 text-sm">We're open 7:00 AM to 11:00 PM, seven days a week.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Do you offer bulk orders?</h3>
                  <p className="text-gray-600 text-sm">Yes, we provide bulk orders for events, offices, and special occasions.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How can I track my order?</h3>
                  <p className="text-gray-600 text-sm">You can track your order through our website or by contacting our support team.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Support;
