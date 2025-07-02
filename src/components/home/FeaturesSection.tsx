
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, Shield, Clock, Award } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'Free delivery on orders above ₹999'
    },
    {
      icon: Shield,
      title: 'Quality Guarantee',
      description: '100% satisfaction or money back'
    },
    {
      icon: Clock,
      title: 'Fast Delivery',
      description: 'Same day delivery in select cities'
    },
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'Award-winning tea selections'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
          <p className="text-lg text-gray-600">Experience the difference with our premium service</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
