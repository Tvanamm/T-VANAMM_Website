
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PageLoadingProps {
  text?: string;
  variant?: 'default' | 'coffee' | 'dots';
}

const PageLoading: React.FC<PageLoadingProps> = ({ 
  text = 'Loading page...', 
  variant = 'coffee' 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" variant={variant} text={text} />
      </div>
    </div>
  );
};

export default PageLoading;
