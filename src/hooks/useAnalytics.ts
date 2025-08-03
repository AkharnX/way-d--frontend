import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { autoLogActivity, initializeAnalytics, cleanupAnalytics } from '../services/api';

// Hook to automatically track page views
export const usePageTracking = () => {
  const location = useLocation();
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Only track if the path actually changed
    if (currentPath !== lastPathRef.current) {
      lastPathRef.current = currentPath;
      
      // Log page view with error handling
      try {
        autoLogActivity('page_view', 'page', undefined);
      } catch (error) {
        // Silently fail analytics - don't break the app
        console.debug('Analytics tracking failed:', error);
      }
    }
  }, [location]);
};

// Hook to track user interactions
export const useInteractionTracking = () => {
  const trackInteraction = (action: string, resource: string, resourceId?: number) => {
    try {
      autoLogActivity(action, resource, resourceId);
    } catch (error) {
      // Silently fail analytics - don't break the app
      console.debug('Interaction tracking failed:', error);
    }
  };

  return { trackInteraction };
};

// Hook to initialize and cleanup analytics session
export const useAnalyticsSession = () => {
  useEffect(() => {
    // Initialize analytics session on mount with error handling
    const initAnalytics = async () => {
      try {
        await initializeAnalytics();
      } catch (error) {
        // Silently fail analytics initialization - don't break the app
        console.debug('Analytics initialization failed:', error);
      }
    };

    initAnalytics();

    // Cleanup on unmount and page unload
    const handleUnload = () => {
      try {
        cleanupAnalytics();
      } catch (error) {
        console.debug('Analytics cleanup failed:', error);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      try {
        cleanupAnalytics();
      } catch (error) {
        console.debug('Analytics cleanup failed:', error);
      }
    };
  }, []);
};

// Higher-order component to wrap components with analytics
export const withAnalytics = (WrappedComponent: React.ComponentType<any>) => {
  return React.forwardRef((props: any, ref: any) => {
    const { trackInteraction } = useInteractionTracking();

    useEffect(() => {
      // Log component mount
      trackInteraction('component_mount', 'component', undefined);

      return () => {
        // Log component unmount
        trackInteraction('component_unmount', 'component', undefined);
      };
    }, [trackInteraction]);

    return React.createElement(WrappedComponent, { ...props, ref, trackInteraction });
  });
};

// Utility functions for common tracking scenarios
export const trackProfileView = (profileId: number) => {
  autoLogActivity('profile_view', 'profile', profileId);
};

export const trackLike = (profileId: number) => {
  autoLogActivity('like', 'profile', profileId);
};

export const trackDislike = (profileId: number) => {
  autoLogActivity('dislike', 'profile', profileId);
};

export const trackMatch = (matchId: number) => {
  autoLogActivity('match_created', 'match', matchId);
};

export const trackMessage = (conversationId: number) => {
  autoLogActivity('message_sent', 'conversation', conversationId);
};

export const trackEventView = (eventId: number) => {
  autoLogActivity('event_view', 'event', eventId);
};

export const trackEventJoin = (eventId: number) => {
  autoLogActivity('event_join', 'event', eventId);
};

export const trackProfileEdit = () => {
  autoLogActivity('profile_edit', 'profile');
};

export const trackSearch = () => {
  autoLogActivity('search', 'search', undefined);
};

export const trackFeatureUsage = () => {
  autoLogActivity('feature_usage', 'feature', undefined);
};
