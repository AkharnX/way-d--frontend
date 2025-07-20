import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <div className="pb-20">
        <Outlet />
      </div>
      
      {/* Bottom navigation */}
      <Navigation />
    </div>
  );
};

export default AppLayout;
