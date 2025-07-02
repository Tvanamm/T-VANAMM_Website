
import React from 'react';
import { Badge } from '@/components/ui/badge';

const HeroSection = () => {
  return (
    <section className="pt-24 pb-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto text-center">
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 mb-6 px-4 py-2 text-sm font-medium">
          About T Vanamm
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Crafting Wellness Through
          <span className="text-emerald-600 block">Premium Tea</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
          From Mrs. N. Naga Jyothi's passionate vision to a wellness revolution, 
          we've been transforming tea into daily rituals for health and mindfulness since 2021.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
