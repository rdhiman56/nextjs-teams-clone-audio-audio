import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-current border-t-transparent text-blue-500`} />
        {text && <p className="mt-2 text-sm text-slate-400">{text}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;