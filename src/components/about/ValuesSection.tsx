
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Leaf, Users, Award } from 'lucide-react';

const ValuesSection = () => {
  const values = [
    {
      icon: <Heart className="h-8 w-8 text-emerald-600" />,
      title: "Passion for Tea",
      description: "Every cup is brewed with love and dedication to perfection"
    },
    {
      icon: <Leaf className="h-8 w-8 text-emerald-600" />,
      title: "Sustainable Sourcing",
      description: "Direct trade with tea gardens ensuring quality and fair practices"
    },
    {
      icon: <Users className="h-8 w-8 text-emerald-600" />,
      title: "Wellness Revolution",
      description: "Transforming tea into a daily ritual for health and mindfulness"
    },
    {
      icon: <Award className="h-8 w-8 text-emerald-600" />,
      title: "Excellence",
      description: "Commitment to the highest standards in every aspect"
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 mb-6 px-4 py-2 text-sm font-medium">
            Our Values
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Principles That Guide Us</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
            Every decision we make is rooted in these core values that define who we are
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
