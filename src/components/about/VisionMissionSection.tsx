
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Compass } from 'lucide-react';

const VisionMissionSection = () => {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 mb-6 px-4 py-2 text-sm font-medium">
            Our Purpose
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Vision & Mission</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
            Guiding principles that drive our commitment to excellence and growth
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Vision Card */}
          <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
            <CardContent className="p-10">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mr-4">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg">
                At T Vanamm, our vision is to become a household name across India for quality and taste in tea, juice, snacks, and ice cream. We aim to build a brand that brings people together, creating memorable moments with every visit. Through consistent innovation, exceptional service, and a strong franchise network, we aspire to reach every corner of the country with freshness, flavor, and warmth.
              </p>
            </CardContent>
          </Card>

          {/* Mission Card */}
          <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
            <CardContent className="p-10">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mr-4">
                  <Compass className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg">
                Our mission is to serve high-quality, hygienic, and affordable beverages and snacks that delight our customers every day. We are committed to maintaining excellence in taste, customer experience, and operational standards across all our outlets. By empowering entrepreneurs through our franchise model, we strive to create lasting value and build a strong, trusted brand in the food and beverage industry.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default VisionMissionSection;
