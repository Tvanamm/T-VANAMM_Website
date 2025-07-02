
import React from 'react';
import { Loader, Coffee } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'coffee' | 'dots';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'default',
  text = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (variant === 'coffee') {
    return (
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="relative">
          <Coffee className={`${sizeClasses[size]} text-emerald-600 animate-spin`} />
          <div className="absolute inset-0 rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin"></div>
        </div>
        {text && (
          <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
        </div>
        {text && (
          <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin`}></div>
      </div>
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
