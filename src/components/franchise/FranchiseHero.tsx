
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, TrendingUp, Award, Download } from 'lucide-react';

interface FranchiseHeroProps {
  onStartJourney: () => void;
  onDownloadBrochure: () => void;
}

const FranchiseHero: React.FC<FranchiseHeroProps> = ({ onStartJourney, onDownloadBrochure }) => {
  return (
    <section className="pt-24 pb-16 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Join the
                <span className="text-emerald-600"> TVANAMM </span>
                Franchise Family
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Partner with India's premium tea brand and build a profitable business 
                while sharing the finest tea experiences with your community.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-2">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">Partners</div>
              </div>
              <div className="text-center">
                <div className="p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-2">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">₹2L+</div>
                <div className="text-sm text-gray-600">Avg Monthly</div>
              </div>
              <div className="text-center">
                <div className="p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-2">
                  <Award className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">15+</div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                onClick={onStartJourney}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={onDownloadBrochure}
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-4"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Brochure
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl p-8 shadow-2xl">
              <div className="h-full bg-white rounded-2xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🫖</div>
                  <h3 className="text-2xl font-bold text-gray-900">Premium Tea Business</h3>
                  <p className="text-gray-600">Start your entrepreneurial journey with TVANAMM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FranchiseHero;
