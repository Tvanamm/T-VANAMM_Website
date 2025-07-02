
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const FranchiseTestimonials = () => {
  const testimonials = [
    {
      name: "Rajesh Kumar",
      location: "Mumbai",
      rating: 5,
      text: "TVANAMM franchise has been a game-changer for my business. The support team is exceptional, and the premium tea quality keeps customers coming back.",
      business: "Tea Garden Café"
    },
    {
      name: "Priya Sharma",
      location: "Delhi",
      rating: 5,
      text: "The training program was comprehensive, and the marketing support helped me establish my brand presence quickly. Highly recommend TVANAMM franchise.",
      business: "Aroma Tea House"
    },
    {
      name: "Amit Patel",
      location: "Bangalore",
      rating: 5,
      text: "From day one, TVANAMM provided excellent support. The business model is proven, and the profit margins are impressive. Best decision I made.",
      business: "Premium Tea Corner"
    }
  ];

  return (
    <section className="py-16 px-4 bg-emerald-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Franchise Partners Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from successful TVANAMM franchise owners about their journey 
            and experience with our brand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Quote className="h-8 w-8 text-emerald-600 opacity-50" />
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.business}</p>
                  <p className="text-sm text-emerald-600">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FranchiseTestimonials;
