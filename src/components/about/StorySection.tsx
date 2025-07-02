
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Coffee, Star } from 'lucide-react';

const StorySection = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 mb-6 px-4 py-2 text-sm font-medium">
                Our Story
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                A Journey of Wellness Innovation
              </h2>
            </div>
            
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-lg">
                In <span className="font-semibold text-emerald-600">2021</span>, Mrs. N. Naga Jyothi founded 
                <span className="font-semibold text-gray-900"> T Vanamm</span>, turning her passion for tea into a 
                wellness revolution. Her innovative blends, from classic masala chai to tulsi, ashwagandha, 
                and ginger-lemon, reimagined tea as a daily ritual for health and mindfulness.
              </p>
              
              <p>
                Today, T Vanamm offers over <span className="font-semibold text-emerald-600">150 curated products</span>, 
                including herbal teas, immunity drinks, snacks, and natural ice creams, each reflecting her commitment 
                to purity and quality.
              </p>
              
              <p>
                Rooted in nature's healing power, every creation honors tradition while embracing modern tastes. 
                <span className="font-semibold text-gray-900"> T Vanamm is a celebration of wellness</span>, crafting 
                moments of clarity and comfort in every sip.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">100% Organic Ingredients</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Traditional Recipes</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Sustainable Practices</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Quality Assured</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50 p-8">
              <CardContent className="p-0 text-center">
                <div className="w-24 h-24 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Coffee className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Since 2021</h3>
                <p className="text-gray-600 mb-6">
                  Pioneering wellness through premium tea blends with a commitment to quality and tradition.
                </p>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="font-semibold text-gray-900">4.9/5 Customer Rating</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
