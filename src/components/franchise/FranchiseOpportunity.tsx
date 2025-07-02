
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Store, 
  TrendingUp, 
  Users, 
  Award,
  Shield,
  Headphones
} from 'lucide-react';

const FranchiseOpportunity = () => {
  const opportunities = [
    {
      icon: Store,
      title: "Low Investment",
      description: "Start your tea business with minimal initial investment and maximum returns.",
      color: "emerald"
    },
    {
      icon: TrendingUp,
      title: "Proven Business Model",
      description: "Join a successful franchise system with established market presence.",
      color: "blue"
    },
    {
      icon: Users,
      title: "Growing Market",
      description: "Tap into India's expanding premium tea market worth ₹50,000+ crores.",
      color: "purple"
    },
    {
      icon: Award,
      title: "Premium Brand",
      description: "Partner with an award-winning tea brand trusted by thousands.",
      color: "orange"
    },
    {
      icon: Shield,
      title: "Territory Protection",
      description: "Enjoy exclusive territorial rights in your designated area.",
      color: "red"
    },
    {
      icon: Headphones,
      title: "Ongoing Support",
      description: "Get continuous training, marketing, and operational support.",
      color: "teal"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      emerald: "bg-emerald-100 text-emerald-600",
      blue: "bg-blue-100 text-blue-600",
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600",
      red: "bg-red-100 text-red-600",
      teal: "bg-teal-100 text-teal-600"
    };
    return colors[color as keyof typeof colors] || "bg-gray-100 text-gray-600";
  };

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose TVANAMM Franchise?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the advantages of partnering with India's leading premium tea brand
            and build a sustainable, profitable business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {opportunities.map((opportunity, index) => {
            const IconComponent = opportunity.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-full ${getColorClasses(opportunity.color)}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {opportunity.title}
                      </h3>
                      <p className="text-gray-600">
                        {opportunity.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FranchiseOpportunity;
