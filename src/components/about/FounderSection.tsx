
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Star } from 'lucide-react';

const FounderSection = () => {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 mb-6 px-4 py-2 text-sm font-medium">
            Leadership
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Meet Our Visionary</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
            The passionate leader driving T Vanamm's mission forward
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Founder Info - Left Side */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Mrs. N. Naga Jyothi</h3>
              <Badge variant="outline" className="mb-6 border-emerald-200 text-emerald-700 px-4 py-2">
                Founder & Visionary
              </Badge>
            </div>
            
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-lg">
                Mrs. N. Nagajyothi is the founder and visionary behind T Vanamm, a brand born out of her passion for reconnecting people with nature and promoting natural, healthy living. With a background in professional tea blending and herbal wellness, she brings both expertise and deep purpose to everything the brand creates.
              </p>
              
              <p>
                Her journey began with a simple yet powerful idea — to create products that are rooted in tradition but designed for the modern lifestyle. A lifelong admirer of India's rich tea heritage, she began by exploring the healing potential of traditional Indian chai and herbal infusions.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Tea Blending Expert</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Herbal Wellness</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Tradition Advocate</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Natural Living</span>
              </div>
            </div>
          </div>
          
          {/* Founder Image - Right Side */}
          <div className="relative">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-emerald-50 to-green-50 overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[4/5] bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                  <div className="w-32 h-32 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-4xl">NJ</span>
                  </div>
                </div>
                <div className="p-8 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  </div>
                  <p className="text-sm text-gray-600 italic">
                    "Creating products rooted in tradition, designed for modern wellness."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
