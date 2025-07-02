
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Users, 
  Megaphone, 
  Wrench,
  ShoppingBag,
  BarChart3
} from 'lucide-react';

const FranchiseSupport = () => {
  const supportServices = [
    {
      icon: BookOpen,
      title: "Training & Education",
      description: "Comprehensive training programs covering tea knowledge, business operations, and customer service."
    },
    {
      icon: Users,
      title: "Staff Training",
      description: "Professional training for your team to ensure consistent service quality and brand standards."
    },
    {
      icon: Megaphone,
      title: "Marketing Support",
      description: "National and local marketing campaigns, promotional materials, and digital marketing assistance."
    },
    {
      icon: Wrench,
      title: "Operational Support",
      description: "Ongoing assistance with daily operations, inventory management, and quality control."
    },
    {
      icon: ShoppingBag,
      title: "Supply Chain",
      description: "Direct access to premium tea products with competitive pricing and reliable delivery."
    },
    {
      icon: BarChart3,
      title: "Business Analytics",
      description: "Performance tracking tools and business insights to optimize your operations and growth."
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Comprehensive Franchise Support
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We provide end-to-end support to ensure your franchise success, 
            from initial setup to ongoing operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {supportServices.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <IconComponent className="h-6 w-6 text-emerald-600" />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FranchiseSupport;
