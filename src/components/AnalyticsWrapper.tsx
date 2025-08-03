import React from 'react';
import { usePageTracking, useAnalyticsSession } from '../hooks/useAnalytics';

interface AnalyticsWrapperProps {
  children: React.ReactNode;
}

const AnalyticsWrapper: React.FC<AnalyticsWrapperProps> = ({ children }) => {
  // Initialize analytics session tracking
  useAnalyticsSession();
  
  // Initialize page view tracking
  usePageTracking();

  return <>{children}</>;
};

export default AnalyticsWrapper;
