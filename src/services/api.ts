import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { AuthResponse, LoginData, RegisterData, User, Profile, Match, Message } from '../types';
import { getErrorMessage, logError } from '../utils/errorUtils';

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
export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Request interceptors to add auth token
[authApi, profileApi, interactionsApi, eventsApi, paymentsApi, notificationsApi, analyticsApi, adminApi].forEach(api => {
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

// Response interceptors to handle token refresh
[authApi, profileApi, interactionsApi, eventsApi, paymentsApi, notificationsApi, analyticsApi, adminApi].forEach(api => {
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

// Health check services - Using dedicated health endpoints
export const healthService = {
  checkAuth: async (): Promise<{ status: string; service: string; timestamp: string; database?: string; version?: string }> => {
    try {
      // Use dedicated health endpoint
      const response = await authApi.get('/health');
      return {
        status: response.data.status === 'ok' ? 'healthy' : 'unhealthy',
        service: response.data.service || 'auth',
        timestamp: response.data.timestamp || new Date().toISOString(),
        database: response.data.database,
        version: response.data.version
      };
    } catch (error) {
      throw {
        status: 'unhealthy',
        service: 'auth',
        timestamp: new Date().toISOString(),
        error: getErrorMessage(error)
      };
    }
  },
  
  checkProfile: async (): Promise<{ status: string; service: string; timestamp: string; database?: string; version?: string }> => {
    try {
      // Use dedicated health endpoint
      const response = await profileApi.get('/health');
      return {
        status: response.data.status === 'ok' ? 'healthy' : 'unhealthy',
        service: response.data.service || 'profile',  
        timestamp: response.data.timestamp || new Date().toISOString(),
        database: response.data.database,
        version: response.data.version
      };
    } catch (error) {
      throw {
        status: 'unhealthy',
        service: 'profile',
        timestamp: new Date().toISOString(),
        error: getErrorMessage(error)
      };
    }
  },
  
  checkInteractions: async (): Promise<{ status: string; service: string; timestamp: string; database?: string; version?: string }> => {
    try {
      // Use dedicated health endpoint
      const response = await interactionsApi.get('/health');
      return {
        status: response.data.status === 'ok' ? 'healthy' : 'unhealthy',
        service: response.data.service || 'interactions',
        timestamp: response.data.timestamp || new Date().toISOString(),
        database: response.data.database,
        version: response.data.version
      };
    } catch (error) {
      throw {
        status: 'unhealthy',
        service: 'interactions',
        timestamp: new Date().toISOString(),
        error: getErrorMessage(error)
      };
    }
  },
  
  checkAll: async (): Promise<{ 
    auth: { status: string; service: string; timestamp: string; database?: string; version?: string }; 
    profile: { status: string; service: string; timestamp: string; database?: string; version?: string }; 
    interactions: { status: string; service: string; timestamp: string; database?: string; version?: string }; 
  }> => {
    try {
      const [auth, profile, interactions] = await Promise.allSettled([
        healthService.checkAuth(),
        healthService.checkProfile(),
        healthService.checkInteractions()
      ]);
      
      return { 
        auth: auth.status === 'fulfilled' ? auth.value : { status: 'unhealthy', service: 'auth', timestamp: new Date().toISOString() },
        profile: profile.status === 'fulfilled' ? profile.value : { status: 'unhealthy', service: 'profile', timestamp: new Date().toISOString() },
        interactions: interactions.status === 'fulfilled' ? interactions.value : { status: 'unhealthy', service: 'interactions', timestamp: new Date().toISOString() }
      };
    } catch (error) {
      throw new Error('One or more services are unavailable');
    }
  }
};

// Auth API functions
export const authService = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await authApi.post('/login', data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<{ message: string; verification_code?: string; instructions?: string }> => {
    const response = await authApi.post('/register', data);
    return response.data;
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

// Utility function to convert location string to coordinates
const getLocationCoordinates = async (locationString: string): Promise<{ lat: number; lng: number } | null> => {
  // For now, return a mock coordinate for Paris as example
  // In production, you would use a geocoding service like Google Maps API
  const locationMap: { [key: string]: { lat: number; lng: number } } = {
    'paris': { lat: 48.8566, lng: 2.3522 },
    'lyon': { lat: 45.764, lng: 4.8357 },
    'marseille': { lat: 43.2965, lng: 5.3698 },
    'toulouse': { lat: 43.6047, lng: 1.4442 },
    'nice': { lat: 43.7102, lng: 7.2620 },
    'nantes': { lat: 47.2184, lng: -1.5536 },
    'montpellier': { lat: 43.6110, lng: 3.8767 },
    'strasbourg': { lat: 48.5734, lng: 7.7521 },
    'bordeaux': { lat: 44.8378, lng: -0.5792 },
    'lille': { lat: 50.6292, lng: 3.0573 }
  };
  
  const city = locationString.toLowerCase().split(',')[0].trim();
  return locationMap[city] || { lat: 48.8566, lng: 2.3522 }; // Default to Paris
};

// Transform frontend ProfileForm data to backend Profile model format
const transformProfileDataForBackend = async (frontendData: any) => {
  console.log("🔄 Frontend data received:", frontendData);

  // Calculate birthdate from age
  const currentDate = new Date();
  const birthYear = currentDate.getFullYear() - (frontendData.age || 25);
  const birthdate = new Date(birthYear, 0, 1); // January 1st of birth year

  const backendData: any = {
    // Required fields according to Backend Profile model
    height: parseInt(frontendData.height as string) || 175, // Default height in cm
    profile_photo_url: frontendData.photos && frontendData.photos.length > 0 ? frontendData.photos[0] : "",
    occupation: frontendData.profession || frontendData.occupation || "",
    trait: frontendData.bio || frontendData.trait || "",
    birthdate: birthdate.toISOString(),
    active: true
  };

  // Convert location string to coordinates object for backend
  if (frontendData.location) {
    const coordinates = await getLocationCoordinates(frontendData.location);
    if (coordinates) {
      // Backend expects { lat: number, lng: number } for location processing
      backendData.location = coordinates;
    }
  }

  console.log("🔄 Backend data after transformation:", backendData);
  return backendData;
};

// Transform backend Profile data to frontend format
const transformBackendDataToFrontend = (backendData: any) => {
  console.log("🔄 Backend data received for transformation:", backendData);
  
  const frontendData: any = {
    // Map backend fields to frontend fields
    first_name: backendData.first_name || '',
    last_name: backendData.last_name || '',
    bio: backendData.trait || '',
    profession: backendData.occupation || '',
    height: backendData.height || 175,
    photos: backendData.profile_photo_url ? [backendData.profile_photo_url] : [],
    interests: [], // TODO: Load from separate interests endpoint
    looking_for: 'serious', // Default value
    education: '',
    active: backendData.active,
    // Preserve backend fields too
    id: backendData.id,
    user_id: backendData.user_id,
    created_at: backendData.created_at,
    updated_at: backendData.updated_at,
    trait: backendData.trait,
    occupation: backendData.occupation,
    profile_photo_url: backendData.profile_photo_url
  };

  console.log("🔄 Frontend data mapping step 1:", {
    first_name: frontendData.first_name,
    last_name: frontendData.last_name,
    bio: frontendData.bio,
    profession: frontendData.profession
  });

  // Calculate age from birthdate
  if (backendData.birthdate) {
    try {
      console.log("🎂 Raw birthdate from backend:", backendData.birthdate);
      const birthDate = new Date(backendData.birthdate);
      console.log("🎂 Parsed birth date:", birthDate);
      const today = new Date();
      console.log("📅 Today:", today);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        frontendData.age = age - 1;
      } else {
        frontendData.age = age;
      }
      console.log("🧮 Calculated age:", frontendData.age);
    } catch (error) {
      console.error('Error calculating age:', error);
      frontendData.age = 25; // Default
    }
  } else {
    console.log("⚠️ No birthdate found, using default age 25");
    frontendData.age = 25; // Default
  }

  // Convert location from coordinates back to city name (if possible)
  if (backendData.location && typeof backendData.location === 'object') {
    // Try to reverse geocode coordinates to city name
    const { lat, lng } = backendData.location;
    frontendData.location = reverseGeocodeLocation(lat, lng);
  } else if (typeof backendData.location === 'string') {
    // If it's a string (WKT format), try to extract coordinates
    frontendData.location = extractLocationFromWKT(backendData.location);
  } else {
    frontendData.location = '';
  }

  console.log("🔄 Frontend data after transformation:", frontendData);
  return frontendData;
};

// Reverse geocode coordinates to city name
const reverseGeocodeLocation = (lat: number, lng: number): string => {
  // Simple reverse mapping for known coordinates
  const knownLocations = [
    { name: 'Paris', lat: 48.8566, lng: 2.3522, tolerance: 0.1 },
    { name: 'Lyon', lat: 45.7640, lng: 4.8357, tolerance: 0.1 },
    { name: 'Marseille', lat: 43.2965, lng: 5.3698, tolerance: 0.1 },
    { name: 'Toulouse', lat: 43.6047, lng: 1.4442, tolerance: 0.1 },
    { name: 'Nice', lat: 43.7102, lng: 7.2620, tolerance: 0.1 },
    { name: 'Nantes', lat: 47.2184, lng: -1.5536, tolerance: 0.1 },
    { name: 'Montpellier', lat: 43.6110, lng: 3.8767, tolerance: 0.1 },
    { name: 'Strasbourg', lat: 48.5734, lng: 7.7521, tolerance: 0.1 },
    { name: 'Bordeaux', lat: 44.8378, lng: -0.5792, tolerance: 0.1 },
    { name: 'Lille', lat: 50.6292, lng: 3.0573, tolerance: 0.1 }
  ];

  for (const location of knownLocations) {
    if (Math.abs(lat - location.lat) < location.tolerance && 
        Math.abs(lng - location.lng) < location.tolerance) {
      return location.name;
    }
  }

  // If no match found, return coordinates as string
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};

// Extract location from WKT (Well-Known Text) format
const extractLocationFromWKT = (wkt: string): string => {
  try {
    // WKT format: "POINT(lng lat)" 
    const match = wkt.match(/POINT\(([^)]+)\)/);
    if (match) {
      const coords = match[1].split(' ');
      const lng = parseFloat(coords[0]);
      const lat = parseFloat(coords[1]);
      return reverseGeocodeLocation(lat, lng);
    }
  } catch (error) {
    console.error('Error parsing WKT:', error);
  }
  return '';
};

// Profile API functions
export const profileService = {
  // Core profile management
  getProfile: async (): Promise<Profile> => {
    try {
      // Get both profile and user data
      console.log('🔍 Starting profile data fetch...');
      const [profileResponse, userResponse] = await Promise.all([
        profileApi.get('/me'),
        authApi.get('/me')
      ]);
      
      console.log('👤 User data:', userResponse.data);
      console.log('🎭 Profile data:', profileResponse.data);
      
      // Combine profile and user data
      const combinedData = {
        ...profileResponse.data,
        first_name: userResponse.data.first_name,
        last_name: userResponse.data.last_name,
        birthdate: userResponse.data.birth_date || profileResponse.data.birthdate
      };
      
      console.log('🔄 Combined data before transformation:', combinedData);
      const transformedData = transformBackendDataToFrontend(combinedData);
      console.log('✅ Final transformed profile data:', transformedData);
      return transformedData;
    } catch (error: any) {
      // If profile doesn't exist, still try to get user data for profile creation
      if (error.response?.status === 404) {
        try {
          const userResponse = await authApi.get('/me');
          console.log('🔍 User data for new profile:', userResponse.data);
          
          // For testing: return mock data with transformation
          const mockProfileData = {
            id: 'mock-profile-id',
            user_id: userResponse.data.id,
            height: 180,
            profile_photo_url: 'https://via.placeholder.com/150/4F46E5/FFFFFF?text=TP',
            location: 'POINT(2.3522 48.8566)', // Paris in WKT format
            occupation: 'Développeur Full-Stack',
            trait: 'Passionné de technologie et amateur de voyages. J\'aime découvrir de nouvelles cultures et partager mes expériences.',
            birthdate: '1995-03-15T00:00:00.000Z',
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            first_name: userResponse.data.first_name,
            last_name: userResponse.data.last_name
          };
          
          console.log('🧪 Testing with mock backend data:', mockProfileData);
          console.log('🎂 Mock birthdate:', mockProfileData.birthdate);
          
          const transformedMockData = transformBackendDataToFrontend(mockProfileData);
          console.log('✅ Transformed mock data:', transformedMockData);
          console.log('🎂 Final age in transformed data:', transformedMockData.age);
          
          return transformedMockData;
        } catch (userError) {
          throw error; // Re-throw original error if user fetch also fails
        }
      }
      throw error;
    }
  },

  createProfile: async (data: any): Promise<Profile> => {
    console.log("🔄 Frontend data before transformation:", data);
    const backendData = await transformProfileDataForBackend(data);
    console.log("🔄 Backend data after transformation:", backendData);
    const response: AxiosResponse<Profile> = await profileApi.put('/me', backendData);
    console.log("✅ Profile created successfully:", response.data);
    return response.data;
  },

  updateProfile: async (data: Partial<Profile>): Promise<Profile> => {
    console.log("🔄 Frontend data before transformation:", data);
    const backendData = await transformProfileDataForBackend(data);
    console.log("🔄 Backend data after transformation:", backendData);
    const response: AxiosResponse<Profile> = await profileApi.put('/me', backendData);
    return response.data;
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

  // Discovery profiles - optimized to exclude already interacted profiles
  getDiscoverProfiles: async (offset: number = 0): Promise<Profile[]> => {
    try {
      // Use the optimized filtered discovery method
      return await profileService.getFilteredDiscoverProfiles();
    } catch (error) {
      // Fallback to original method if filtered discovery fails
      console.warn('Filtered discovery failed, using original method:', error);
      const response: AxiosResponse<Profile[]> = await profileApi.get(`/discover?offset=${offset}`);
      return response.data;
    }
  },

  // Get all available profiles for discovery (excluding already interacted ones)
  getFilteredDiscoverProfiles: async (): Promise<Profile[]> => {
    try {
      console.log('🔍 Fetching filtered discovery profiles...');
      
      // Step 1: Get all available profiles
      let allProfiles: Profile[] = [];
      try {
        // Try to get all profiles from backend
        const response: AxiosResponse<Profile[]> = await profileApi.get('/all');
        allProfiles = response.data;
        console.log(`📊 Found ${allProfiles.length} total profiles`);
      } catch (error: any) {
        // Fallback: use discover endpoint with high offset to get more profiles
        console.log('⚠️ /all endpoint not available, using /discover with pagination');
        let offset = 0;
        const limit = 50;
        
        while (true) {
          const batch: AxiosResponse<Profile[]> = await profileApi.get(`/discover?offset=${offset}&limit=${limit}`);
          if (batch.data.length === 0) break;
          
          allProfiles = allProfiles.concat(batch.data);
          offset += limit;
          
          // Safety limit to avoid infinite loops
          if (offset > 1000) break;
        }
        console.log(`📊 Found ${allProfiles.length} profiles via pagination`);
      }

      // Step 2: Get user's interaction history
      const interactions = await interactionsService.getUserInteractions();
      console.log(`🔄 User interactions: ${interactions.likes.length} likes, ${interactions.dislikes.length} dislikes`);
      
      // Step 3: Get current user ID to exclude their own profile
      let currentUserId = '';
      try {
        const currentUser = await authService.getCurrentUser();
        currentUserId = currentUser.id;
        console.log('👤 Current user ID:', currentUserId);
      } catch (error) {
        console.warn('Could not get current user ID:', error);
      }

      // Step 4: Filter out already interacted profiles and user's own profile
      const interactedUserIds = new Set([
        ...interactions.likes,
        ...interactions.dislikes,
        currentUserId
      ]);

      const filteredProfiles = allProfiles.filter(profile => 
        !interactedUserIds.has(profile.user_id || profile.id)
      );

      console.log(`✅ Filtered profiles: ${allProfiles.length} → ${filteredProfiles.length} (excluded ${allProfiles.length - filteredProfiles.length} already seen/own profile)`);
      
      return filteredProfiles.map(profile => transformBackendDataToFrontend(profile));
      
    } catch (error: any) {
      console.error('❌ Error fetching filtered profiles:', error);
      // Fallback to original method
      const response: AxiosResponse<Profile[]> = await profileApi.get(`/discover?offset=0`);
      return response.data;
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
      console.error('Error fetching interests suggestions:', error);
      // Fallback to static data if backend fails
      return [
        'Voyage', 'Sport', 'Cinéma', 'Musique', 'Lecture', 'Cuisine', 'Art',
        'Technologie', 'Nature', 'Photographie', 'Danse', 'Fitness', 'Gaming'
      ];
    }
  },

  getProfessionsSuggestions: async (): Promise<string[]> => {
    try {
      const response = await profileApi.get('/professions/suggestions');
      return response.data.professions || [];
    } catch (error) {
      console.error('Error fetching professions suggestions:', error);
      // Fallback to static data if backend fails
      return [
        'Étudiant(e)', 'Ingénieur(e)', 'Médecin', 'Professeur(e)', 'Commercial(e)',
        'Artiste', 'Entrepreneur(e)', 'Avocat(e)', 'Infirmier(e)', 'Architecte',
        'Designer', 'Développeur(euse)', 'Marketing', 'Consultant(e)', 'Autre'
      ];
    }
  },

  getEducationLevels: async (): Promise<string[]> => {
    try {
      const response = await profileApi.get('/education/suggestions');
      return response.data.education_levels || [];
    } catch (error) {
      console.error('Error fetching education levels:', error);
      // Fallback to static data if backend fails
      return [
        'Collège', 'Lycée', 'Bac+2', 'Bac+3', 'Bac+5', 'Master', 'Doctorat', 'Autre'
      ];
    }
  },

  getLookingForOptions: async (): Promise<Array<{ value: string; label: string }>> => {
    try {
      const response = await profileApi.get('/looking-for/options');
      return response.data.options || [];
    } catch (error) {
      console.error('Error fetching looking for options:', error);
      // Fallback to static data if backend fails
      return [
        { value: 'serious', label: 'Relation sérieuse' },
        { value: 'casual', label: 'Relation décontractée' },
        { value: 'friends', label: 'Amitié' },
        { value: 'unsure', label: 'Je ne sais pas encore' }
      ];
    }
  },

  getGenderOptions: async (): Promise<Array<{ value: string; label: string }>> => {
    try {
      const response = await profileApi.get('/gender/options');
      return response.data.options || [];
    } catch (error) {
      console.error('Error fetching gender options:', error);
      // Fallback to static data if backend fails
      return [
        { value: 'male', label: 'Homme' },
        { value: 'female', label: 'Femme' },
        { value: 'other', label: 'Autre / Ne se prononce pas' }
      ];
    }
  },

  // Automatic profile creation
  createBasicProfile: async (data: any): Promise<Profile> => {
    console.log("🤖 Creating basic profile automatically:", data);
    const response: AxiosResponse<any> = await profileApi.post('/auto-create', {
      height: data.height || 175,
      bio: data.bio || '',
      location: data.location ? await getLocationCoordinates(data.location) : null,
      location_string: data.location || '',
      looking_for: data.looking_for || 'serious'
    });
    console.log("✅ Basic profile created:", response.data);
    return response.data.profile;
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
