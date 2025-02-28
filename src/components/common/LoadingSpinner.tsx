import React from 'react';
import { Loader2 } from 'lucide-react';
import { LoadingSpinnerProps } from '../../types';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Loader2 className={`${sizes[size]} animate-spin text-indigo-600`} />
      {text && <p className="mt-2 text-gray-500">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
