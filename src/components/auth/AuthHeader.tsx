
import React from 'react';
import { Coffee, Sparkles } from 'lucide-react';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  logoRotation?: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ 
  title, 
  subtitle, 
  logoRotation = "rotate-3" 
}) => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className={`p-4 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl shadow-lg transform ${logoRotation}`}>
            <Coffee className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
          </div>
        </div>
      </div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-3">
        {title}
      </h1>
      <p className="text-gray-600 text-lg">{subtitle}</p>
    </div>
  );
};

export default AuthHeader;
