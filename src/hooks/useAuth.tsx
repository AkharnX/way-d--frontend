import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, clearTokens, profileService, setTokens } from '../services/api';
import type { LoginData, RegisterData, User } from '../types';
import { handleApiError } from '../utils/apiErrorUtils';
import { logError } from '../utils/errorUtils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<{ message: string; verification_code?: string; instructions?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  checkAndRedirectToProfile: () => Promise<string>;
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
      // Simple token validation
      const token = localStorage.getItem('access_token');

      if (token) {
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
        // No valid token, make sure user is null
        setUser(null);
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      const response = await authService.login(data);
      setTokens(response.access_token, response.refresh_token, data.rememberMe || false);

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
      throw handleApiError(error);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      // 1. Créer le compte utilisateur
      const response = await authService.register(data);

      // 2. Si l'inscription a réussi ET qu'on a des données de profil, créer le profil automatiquement
      // Note: On attend que l'email soit vérifié avant de créer le profil
      // Le profil sera créé lors de la connexion après vérification email

      // Return the response so the component can handle the verification code
      return response;
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

  // Check if user has a profile after successful login
  const checkAndRedirectToProfile = async () => {
    try {
      // Try to get the user's profile
      const profile = await profileService.getProfile();

      // Vérifier que le profil est complet (au minimum first_name et last_name)
      if (!profile || !profile.first_name || !profile.last_name) {
        console.log('⚠️ Profil incomplet ou manquant, redirection vers création...');
        return 'create-profile';
      }

      // Vérifier si le profil a tous les champs essentiels
      const hasEssentialFields = !!(
        profile.first_name &&
        profile.last_name &&
        (profile.bio || profile.trait) &&
        (profile.age || profile.birthdate) &&
        profile.height &&
        profile.location
      );

      if (!hasEssentialFields) {
        console.log('⚠️ Profil incomplet (champs essentiels manquants), redirection vers édition...');
        return 'create-profile';
      }

      console.log('✅ Profil complet trouvé, accès autorisé');
      return 'dashboard';
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('❌ Aucun profil trouvé (404), vérification des données d\'inscription...');

        // Profile doesn't exist - check if we have profile data from registration to auto-create
        const profileData = localStorage.getItem('pending_profile_data');

        if (profileData) {
          try {
            console.log('🔄 Attempting automatic profile creation...');
            const data = JSON.parse(profileData);

            // Try to create basic profile automatically
            await profileService.createBasicProfile(data);

            console.log('✅ Basic profile created successfully!');

            // Try to upload photos if they exist
            if (data.photos && data.photos.length > 0) {
              console.log('📸 Uploading photos...');
              for (const photoFile of data.photos) {
                try {
                  // Note: This assumes photos are stored as File objects
                  if (photoFile instanceof File) {
                    await profileService.uploadPhoto(photoFile);
                  }
                } catch (photoError) {
                  console.warn('Photo upload failed:', photoError);
                }
              }
            }

            // Clear the stored data after successful creation
            localStorage.removeItem('pending_profile_data');

            console.log('✅ Automatic profile creation complete!');

            // Check if profile was created successfully
            try {
              const newProfile = await profileService.getProfile();
              if (newProfile && newProfile.first_name && newProfile.last_name) {
                return 'dashboard';
              } else {
                return 'create-profile';
              }
            } catch (checkError) {
              return 'create-profile';
            }

          } catch (createError: any) {
            logError('Automatic profile creation failed:', createError);
            console.log('⚠️ Création automatique échouée, redirection vers création manuelle...');

            // If auto-creation fails, still redirect to manual creation
            // but keep the profile data for pre-filling the form
            return 'create-profile';
          }
        }

        // No profile data available - redirect to manual profile creation
        console.log('⚠️ Aucune donnée de profil en attente, création manuelle requise...');
        return 'create-profile';
      }
      // Other errors - still force profile creation for security
      logError('Error checking profile:', error);
      console.log('❌ Erreur lors de la vérification du profil, redirection sécurisée...');
      return 'create-profile';
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    checkAndRedirectToProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
