import React from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ 
  title, 
  subtitle, 
  icon, 
  className = '' 
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-2">
        {icon && (
          <div className="w-10 h-10 bg-way-d-primary rounded-full flex items-center justify-center">
            {icon}
          </div>
        )}
        <h1 className="text-2xl font-bold way-d-primary">{title}</h1>
      </div>
      {subtitle && (
        <p className="text-gray-600 ml-13">{subtitle}</p>
      )}
    </div>
  );
};

export default PageTitle;
