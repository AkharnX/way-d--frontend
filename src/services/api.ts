import type { AxiosResponse } from 'axios';
import axios from 'axios';
import type { AuthResponse, LoginData, Match, Message, Profile, RegisterData, SocialAuthResponse, TwoFactorSetupResponse, User } from '../types';
import {
  combineUserAndProfile,
  debugTransformation,
  transformProfileForBackend,
  transformProfileFromBackend,
  transformRegistrationForBackend,
  validateForBackend
} from '../utils/dataTransformers';
import { getErrorMessage, logError } from '../utils/errorUtils';
import { createRequestLoggerInterceptor } from '../utils/requestLogger';
import DiscoveryCache from './discoveryCache';

// Import the HealthResponse interface from global definitions
type HealthResponse = {
  status: string;
  service: string;
  timestamp: string;
  database?: string;
  version?: string;
  error?: string;
};

// Localized data fallbacks (imported from utils/localizedData.ts functionality)
const getLocalizedInterests = (): string[] => {
  return [
    'Football', 'Basketball', 'Musique', 'Danse', 'Cuisine', 'Voyages',
    'Lecture', 'Cinéma', 'Photographie', 'Art', 'Mode', 'Technologie',
    'Fitness', 'Yoga', 'Meditation', 'Nature', 'Randonnée', 'Plage',
    'Festivals', 'Culture africaine', 'Langues', 'Éducation',
    'Entrepreneuriat', 'Bénévolat', 'Afrobeat', 'Coupé-décalé'
  ];
};

const getLocalizedProfessions = (): string[] => {
  return [
    'Ingénieur', 'Médecin', 'Enseignant', 'Infirmier', 'Comptable',
    'Commercial', 'Entrepreneur', 'Informaticien', 'Banquier',
    'Avocat', 'Pharmacien', 'Architecte', 'Designer', 'Journaliste',
    'Marketing', 'Consultant', 'Chef de projet', 'Développeur',
    'Agriculteur', 'Commerçant', 'Artisan', 'Mécanicien',
    'Électricien', 'Plombier', 'Chauffeur', 'Secrétaire',
    'Gestionnaire', 'Analyste', 'Chercheur', 'Artiste',
    'Musicien', 'Étudiant', 'Fonctionnaire'
  ];
};

const getLocalizedEducationLevels = (): string[] => {
  return [
    'Aucun diplôme', 'CEPE', 'BEPC', 'BAC', 'BTS/DUT', 'Licence',
    'Master', 'Doctorat', 'École professionnelle', 'Formation technique',
    'Université', 'Grande école'
  ];
};

const getLocalizedLookingForOptions = (): Array<{ value: string; label: string }> => {
  return [
    { value: 'serious', label: 'Relation sérieuse' },
    { value: 'casual', label: 'Relation décontractée' },
    { value: 'friends', label: 'Amitié' },
    { value: 'networking', label: 'Réseautage professionnel' },
    { value: 'unsure', label: 'Je ne sais pas encore' }
  ];
};

const getLocalizedGenderOptions = (): Array<{ value: string; label: string }> => {
  return [
    { value: 'male', label: 'Homme' },
    { value: 'female', label: 'Femme' },
    { value: 'non-binary', label: 'Non-binaire' },
    { value: 'other', label: 'Autre / Ne se prononce pas' }
  ];
};

// Configuration des URLs - utilise les proxies Vite pour éviter les problèmes CORS
const API_BASE_URL = '/api/auth'; // Auth service via proxy
const PROFILE_API_URL = '/api/profile'; // Profile service via proxy  
const INTERACTIONS_API_URL = '/api/interactions'; // Interactions service via proxy
const EVENTS_API_URL = '/api/events'; // Events service via proxy
const PAYMENTS_API_URL = '/api/payments'; // Payments service via proxy
const NOTIFICATIONS_API_URL = '/api/notifications'; // Notifications service via proxy
const ANALYTICS_API_URL = '/api/analytics'; // Analytics service via proxy
const ADMIN_API_URL = '/api/admin'; // Administration service via proxy

