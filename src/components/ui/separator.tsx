import React from 'react';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Separator: React.FC<SeparatorProps> = ({ orientation = 'horizontal', className = '' }) => {
  const baseClasses = 'bg-gray-200';
  const orientationClasses = orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full';
  
  return <div className={`${baseClasses} ${orientationClasses} ${className}`} />;
};
