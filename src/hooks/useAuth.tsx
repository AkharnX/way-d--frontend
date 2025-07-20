import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginData, RegisterData } from '../types';
import { authService, setTokens, clearTokens, validateAndCleanupTokens } from '../services/api';
import { logError } from '../utils/errorUtils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // First try to validate and cleanup tokens if needed
      const tokensValid = await validateAndCleanupTokens();
      
      if (tokensValid) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error: any) {
          logError('Failed to get current user:', error);
          
          // Check if it's an email verification error
          if (error.response?.status === 403 && 
              (error.response?.data?.error?.includes('Email not verified') || 
               error.response?.data?.message?.includes('Email not verified'))) {
            // User is logged in but email not verified - keep them logged in
            // but they'll need to verify their email to access protected routes
            console.log('User email not verified, but keeping session active');
            
            // Create a minimal user object to maintain session
            const userEmail = localStorage.getItem('user_email');
            if (userEmail) {
              const unverifiedUser: User = {
                id: 'temp',
                email: userEmail,
                first_name: '',
                last_name: '',
                birth_date: '',
                gender: 'other',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              setUser(unverifiedUser);
            }
          } else {
            // Other errors, clear tokens and reset user
            clearTokens();
            setUser(null);
          }
        }
      } else {
        // No valid tokens, make sure user is null
        setUser(null);
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      const response = await authService.login(data);
      setTokens(response.access_token, response.refresh_token);
      
      // Store user email for potential email verification issues
      localStorage.setItem('user_email', data.email);
      
      // Try to get the current user to check if email is verified
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (meError: any) {
        logError('Error getting current user after login:', meError);
        
        // If it's an email verification error, create a temporary user
        if (meError.response?.status === 403 && 
            (meError.response?.data?.error?.includes('Email not verified') || 
             meError.response?.data?.message?.includes('Email not verified'))) {
          
          const unverifiedUser: User = {
            id: 'temp',
            email: data.email,
            first_name: '',
            last_name: '',
            birth_date: '',
            gender: 'other',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setUser(unverifiedUser);
        } else {
          // Other errors - clear tokens and throw
          clearTokens();
          throw meError;
        }
      }
      
    } catch (error) {
      logError('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await authService.register(data);
      // After successful registration, user needs to login
    } catch (error) {
      logError('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      logError('Logout failed:', error);
    } finally {
      clearTokens();
      localStorage.removeItem('user_email');
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