// Create axios instances for different services
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const profileApi = axios.create({
  baseURL: PROFILE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const interactionsApi = axios.create({
  baseURL: INTERACTIONS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const eventsApi = axios.create({
  baseURL: EVENTS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const paymentsApi = axios.create({
  baseURL: PAYMENTS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const notificationsApi = axios.create({
  baseURL: NOTIFICATIONS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const analyticsApi = axios.create({
  baseURL: ANALYTICS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const adminApi = axios.create({
  baseURL: ADMIN_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Separate axios instance for token refresh to avoid infinite loops
const tokenRefreshApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const setTokens = (access: string, refresh: string, rememberMe: boolean = false) => {
  if (rememberMe) {
    // For remember me, set longer expiration times
    const accessExpiry = new Date();
    accessExpiry.setHours(accessExpiry.getHours() + 24); // 24 hours for access token

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 30); // 30 days for refresh token

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('token_expiry', accessExpiry.toISOString());
    localStorage.setItem('refresh_expiry', refreshExpiry.toISOString());
    localStorage.setItem('remember_me', 'true');
  } else {
    // Regular session - tokens expire when browser closes
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('refresh_expiry');
    localStorage.removeItem('remember_me');
  }
};

export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_expiry');
  localStorage.removeItem('refresh_expiry');
  localStorage.removeItem('remember_me');
};

// Request interceptors to add auth token and logging
const requestLoggerInterceptor = createRequestLoggerInterceptor();

[authApi, profileApi, interactionsApi, eventsApi, paymentsApi, notificationsApi, analyticsApi, adminApi].forEach(api => {
  // Add request logging
  api.interceptors.request.use(requestLoggerInterceptor.request, requestLoggerInterceptor.error);

  // Add auth token
  api.interceptors.request.use(
    (config) => {
      // Always get the latest token from localStorage
      const currentToken = localStorage.getItem('access_token');
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
});

// Response interceptors to handle token refresh and logging
[authApi, profileApi, interactionsApi, eventsApi, paymentsApi, notificationsApi, analyticsApi, adminApi].forEach(api => {
  // Add response logging
  api.interceptors.response.use(requestLoggerInterceptor.response, requestLoggerInterceptor.error);

  // Add token refresh logic
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Avoid infinite loops
      if (originalRequest._retry) {
        logError('Request retry failed, clearing tokens', error);
        clearTokens();
        // Ne pas rediriger automatiquement pour éviter les boucles
        return Promise.reject(error);
      }

      const currentRefreshToken = localStorage.getItem('refresh_token');
      const currentAccessToken = localStorage.getItem('access_token');

      // Seulement essayer de refresh si on a un 401 et un refresh token valide
      if (error.response?.status === 401 && currentRefreshToken && currentAccessToken && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          logError('Attempting token refresh for request:', originalRequest.url);

          // Use the separate token refresh API to avoid infinite loops
          const response = await tokenRefreshApi.post('/refresh-token', {
            refresh_token: currentRefreshToken,
          });

          const newAccessToken = response.data.access_token;
          const newRefreshToken = response.data.refresh_token || currentRefreshToken;
          setTokens(newAccessToken, newRefreshToken);

          logError('Token refresh successful, retrying original request', originalRequest.url);

          // Update the authorization header for the retry
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Retry the original request with the same API instance
          return api.request(originalRequest);
        } catch (refreshError: any) {
          logError('Token refresh failed:', refreshError);

          // Si le refresh token est invalide (401), nettoyer et laisser l'utilisateur se reconnecter
          if (refreshError.response?.status === 401) {
            logError('Refresh token is invalid, clearing all tokens', refreshError);
            clearTokens();
            localStorage.removeItem('user_email');

            // Seulement rediriger si on n'est pas déjà sur une page de login
            if (!window.location.pathname.includes('/login') &&
              !window.location.pathname.includes('/register') &&
              !window.location.pathname.includes('/token-diagnostic')) {
              window.location.href = '/login';
            }
          }

          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
});

// Using the API URLs defined in the top level of api.ts

// Health check services - Using dedicated health endpoints
export const healthService = {
  checkAuth: async (): Promise<HealthResponse> => {
    try {
      // Use dedicated health endpoint with correct path
      // Fix: Utilisation du chemin correct pour le health check
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 3000 });
      return {
        status: response.data.status === 'ok' ? 'healthy' : 'unhealthy',
        service: response.data.service || 'auth',
        timestamp: response.data.timestamp || new Date().toISOString(),
        database: response.data.database,
        version: response.data.version
      };
    } catch (error) {
      console.warn('⚠️ Auth health check failed:', getErrorMessage(error));
      return {
        status: 'unhealthy',
        service: 'auth',
        timestamp: new Date().toISOString(),
        error: getErrorMessage(error)
      };
    }
  },

  checkProfile: async (): Promise<HealthResponse> => {
    try {
      // Use dedicated health endpoint with correct path
      // Fix: Utilisation du chemin correct pour le health check
      const response = await axios.get(`${PROFILE_API_URL}/health`, { timeout: 3000 });
      return {
        status: response.data.status === 'ok' ? 'healthy' : 'unhealthy',
        service: response.data.service || 'profile',
        timestamp: response.data.timestamp || new Date().toISOString(),
        database: response.data.database,
        version: response.data.version
      };
    } catch (error) {
      console.warn('⚠️ Profile health check failed:', getErrorMessage(error));
      return {
        status: 'unhealthy',
        service: 'profile',
        timestamp: new Date().toISOString(),
        error: getErrorMessage(error)
      };
    }
  },

  checkInteractions: async (): Promise<HealthResponse> => {
    try {
      // Use dedicated health endpoint with correct path
      // Fix: Utilisation du chemin correct pour le health check
      const response = await axios.get(`${INTERACTIONS_API_URL}/health`, { timeout: 3000 });
      return {
        status: response.data.status === 'ok' ? 'healthy' : 'unhealthy',
        service: response.data.service || 'interactions',
        timestamp: response.data.timestamp || new Date().toISOString(),
        database: response.data.database,
        version: response.data.version
      };
    } catch (error) {
      console.warn('⚠️ Interactions health check failed:', getErrorMessage(error));
      return {
        status: 'unhealthy',
        service: 'interactions',
        timestamp: new Date().toISOString(),
        error: getErrorMessage(error)
      };
    }
  },

  // Check all services at once
  checkAll: async (): Promise<{
    auth: HealthResponse;
    profile: HealthResponse;
    interactions: HealthResponse;
  }> => {
    const [authResult, profileResult, interactionsResult] = await Promise.allSettled([
      healthService.checkAuth(),
      healthService.checkProfile(),
      healthService.checkInteractions()
    ]);

    return {
      auth: authResult.status === 'fulfilled' ? authResult.value : {
        status: 'unhealthy',
        service: 'auth',
        timestamp: new Date().toISOString(),
        error: authResult.status === 'rejected' ? getErrorMessage(authResult.reason) : 'Unknown error'
      },
      profile: profileResult.status === 'fulfilled' ? profileResult.value : {
        status: 'unhealthy',
        service: 'profile',
        timestamp: new Date().toISOString(),
        error: profileResult.status === 'rejected' ? getErrorMessage(profileResult.reason) : 'Unknown error'
      },
      interactions: interactionsResult.status === 'fulfilled' ? interactionsResult.value : {
        status: 'unhealthy',
        service: 'interactions',
        timestamp: new Date().toISOString(),
        error: interactionsResult.status === 'rejected' ? getErrorMessage(interactionsResult.reason) : 'Unknown error'
      }
    };
  }
};

// Auth API functions
export const authService = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await authApi.post('/login', data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<{ message: string; verification_code?: string; instructions?: string }> => {
    try {
      // Valider les données avant transformation
      const validation = validateForBackend(data, 'user');
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Transformer les données pour le backend
      const backendData = await transformRegistrationForBackend(data);
      debugTransformation(data, backendData, 'Registration Frontend → Backend');

      const response = await authApi.post('/register', backendData);
      return response.data;
    } catch (error) {
      logError('Registration failed', error);
      throw error;
    }
  },

  verifyEmail: async (data: { email: string; code: string }): Promise<{ message: string }> => {
    const response = await authApi.post('/verify-email', data);
    return response.data;
  },

  resendVerificationCode: async (data: { email: string }): Promise<{ message: string; verification_code?: string; instructions?: string }> => {
    const response = await authApi.post('/resend-verification', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    const currentRefreshToken = localStorage.getItem('refresh_token');
    if (currentRefreshToken) {
      await authApi.post('/logout', { refresh_token: currentRefreshToken });
    }
    clearTokens();
  },

  getCurrentUser: async (): Promise<User> => {
    const response: AxiosResponse<User> = await authApi.get('/me');
    return response.data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const currentRefreshToken = localStorage.getItem('refresh_token');
    if (!currentRefreshToken) {
      throw new Error('No refresh token available');
    }

    // Use the separate token refresh API to avoid infinite loops
    const response: AxiosResponse<AuthResponse> = await tokenRefreshApi.post('/refresh-token', {
      refresh_token: currentRefreshToken,
    });

    // Update tokens in localStorage
    setTokens(response.data.access_token, response.data.refresh_token || currentRefreshToken);

    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await authApi.post('/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data: { token: string; password: string }): Promise<{ message: string }> => {
    const response = await authApi.post('/reset-password', data);
    return response.data;
  },

  // Two-Factor Authentication methods
  setup2FA: async (): Promise<TwoFactorSetupResponse> => {
    const response = await authApi.post('/2fa/setup');
    return response.data;
  },

  verify2FASetup: async (data: { secret: string; code: string }): Promise<{ message: string; backup_codes: string[] }> => {
    const response = await authApi.post('/2fa/verify-setup', data);
    return response.data;
  },

  disable2FA: async (data: { code: string }): Promise<{ message: string }> => {
    const response = await authApi.post('/2fa/disable', data);
    return response.data;
  },

  verify2FA: async (data: { email: string; code: string }): Promise<AuthResponse> => {
    const response = await authApi.post('/2fa/verify', data);
    return response.data;
  },

  // Social Login methods
  googleAuth: async (data: { token: string }): Promise<SocialAuthResponse> => {
    const response = await authApi.post('/auth/google', data);
    return response.data;
  },

  facebookAuth: async (data: { token: string }): Promise<SocialAuthResponse> => {
    const response = await authApi.post('/auth/facebook', data);
    return response.data;
  },

  // Check if user has a profile (for post-login redirection)
  hasProfile: async (): Promise<boolean> => {
    try {
      const response = await profileApi.get('/me');
      return !!response.data; // Returns true if profile exists
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false; // Profile doesn't exist
      }
      throw error; // Other errors
    }
  },
};

// Profile API functions
export const profileService = {
  // Core profile management
  getProfile: async (): Promise<Profile> => {
    try {
      // Get both profile and user data
      console.log('🔍 Starting profile data fetch...');

      // Try to get both profile and user data, but handle profile 404 gracefully
      let profileResponse: any = null;
      let userResponse: any = null;

      try {
        [profileResponse, userResponse] = await Promise.all([
          profileApi.get('/me'),
          authApi.get('/me')
        ]);
      } catch (error: any) {
        // If profile doesn't exist but we can get user data, handle gracefully
        if (error.response?.status === 404 && error.config?.url?.includes('/profile/')) {
          console.debug('Profile not found, checking user data for creation context');
          try {
            userResponse = await authApi.get('/me');
            console.log('🔍 User data for new profile creation:', userResponse.data);
            // Re-throw the original error so components handle profile creation
            throw error;
          } catch (userError) {
            console.debug('Cannot get user data either');
            throw error;
          }
        }
        throw error;
      }

      console.log('👤 User data:', userResponse.data);
      console.log('🎭 Profile data:', profileResponse.data);

      // Transform backend data to frontend format using our standardized transformers
      const profileData = combineUserAndProfile(userResponse.data, profileResponse.data);

      debugTransformation(
        { user: userResponse.data, profile: profileResponse.data },
        profileData,
        'Profile Get Backend → Frontend'
      ); console.log('✅ Final transformed profile data:', profileData);
      return profileData;
    } catch (error: any) {
      // If profile doesn't exist, try to get user data for profile creation context
      if (error.response?.status === 404) {
        try {
          const userResponse = await authApi.get('/me');
          console.log('🔍 User data for new profile creation:', userResponse.data);

          // Don't return fake data - let the 404 error bubble up so the component
          // can handle profile creation properly
          throw error;
        } catch (userError) {
          throw error; // Re-throw original 404 error
        }
      }
      throw error;
    }
  },

  createProfile: async (data: any): Promise<Profile> => {
    try {
      console.log("🔄 Frontend data before transformation:", data);

      // Valider les données avant transformation
      const validation = validateForBackend(data, 'profile');
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Transformer les données pour le backend
      const backendData = await transformProfileForBackend(data);
      debugTransformation(data, backendData, 'Profile Create Frontend → Backend');

      const response: AxiosResponse<any> = await profileApi.put('/me', backendData);
      console.log("✅ Profile created successfully:", response.data);

      // Transformer la réponse du backend vers le frontend
      const frontendProfile = transformProfileFromBackend(response.data);
      debugTransformation(response.data, frontendProfile, 'Profile Create Backend → Frontend');

      return frontendProfile;
    } catch (error) {
      logError('Profile creation failed', error);
      throw error;
    }
  },

  updateProfile: async (data: Partial<Profile>): Promise<Profile> => {
    try {
      console.log("🔄 Frontend data before transformation:", data);

      // Transformer les données pour le backend
      const backendData = await transformProfileForBackend(data);
      debugTransformation(data, backendData, 'Profile Update Frontend → Backend');

      const response: AxiosResponse<any> = await profileApi.put('/me', backendData);

      // Transformer la réponse du backend vers le frontend
      const frontendProfile = transformProfileFromBackend(response.data);
      debugTransformation(response.data, frontendProfile, 'Profile Update Backend → Frontend');

      return frontendProfile;
    } catch (error) {
      logError('Profile update failed', error);
      throw error;
    }
  },

  deleteProfile: async (): Promise<void> => {
    await profileApi.post('/deactivate');
  },

  // Photo management
  addPhoto: async (photoUrl: string): Promise<any> => {
    const response = await profileApi.post('/photos', { photo_url: photoUrl });
    return response.data;
  },

  deletePhoto: async (photoId: string): Promise<void> => {
    await profileApi.delete(`/photos/${photoId}`);
  },

  // Interests management
  getUserInterests: async (): Promise<any[]> => {
    const response = await profileApi.get('/interests');
    return response.data;
  },

  setUserInterests: async (interestIds: string[]): Promise<void> => {
    await profileApi.post('/interests', { interest_ids: interestIds });
  },

  getAvailableInterests: async (): Promise<any[]> => {
    const response = await profileApi.get('/interests/all');
    return response.data;
  },

  addInterest: async (name: string, description?: string): Promise<any> => {
    const response = await profileApi.post('/interests/new', { name, description });
    return response.data;
  },

  // Preferences management
  updatePreferences: async (preferences: {
    minAge: number;
    maxAge: number;
    minDistance: number;
    maxDistance: number;
  }): Promise<void> => {
    await profileApi.put('/preferences', {
      min_age: preferences.minAge,
      max_age: preferences.maxAge,
      min_distance: preferences.minDistance,
      max_distance: preferences.maxDistance
    });
  },

  // Location management
  updateLocation: async (lat: number, lng: number): Promise<void> => {
    await profileApi.patch('/location', { lat, lng });
  },

  // Activity tracking
  pingActivity: async (): Promise<void> => {
    await profileApi.post('/activity');
  },

  // Discovery profiles - simplified and reliable
  getDiscoverProfiles: async (offset: number = 0): Promise<Profile[]> => {
    try {
      console.log(`🔍 Fetching discovery profiles with offset ${offset}...`);
      const response: AxiosResponse<Profile[]> = await profileApi.get(`/discover?offset=${offset}`);
      const profiles = response.data;

      // Vérifier que le résultat est un tableau valide
      if (!profiles || !Array.isArray(profiles)) {
        console.warn('❌ Discovery endpoint returned invalid data:', profiles);
        return [];
      }

      // Transformer les données pour assurer la compatibilité frontend
      const transformedProfiles = profiles.map(profile => {
        try {
          // Si le profil a déjà des champs frontend, le retourner tel quel
          if (profile.age !== undefined || profile.bio !== undefined) {
            return profile as Profile;
          }
          // Sinon, le transformer depuis le format backend
          return transformProfileFromBackend(profile as any);
        } catch (transformError) {
          console.warn('❌ Failed to transform profile:', profile, transformError);
          return null;
        }
      }).filter(profile => profile !== null);

      console.log(`✅ Successfully loaded ${transformedProfiles.length} discovery profiles`);
      return transformedProfiles;

    } catch (error: any) {
      console.error('❌ Discovery profiles fetch failed:', error);

      // Si c'est une erreur d'authentification, la propager
      if (error.response?.status === 401) {
        throw error;
      }

      // Pour les autres erreurs, retourner un tableau vide
      return [];
    }
  },

  // Get all available profiles for discovery (excluding already interacted ones)
  getFilteredDiscoverProfiles: async (): Promise<Profile[]> => {
    try {
      console.log('🔍 Fetching filtered discovery profiles (optimized)...');

      // Vérification de l'authentification
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('❌ No access token found for discovery request');
        throw new Error('User not authenticated');
      }

      // Step 1: Get profiles from regular discover endpoint first (simpler approach)
      console.log('📡 Calling /discover endpoint...');
      const response: AxiosResponse<Profile[]> = await profileApi.get('/discover?limit=100');
      let allProfiles = response.data || [];
      console.log(`📊 Found ${allProfiles.length} profiles from discover endpoint`);

      if (allProfiles.length === 0) {
        console.log('📭 No profiles from discover, trying /all endpoint...');
        try {
          const allResponse: AxiosResponse<Profile[]> = await profileApi.get('/all');
          allProfiles = allResponse.data || [];
          console.log(`📊 Found ${allProfiles.length} profiles from /all endpoint`);
        } catch (allError) {
          console.warn('⚠️ /all endpoint also failed:', allError);
        }
      }

      // Step 2: Get user's interaction history in parallel for efficiency
      const [interactions, currentUser] = await Promise.allSettled([
        interactionsService.getUserInteractions(),
        authService.getCurrentUser()
      ]);

      // Process interactions result
      const userInteractions = interactions.status === 'fulfilled' ? interactions.value : { likes: [], dislikes: [] };
      const likes = userInteractions?.likes || [];
      const dislikes = userInteractions?.dislikes || [];

      // Process current user result
      const currentUserId = currentUser.status === 'fulfilled' ? currentUser.value?.id || '' : '';

      console.log(`🔄 User interactions: ${likes.length} likes, ${dislikes.length} dislikes, currentUser: ${currentUserId}`);

      // Step 3: Create set of excluded user IDs for efficient filtering
      const excludedUserIds = new Set([
        ...likes,
        ...dislikes,
        currentUserId
      ].filter(id => id)); // Remove empty IDs

      // Step 4: Filter and transform profiles
      const filteredProfiles = allProfiles
        .filter(profile => {
          const profileId = profile.user_id || profile.id;
          return profileId && !excludedUserIds.has(profileId);
        })
        .map(profile => {
          try {
            // Si le profil a déjà des champs frontend, le retourner tel quel
            if (profile.age !== undefined || profile.bio !== undefined) {
              return profile as Profile;
            }
            // Sinon, le transformer depuis le format backend
            return transformProfileFromBackend(profile as any);
          } catch (transformError) {
            console.warn('❌ Failed to transform profile:', profile, transformError);
            return null;
          }
        })
        .filter(profile => profile !== null);

      console.log(`✅ Filtered profiles: ${allProfiles.length} → ${filteredProfiles.length} (excluded ${allProfiles.length - filteredProfiles.length} already seen/own profiles)`);
      return filteredProfiles;

    } catch (error: any) {
      console.error('❌ Error fetching filtered profiles:', error);

      // Smart fallback: still try to filter even on error
      try {
        console.log('🔄 Attempting filtered fallback...');
        const fallbackResponse: AxiosResponse<Profile[]> = await profileApi.get('/discover?limit=50');
        const fallbackProfiles = fallbackResponse.data || [];

        if (fallbackProfiles.length > 0) {
          // Try to get interactions for filtering even in fallback
          let userInteractions;
          try {
            userInteractions = await interactionsService.getUserInteractions();
          } catch (interactionError) {
            console.warn('Could not get interactions for fallback filtering:', interactionError);
            userInteractions = { likes: [], dislikes: [] };
          }

          const likes = userInteractions?.likes || [];
          const dislikes = userInteractions?.dislikes || [];
          const excludedIds = new Set([...likes, ...dislikes]);

          const filteredFallback = fallbackProfiles
            .filter(profile => {
              const profileId = profile.user_id || profile.id;
              return profileId && !excludedIds.has(profileId);
            })
            .map(profile => {
              try {
                // Si le profil a déjà des champs frontend, le retourner tel quel
                if (profile.age !== undefined || profile.bio !== undefined) {
                  return profile as Profile;
                }
                // Sinon, le transformer depuis le format backend
                return transformProfileFromBackend(profile as any);
              } catch (transformError) {
                return null;
              }
            })
            .filter(profile => profile !== null);

          console.log(`✅ Filtered fallback: ${fallbackProfiles.length} → ${filteredFallback.length} profiles`);
          return filteredFallback;
        }

        return [];
      } catch (fallbackError) {
        console.error('❌ Fallback discovery also failed:', fallbackError);
        return [];
      }
    }
  },

  // New optimized method: Get smart filtered profiles for discovery
  getSmartDiscoverProfiles: async (): Promise<Profile[]> => {
    try {
      console.log('🧠 Getting smart filtered discovery profiles...');

      // Get fresh profiles from backend
      const response: AxiosResponse<Profile[]> = await profileApi.get('/discover?limit=100');
      const profiles = response.data || [];

      if (profiles.length === 0) {
        console.log('📭 No profiles available from discovery endpoint');
        return [];
      }

      // Get user interactions to filter out already seen profiles
      let userInteractions;
      try {
        userInteractions = await interactionsService.getUserInteractions();
      } catch (error) {
        console.warn('Could not fetch interactions, proceeding without filtering:', error);
        userInteractions = { likes: [], dislikes: [] };
      }

      // Get cached excluded IDs (profiles already shown but not necessarily liked/disliked)
      const cachedExcludedIds = DiscoveryCache.getExcludedProfileIds();

      // Create comprehensive exclusion set
      const likes = userInteractions?.likes || [];
      const dislikes = userInteractions?.dislikes || [];
      const allExcludedIds = new Set([
        ...likes,
        ...dislikes,
        ...cachedExcludedIds
      ]);

      console.log(`🔍 Exclusion filters: ${likes.length} likes + ${dislikes.length} dislikes + ${cachedExcludedIds.size} cached = ${allExcludedIds.size} total excluded`);

      // Filter and transform profiles
      const filteredProfiles = profiles
        .filter(profile => {
          const profileId = profile.user_id || profile.id;
          return profileId && !allExcludedIds.has(profileId);
        })
        .map(profile => {
          try {
            // Si le profil a déjà des champs frontend, le retourner tel quel
            if (profile.age !== undefined || profile.bio !== undefined) {
              return profile as Profile;
            }
            // Sinon, le transformer depuis le format backend
            return transformProfileFromBackend(profile as any);
          } catch (transformError) {
            console.warn('Transform error for profile:', profile, transformError);
            return null;
          }
        })
        .filter(profile => profile !== null) as Profile[];

      // Cache the profile IDs we're about to show (so they won't be shown again)
      const shownProfileIds = filteredProfiles.map(p => p.id || p.user_id).filter(id => id) as string[];
      if (shownProfileIds.length > 0) {
        DiscoveryCache.addExcludedProfileIds(shownProfileIds);
      }

      console.log(`🧠 Smart filtering: ${profiles.length} → ${filteredProfiles.length} profiles (filtered out ${profiles.length - filteredProfiles.length})`);
      return filteredProfiles;

    } catch (error: any) {
      console.error('❌ Smart discovery failed:', error);
      throw error; // Let the caller handle the fallback
    }
  },

  getPublicProfile: async (userId: string): Promise<any> => {
    const response = await profileApi.get(`/public/${userId}`);
    return response.data;
  },

  // Profile status
  checkProfileCompletion: async (): Promise<{ complete: boolean }> => {
    const response = await profileApi.get('/complete');
    return response.data;
  },

  getProfileSummary: async (): Promise<any> => {
    const response = await profileApi.get('/summary');
    return response.data;
  },

  // Legacy upload support (for compatibility)
  uploadPhoto: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await profileApi.post('/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deletePhotoUrl: async (photoUrl: string): Promise<void> => {
    await profileApi.delete('/photo', { data: { photo_url: photoUrl } });
  },

  // Dynamic data endpoints for profile creation/editing
  getInterestsSuggestions: async (): Promise<string[]> => {
    try {
      const response = await profileApi.get('/interests/suggestions');
      return response.data.interests || [];
    } catch (error) {
      // Silently fall back to localized data - this is expected behavior
      console.debug('Using fallback interests data (backend endpoint not available)');

      // Smart fallback: Use centralized localized data
      try {
        const { configService } = await import('./configService');
        const config = await configService.getConfig();
        return config.defaultInterests || getLocalizedInterests();
      } catch (configError) {
        return getLocalizedInterests();
      }
    }
  },

  getProfessionsSuggestions: async (): Promise<string[]> => {
    try {
      const response = await profileApi.get('/professions/suggestions');
      return response.data.professions || [];
    } catch (error) {
      // Silently fall back to localized data - this is expected behavior
      console.debug('Using fallback professions data (backend endpoint not available)');

      // Smart fallback: Use centralized localized data
      try {
        const { configService } = await import('./configService');
        const config = await configService.getConfig();
        return config.defaultProfessions || getLocalizedProfessions();
      } catch (configError) {
        return getLocalizedProfessions();
      }
    }
  },

  getEducationLevels: async (): Promise<string[]> => {
    try {
      const response = await profileApi.get('/education/suggestions');
      return response.data.education_levels || [];
    } catch (error) {
      // Silently fall back to localized data - this is expected behavior
      console.debug('Using fallback education levels data (backend endpoint not available)');

      // Smart fallback: Use centralized localized data
      try {
        const { configService } = await import('./configService');
        const config = await configService.getConfig();
        return config.defaultEducationLevels || getLocalizedEducationLevels();
      } catch (configError) {
        return getLocalizedEducationLevels();
      }
    }
  },

  getLookingForOptions: async (): Promise<Array<{ value: string; label: string }>> => {
    try {
      const response = await profileApi.get('/looking-for/options');
      return response.data.options || [];
    } catch (error) {
      // Silently fall back to localized data - this is expected behavior
      console.debug('Using fallback looking-for options data (backend endpoint not available)');

      // Smart fallback: Use centralized localized data
      try {
        const { configService } = await import('./configService');
        const config = await configService.getConfig();
        return config.defaultLookingForOptions || getLocalizedLookingForOptions();
      } catch (configError) {
        return getLocalizedLookingForOptions();
      }
    }
  },

  getGenderOptions: async (): Promise<Array<{ value: string; label: string }>> => {
    try {
      const response = await profileApi.get('/gender/options');
      return response.data.options || [];
    } catch (error) {
      console.debug('Using fallback gender options data (backend endpoint not available)');

      // Smart fallback: Use centralized localized data
      try {
        const { configService } = await import('./configService');
        const config = await configService.getConfig();
        return config.defaultGenderOptions || getLocalizedGenderOptions();
      } catch (configError) {
        return getLocalizedGenderOptions();
      }
    }
  },

  // Automatic profile creation
  createBasicProfile: async (data: any): Promise<Profile> => {
    console.log("🤖 Creating basic profile automatically:", data);

    // Transform data to backend format using our standardized transformers
    const backendData = transformProfileForBackend(data);

    console.log("📤 Transformed data for backend:", backendData);

    const response: AxiosResponse<any> = await profileApi.put('/me', backendData);
    console.log("✅ Basic profile created:", response.data);

    // Transform response back to frontend format
    try {
      // Get user data for proper combination
      const userResponse = await authApi.get('/me');
      return combineUserAndProfile(userResponse.data, response.data);
    } catch (error) {
      console.warn('Could not get user data for profile combination, returning raw profile');
      return response.data;
    }
  },
};

// Interactions API functions
export const interactionsService = {
  likeProfile: async (userId: string): Promise<{ match?: Match }> => {
    const response = await interactionsApi.post('/like', { target_id: userId });
    return response.data;
  },

  dislikeProfile: async (userId: string): Promise<void> => {
    await interactionsApi.post('/dislike', { target_id: userId });
  },

  getMatches: async (): Promise<Match[]> => {
    const response: AxiosResponse<Match[]> = await interactionsApi.get('/matches');
    return response.data;
  },

  sendMessage: async (matchId: string, content: string): Promise<Message> => {
    const response: AxiosResponse<Message> = await interactionsApi.post('/message', {
      match_id: matchId,
      content,
    });
    return response.data;
  },

  getMessages: async (matchId: string): Promise<Message[]> => {
    const response: AxiosResponse<Message[]> = await interactionsApi.get(`/messages/${matchId}`);
    return response.data;
  },

  blockUser: async (userId: string): Promise<void> => {
    await interactionsApi.post('/block', { blocked_id: userId });
  },

  getBlocks: async (): Promise<any[]> => {
    const response = await interactionsApi.get('/blocks');
    return response.data;
  },

  // Get user's interaction history (likes and dislikes)
  getUserInteractions: async (): Promise<{ likes: string[]; dislikes: string[] }> => {
    try {
      // Try to get interactions from a combined endpoint if it exists
      const response = await interactionsApi.get('/my-interactions');
      return response.data;
    } catch (error: any) {
      // If no combined endpoint, try to get from separate endpoints
      try {
        const [likesResponse, dislikesResponse] = await Promise.allSettled([
          interactionsApi.get('/my-likes'),
          interactionsApi.get('/my-dislikes')
        ]);

        const likes = likesResponse.status === 'fulfilled' ? likesResponse.value.data : [];
        const dislikes = dislikesResponse.status === 'fulfilled' ? dislikesResponse.value.data : [];

        return {
          likes: likes.map((like: any) => like.target_id || like.id),
          dislikes: dislikes.map((dislike: any) => dislike.target_id || dislike.id)
        };
      } catch (fallbackError) {
        console.warn('Could not fetch user interactions, returning empty arrays:', fallbackError);
        return { likes: [], dislikes: [] };
      }
    }
  },

  // New: Get detailed interaction history with profiles
  getDetailedInteractionHistory: async (): Promise<{
    likes: Array<{ id: string; target_user_id: string; created_at: string; profile?: any }>;
    dislikes: Array<{ id: string; target_user_id: string; created_at: string; profile?: any }>;
  }> => {
    try {
      const response = await interactionsApi.get('/my-detailed-interactions');
      return response.data;
    } catch (error) {
      console.warn('Detailed interactions not available, using basic version');
      const basic = await interactionsService.getUserInteractions();
      return {
        likes: basic.likes.map(userId => ({ id: userId, target_user_id: userId, created_at: new Date().toISOString() })),
        dislikes: basic.dislikes.map(userId => ({ id: userId, target_user_id: userId, created_at: new Date().toISOString() }))
      };
    }
  },

  // New: Undo a like/dislike (if allowed by backend)
  undoInteraction: async (interactionId: string): Promise<void> => {
    await interactionsApi.delete(`/interaction/${interactionId}`);
  },

  // New: Check if two users have matched
  checkMatch: async (targetUserId: string): Promise<{ isMatch: boolean; matchId?: string }> => {
    try {
      const response = await interactionsApi.get(`/check-match/${targetUserId}`);
      return response.data;
    } catch (error) {
      return { isMatch: false };
    }
  },

  // New: Get interaction statistics
  getUserStats: async (): Promise<{
    totalLikes: number;
    totalDislikes: number;
    totalMatches: number;
    likesReceived: number;
    profileViews: number;
  }> => {
    try {
      const response = await interactionsApi.get('/stats');
      return response.data;
    } catch (error) {
      // Return default stats if endpoint is not available
      return {
        totalLikes: 0,
        totalDislikes: 0,
        totalMatches: 0,
        likesReceived: 0,
        profileViews: 0
      };
    }
  },

  // Get interaction statistics (alias for getUserStats)
  getInteractionStats: async (): Promise<{
    totalLikes: number;
    totalDislikes: number;
    totalMatches: number;
    likesReceived: number;
    profileViews: number;
  }> => {
    try {
      const response = await interactionsApi.get('/stats');
      return response.data;
    } catch (error) {
      return {
        totalLikes: 0,
        totalDislikes: 0,
        totalMatches: 0,
        likesReceived: 0,
        profileViews: 0
      };
    }
  },
};

// Events API functions
export const eventsService = {
  // Get all events with pagination and filters
  getEvents: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    location?: string;
  }): Promise<{ events: any[]; page: number; limit: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.location) queryParams.append('location', params.location);

    const response = await eventsApi.get(`?${queryParams.toString()}`);
    return response.data;
  },

  // Get a specific event by ID
  getEvent: async (eventId: string): Promise<any> => {
    const response = await eventsApi.get(`/${eventId}`);
    return response.data;
  },

  // Create a new event
  createEvent: async (eventData: {
    name: string;
    description: string;
    location: string;
    start_date: string;
    end_date: string;
    type: 'Public' | 'Private';
    max_capacity?: number;
  }): Promise<any> => {
    const response = await eventsApi.post('', eventData);
    return response.data;
  },

  // Update an existing event
  updateEvent: async (eventId: string, eventData: any): Promise<any> => {
    const response = await eventsApi.put(`/${eventId}`, eventData);
    return response.data;
  },

  // Delete an event
  deleteEvent: async (eventId: string): Promise<void> => {
    await eventsApi.delete(`/${eventId}`);
  },

  // Participate in an event
  participateInEvent: async (eventId: string): Promise<any> => {
    const response = await eventsApi.post(`/${eventId}/participate`);
    return response.data;
  },

  // Cancel participation in an event
  cancelParticipation: async (eventId: string): Promise<void> => {
    await eventsApi.delete(`/${eventId}/participate`);
  },

  // Get event participants
  getEventParticipants: async (eventId: string): Promise<any[]> => {
    const response = await eventsApi.get(`/${eventId}/participants`);
    return response.data.participants;
  },

  // Get user's created events
  getMyEvents: async (): Promise<any[]> => {
    const response = await eventsApi.get('/my-events');
    return response.data.events;
  },

  // Get user's event participations
  getMyParticipations: async (): Promise<any[]> => {
    const response = await eventsApi.get('/my-participations');
    return response.data.participations;
  },
};

// Payments & Subscriptions API functions
export const paymentsService = {
  // Get subscription plans
  getSubscriptionPlans: async (): Promise<any[]> => {
    const response = await paymentsApi.get('/plans');
    return response.data.plans;
  },

  // Get user's subscription status
  getUserSubscription: async (): Promise<any> => {
    const response = await paymentsApi.get('/subscription');
    return response.data;
  },

  // Create payment intent
  createPaymentIntent: async (paymentData: {
    amount: number;
    currency: string;
    plan_type: string;
  }): Promise<{ client_secret: string; payment_id: string }> => {
    const response = await paymentsApi.post('/payment-intent', paymentData);
    return response.data;
  },

  // Create subscription
  createSubscription: async (subscriptionData: {
    plan_type: string;
    payment_method: string;
  }): Promise<any> => {
    const response = await paymentsApi.post('/subscription', subscriptionData);
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async (): Promise<void> => {
    await paymentsApi.delete('/subscription');
  },

  // Get payment history
  getPaymentHistory: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{ payments: any[]; page: number; limit: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await paymentsApi.get(`/history?${queryParams.toString()}`);
    return response.data;
  },
};

// Notifications API functions
export const notificationsService = {
  // Get user notifications
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    unread_only?: boolean;
  }): Promise<{ notifications: any[]; page: number; limit: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.unread_only) queryParams.append('unread_only', params.unread_only.toString());

    const response = await notificationsApi.get(`?${queryParams.toString()}`);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    await notificationsApi.patch(`/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await notificationsApi.patch('/mark-all-read');
  },

  // Get notification settings
  getSettings: async (): Promise<any> => {
    const response = await notificationsApi.get('/settings');
    return response.data;
  },

  // Update notification settings
  updateSettings: async (settings: any): Promise<any> => {
    const response = await notificationsApi.put('/settings', settings);
    return response.data;
  },

  // Register push token
  registerPushToken: async (tokenData: {
    token: string;
    platform: 'iOS' | 'Android' | 'Web';
  }): Promise<void> => {
    await notificationsApi.post('/push-token', tokenData);
  },

  // Get notification count
  getNotificationCount: async (): Promise<{ unread: number; total: number }> => {
    const response = await notificationsApi.get('/count');
    return response.data;
  },
};

// ========================
// ANALYTICS API FUNCTIONS
// ========================

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  resource: string;
  resource_id?: number;
  ip_address: string;
  user_agent: string;
  metadata?: string;
  created_at: string;
}

export interface UserStatistics {
  user_id: number;
  profile_views: number;
  profile_likes: number;
  profile_dislikes: number;
  matches_created: number;
  messages_exchanged: number;
  events_created: number;
  events_participated: number;
  total_session_time: number;
  avg_session_duration: number;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

export interface AppStatistics {
  id: number;
  date: string;
  total_users: number;
  active_users: number;
  new_registrations: number;
  total_profiles: number;
  total_matches: number;
  total_events: number;
  total_messages: number;
  avg_session_duration: number;
  premium_subscriptions: number;
  created_at: string;
}

// Log user activity
export const logActivity = async (action: string, resource: string, resourceId?: number, metadata?: any): Promise<{ success: boolean; message: string }> => {
  try {
    await analyticsApi.post('/activity', {
      action,
      resource,
      resource_id: resourceId,
      metadata: metadata ? JSON.stringify(metadata) : undefined
    });

    return { success: true, message: 'Activity logged successfully' };
  } catch (error: any) {
    logError('Failed to log activity', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

// Start user session
export const startAnalyticsSession = async (): Promise<{ success: boolean; session_id?: string; message: string }> => {
  try {
    const response = await analyticsApi.post('/sessions');
    return {
      success: true,
      session_id: response.data.session_id,
      message: 'Session started successfully'
    };
  } catch (error: any) {
    logError('Failed to start session', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

// End user session
export const endAnalyticsSession = async (sessionId?: string): Promise<{ success: boolean; message: string }> => {
  try {
    const url = sessionId ? `/sessions/${sessionId}` : '/sessions';
    await analyticsApi.delete(url);
    return { success: true, message: 'Session ended successfully' };
  } catch (error: any) {
    logError('Failed to end session', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

// Get user statistics
export const getUserAnalytics = async (userId: number): Promise<{ success: boolean; data?: UserStatistics; message: string }> => {
  try {
    const response = await analyticsApi.get(`/users/${userId}/statistics`);
    return { success: true, data: response.data, message: 'Statistics retrieved successfully' };
  } catch (error: any) {
    logError('Failed to get user statistics', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

// Get activity logs
export const getActivityLogs = async (params?: {
  start_date?: string;
  end_date?: string;
  action?: string;
  resource?: string;
  limit?: number;
  offset?: number;
}): Promise<{ success: boolean; data?: ActivityLog[]; message: string }> => {
  try {
    const response = await analyticsApi.get('/activity', { params });
    return { success: true, data: response.data.logs, message: 'Activity logs retrieved successfully' };
  } catch (error: any) {
    logError('Failed to get activity logs', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

// ===============================
// ADMINISTRATION API FUNCTIONS
// ===============================

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemConfiguration {
  id: number;
  key: string;
  value: string;
  type: string;
  category: string;
  description: string;
  is_editable: boolean;
  updated_by: number;
  updated_at: string;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  active_users: number;
  new_users_24h: number;
  total_profiles: number;
  total_matches: number;
  total_events: number;
  total_reports: number;
  pending_reports: number;
  system_health: string;
  active_sessions: number;
  premium_subscriptions: number;
  revenue_this_month: number;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  target_users: string;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

// Admin login
export const adminLogin = async (username: string, password: string): Promise<{ success: boolean; token?: string; admin?: AdminUser; message: string }> => {
  try {
    const response = await adminApi.post('/auth/login', { username, password });

    // Store admin token separately from user token
    localStorage.setItem('admin_token', response.data.token);

    return {
      success: true,
      token: response.data.token,
      admin: response.data.admin,
      message: 'Admin login successful'
    };
  } catch (error: any) {
    logError('Admin login failed', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

// Get admin dashboard stats
export const getAdminDashboard = async (): Promise<{ success: boolean; data?: DashboardStats; message: string }> => {
  try {
    const response = await adminApi.get('/admin/dashboard');
    return { success: true, data: response.data, message: 'Dashboard data retrieved successfully' };
  } catch (error: any) {
    logError('Failed to get dashboard stats', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

// Get system configuration
export const getSystemConfig = async (category?: string): Promise<{ success: boolean; data?: SystemConfiguration[]; message: string }> => {
  try {
    const params = category ? { category } : undefined;
    const response = await adminApi.get('/admin/config', { params });
    return { success: true, data: response.data.configurations, message: 'Configuration retrieved successfully' };
  } catch (error: any) {
    logError('Failed to get system configuration', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

// Update system configuration
export const updateSystemConfig = async (configId: number, value: string, notes?: string): Promise<{ success: boolean; message: string }> => {
  try {
    await adminApi.put(`/admin/config/${configId}`, { value, notes });
    return { success: true, message: 'Configuration updated successfully' };
  } catch (error: any) {
    logError('Failed to update configuration', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

// Get users (admin)
export const getAdminUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<{ success: boolean; data?: any; message: string }> => {
  try {
    const response = await adminApi.get('/admin/users', { params });
    return { success: true, data: response.data, message: 'Users retrieved successfully' };
  } catch (error: any) {
    logError('Failed to get users', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

// Manage user (admin action)
export const manageUser = async (userId: number, action: string, reason: string, duration?: number, notes?: string): Promise<{ success: boolean; message: string }> => {
  try {
    await adminApi.put(`/admin/users/${userId}/action`, {
      action,
      reason,
      duration,
      notes
    });
    return { success: true, message: `User ${action} successful` };
  } catch (error: any) {
    logError('Failed to manage user', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

// Get announcements
export const getAnnouncements = async (active?: boolean): Promise<{ success: boolean; data?: Announcement[]; message: string }> => {
  try {
    const params = active !== undefined ? { active: active.toString() } : undefined;
    const response = await adminApi.get('/admin/announcements', { params });
    return { success: true, data: response.data.announcements, message: 'Announcements retrieved successfully' };
  } catch (error: any) {
    logError('Failed to get announcements', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

// Create announcement
export const createAnnouncement = async (announcement: {
  title: string;
  content: string;
  type: string;
  target_users: string;
  start_date: string;
  end_date?: string;
}): Promise<{ success: boolean; id?: number; message: string }> => {
  try {
    const response = await adminApi.post('/admin/announcements', announcement);
    return {
      success: true,
      id: response.data.id,
      message: 'Announcement created successfully'
    };
  } catch (error: any) {
    logError('Failed to create announcement', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

// Get audit logs
export const getAuditLogs = async (params?: {
  page?: number;
  limit?: number;
  admin_id?: string;
  action?: string;
  resource?: string;
}): Promise<{ success: boolean; data?: any; message: string }> => {
  try {
    const response = await adminApi.get('/admin/audit-logs', { params });
    return { success: true, data: response.data, message: 'Audit logs retrieved successfully' };
  } catch (error: any) {
    logError('Failed to get audit logs', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

// ============================
// AUTO ANALYTICS INTEGRATION
// ============================

// Auto-log user actions (can be called from various parts of the app)
export const autoLogActivity = async (action: string, resource: string, resourceId?: number) => {
  try {
    // Only log if user is authenticated
    const token = localStorage.getItem('access_token');
    if (token) {
      await logActivity(action, resource, resourceId);
    }
  } catch (error) {
    // Silently fail for analytics to not disrupt user experience
    console.debug('Analytics logging failed:', error);
  }
};

// Auto-start session on app load
export const initializeAnalytics = async () => {
  try {
    const token = localStorage.getItem('access_token');
    if (token) {
      const result = await startAnalyticsSession();
      if (result.success && result.session_id) {
        sessionStorage.setItem('analytics_session_id', result.session_id);
      }
    }
  } catch (error) {
    console.debug('Analytics initialization failed:', error);
  }
};

// Auto-end session on app close
export const cleanupAnalytics = async () => {
  try {
    const sessionId = sessionStorage.getItem('analytics_session_id');
    if (sessionId) {
      await endAnalyticsSession(sessionId);
      sessionStorage.removeItem('analytics_session_id');
    }
  } catch (error) {
    console.debug('Analytics cleanup failed:', error);
  }
};
