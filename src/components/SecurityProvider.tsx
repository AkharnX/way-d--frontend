import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/api';
import { User } from '../types';
import { logError } from '../utils/errorUtils';

interface SecurityContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  securityLevel: 'none' | 'basic' | 'enhanced' | 'maximum';
  loginAttempts: number;
  lastActivity: Date | null;
  sessionExpiry: Date | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  checkSecurity: () => Promise<SecurityCheckResult>;
  updateActivity: () => void;
  isSessionValid: () => boolean;
  requireSecurityLevel: (level: SecurityContextType['securityLevel']) => boolean;
}

interface SecurityCheckResult {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

const MAX_LOGIN_ATTEMPTS = 5;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minute

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);

  // Security level based on user settings and current context
  const [securityLevel, setSecurityLevel] = useState<SecurityContextType['securityLevel']>('basic');

  const isAuthenticated = !!user;

  useEffect(() => {
    initializeSecurity();
    setupActivityMonitoring();
    setupSessionValidation();
  }, []);

  const initializeSecurity = async () => {
    setIsLoading(true);
    
    try {
      // Check if we have tokens before trying to validate
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!accessToken && !refreshToken) {
        // No tokens available, skip token validation
        setIsLoading(false);
        return;
      }
      
      // Check if we have valid tokens
      const token = localStorage.getItem('access_token');
      
      if (token) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        updateActivity();
        calculateSecurityLevel(userData);
        
        // Set session expiry based on token (if JWT)
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          setSessionExpiry(new Date(tokenPayload.exp * 1000));
        } catch {
          // If not JWT, set a default expiry
          setSessionExpiry(new Date(Date.now() + 24 * 60 * 60 * 1000));
        }
      }
    } catch (error) {
      logError('Security initialization failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  const setupActivityMonitoring = () => {
    // Monitor user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup on unmount
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  };

  const setupSessionValidation = () => {
    const interval = setInterval(() => {
      if (isAuthenticated && !isSessionValid()) {
        logout();
      }
    }, ACTIVITY_CHECK_INTERVAL);

    return () => clearInterval(interval);
  };

  const calculateSecurityLevel = (userData: User): void => {
    let level: SecurityContextType['securityLevel'] = 'basic';
    
    // Enhanced security for verified emails
    if (userData.email && userData.email.includes('@')) {
      level = 'enhanced';
    }
    
    // Maximum security for admin users or sensitive operations
    if (userData.email?.includes('admin') || userData.email?.includes('akharn')) {
      level = 'maximum';
    }
    
    setSecurityLevel(level);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Security: Check for brute force attempts
      if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        throw new Error('Trop de tentatives de connexion. Veuillez réessayer plus tard.');
      }

      // Security: Validate input
      if (!email || !password) {
        throw new Error('Email et mot de passe requis');
      }

      if (!isValidEmail(email)) {
        throw new Error('Format d\'email invalide');
      }

      const response = await authService.login({ email, password });
      
      if (response.access_token && response.user) {
        setUser(response.user);
        updateActivity();
        calculateSecurityLevel(response.user);
        setLoginAttempts(0); // Reset on successful login
        
        // Set session expiry
        const tokenPayload = JSON.parse(atob(response.access_token.split('.')[1]));
        setSessionExpiry(new Date(tokenPayload.exp * 1000));
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      setLoginAttempts(prev => prev + 1);
      logError('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      logError('Logout error:', error);
    } finally {
      setUser(null);
      setLastActivity(null);
      setSessionExpiry(null);
      setLoginAttempts(0);
      setSecurityLevel('none');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        updateActivity();
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          setSessionExpiry(new Date(tokenPayload.exp * 1000));
        } catch {
          setSessionExpiry(new Date(Date.now() + 24 * 60 * 60 * 1000));
        }
        return true;
      }
      
      return false;
    } catch (error) {
      logError('Session refresh failed:', error);
      return false;
    }
  };

  const updateActivity = (): void => {
    setLastActivity(new Date());
  };

  const isSessionValid = (): boolean => {
    if (!lastActivity || !sessionExpiry) return false;
    
    const now = new Date();
    const timeSinceActivity = now.getTime() - lastActivity.getTime();
    
    return timeSinceActivity < SESSION_TIMEOUT && now < sessionExpiry;
  };

  const checkSecurity = async (): Promise<SecurityCheckResult> => {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let riskLevel: SecurityCheckResult['riskLevel'] = 'low';

    // Check session validity
    if (!isSessionValid()) {
      issues.push('Session expirée ou inactive');
      riskLevel = 'high';
    }

    // Check token security
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        
        if (payload.exp - now < 300) { // Less than 5 minutes
          issues.push('Token expire bientôt');
          recommendations.push('Renouveler la session');
          riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
        }
      } catch (error) {
        issues.push('Token invalide ou corrompu');
        riskLevel = 'critical';
      }
    }

    // Check for suspicious activity
    if (loginAttempts > 2) {
      issues.push('Tentatives de connexion multiples détectées');
      recommendations.push('Vérifier l\'activité du compte');
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    }

    // Security level recommendations
    if (securityLevel === 'basic') {
      recommendations.push('Considérer l\'activation de la sécurité renforcée');
    }

    const isValid = issues.length === 0;

    return {
      isValid,
      issues,
      recommendations,
      riskLevel: issues.length > 0 ? riskLevel : 'low'
    };
  };

  const requireSecurityLevel = (requiredLevel: SecurityContextType['securityLevel']): boolean => {
    const levels = { none: 0, basic: 1, enhanced: 2, maximum: 3 };
    return levels[securityLevel] >= levels[requiredLevel];
  };

  const value: SecurityContextType = {
    user,
    isAuthenticated,
    isLoading,
    securityLevel,
    loginAttempts,
    lastActivity,
    sessionExpiry,
    login,
    logout,
    refreshSession,
    checkSecurity,
    updateActivity,
    isSessionValid,
    requireSecurityLevel
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity(): SecurityContextType {
  const context = useContext(SecurityContext);
  
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  
  return context;
}

// Security utilities
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Security Hook for protected components
export function useSecurityLevel(requiredLevel: SecurityContextType['securityLevel']) {
  const { requireSecurityLevel, securityLevel } = useSecurity();
  
  const hasRequiredLevel = requireSecurityLevel(requiredLevel);
  
  return {
    hasRequiredLevel,
    currentLevel: securityLevel,
    requiredLevel
  };
}

// Higher-Order Component for security protection
export function withSecurity<P extends object>(
  Component: React.ComponentType<P>,
  requiredLevel: SecurityContextType['securityLevel'] = 'basic'
) {
  return function SecurityProtectedComponent(props: P) {
    const { hasRequiredLevel } = useSecurityLevel(requiredLevel);
    
    if (!hasRequiredLevel) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Accès restreint</h3>
            <p className="text-gray-600">
              Vous n'avez pas les autorisations nécessaires pour accéder à cette section.
              Niveau requis: <strong>{requiredLevel}</strong>
            </p>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}

// Export default pour l'import dans App.tsx
export default SecurityProvider;
