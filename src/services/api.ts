import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { AuthResponse, LoginData, RegisterData, User, Profile, Match, Message } from '../types';
import { getErrorMessage, logError } from '../utils/errorUtils';

// Configuration des URLs - utilise les proxies Vite pour éviter les problèmes CORS
const API_BASE_URL = '/api/auth'; // Auth service via proxy
const PROFILE_API_URL = '/api/profile'; // Profile service via proxy  
const INTERACTIONS_API_URL = '/api/interactions'; // Interactions service via proxy

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
[authApi, profileApi, interactionsApi].forEach(api => {
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
[authApi, profileApi, interactionsApi].forEach(api => {
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

// Health check services - Testing connectivity
export const healthService = {
  checkAuth: async (): Promise<{ status: string; service: string; timestamp: string }> => {
    try {
      // Test avec un endpoint valide
      await authApi.get('/me');
      return {
        status: 'healthy',
        service: 'auth',
        timestamp: new Date().toISOString()
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
  
  checkProfile: async (): Promise<{ status: string; service: string; timestamp: string }> => {
    try {
      // Test avec un endpoint valide
      await profileApi.get('/me');
      return {
        status: 'healthy',
        service: 'profile',
        timestamp: new Date().toISOString()
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
  
  checkInteractions: async (): Promise<{ status: string; service: string; timestamp: string }> => {
    try {
      // Test avec un endpoint valide
      await interactionsApi.get('/matches');
      return {
        status: 'healthy',
        service: 'interactions',
        timestamp: new Date().toISOString()
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
    auth: { status: string; service: string; timestamp: string }; 
    profile: { status: string; service: string; timestamp: string }; 
    interactions: { status: string; service: string; timestamp: string }; 
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

  register: async (data: RegisterData): Promise<{ message: string }> => {
    const response = await authApi.post('/register', data);
    return response.data;
  },

  verifyEmail: async (data: { email: string; code: string }): Promise<{ message: string }> => {
    const response = await authApi.post('/verify-email', data);
    return response.data;
  },

  resendVerificationCode: async (data: { email: string }): Promise<{ message: string; code?: string }> => {
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

  // Discovery profiles
  getDiscoverProfiles: async (offset: number = 0): Promise<Profile[]> => {
    const response: AxiosResponse<Profile[]> = await profileApi.get(`/discover?offset=${offset}`);
    return response.data;
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

export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

// Token validation helper
export const isTokenValid = (token: string): boolean => {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch (error) {
    return false;
  }
};

// Helper to ensure we have a valid token
export const ensureValidToken = async (): Promise<string | null> => {
  const currentToken = localStorage.getItem('access_token');
  
  if (currentToken && isTokenValid(currentToken)) {
    return currentToken;
  }
  
  // Try to refresh the token
  try {
    const response = await authService.refreshToken();
    return response.access_token;
  } catch (error) {
    logError('Failed to refresh token:', error);
    clearTokens();
    return null;
  }
};

// Enhanced cleanup function for token desynchronization
export const cleanupTokens = async (): Promise<boolean> => {
  try {
    // Clear all tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_email');
    
    // Clear any cached user data
    localStorage.removeItem('user_profile');
    
    // Log the cleanup
    console.log('✅ All tokens cleared from localStorage');
    
    return true;
  } catch (error) {
    console.error('❌ Error during token cleanup:', error);
    return false;
  }
};

// Enhanced token validation with cleanup on invalid tokens
export const validateAndCleanupTokens = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    console.log('No refresh token found');
    return false;
  }
  
  try {
    // Test the refresh token using authService
    const response = await authService.refreshToken();
    
    if (response.access_token) {
      console.log('✅ Tokens validated and refreshed successfully');
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.warn('❌ Token validation failed, cleaning up:', error.response?.status);
    
    // If token is invalid (401), clean up and let user login again
    if (error.response?.status === 401) {
      await cleanupTokens();
    }
    
    return false;
  }
};

// Advanced token synchronization with backend validation
export const syncTokensWithBackend = async (): Promise<{ success: boolean; message: string; newTokens?: { access_token: string; refresh_token: string } }> => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    return { success: false, message: 'No refresh token found' };
  }
  
  try {
    console.log('🔄 Attempting to sync tokens with backend...');
    
    // Test the current refresh token using the separate token refresh API
    const response = await tokenRefreshApi.post('/refresh-token', {
      refresh_token: refreshToken
    });
    
    if (response.data.access_token) {
      // Success - tokens are valid
      setTokens(response.data.access_token, response.data.refresh_token || refreshToken);
      console.log('✅ Tokens synchronized successfully');
      return { 
        success: true, 
        message: 'Tokens synchronized successfully',
        newTokens: {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token || refreshToken
        }
      };
    }
    
    return { success: false, message: 'Invalid response from server' };
    
  } catch (error: any) {
    console.warn('❌ Token sync failed:', error.response?.status, error.response?.data?.error);
    
    // If 401, the refresh token is invalid - need to clear and login again
    if (error.response?.status === 401) {
      await cleanupTokens();
      return { 
        success: false, 
        message: 'Refresh token invalid - cleared tokens. Please login again.' 
      };
    }
    
    return { 
      success: false, 
      message: `Token sync failed: ${error.response?.data?.error || error.message}` 
    };
  }
};

// Auto-recovery function for token issues
export const autoRecoverTokens = async (): Promise<boolean> => {
  try {
    console.log('🔧 Starting auto-recovery for token issues...');
    
    // Step 1: Try to sync with backend
    const syncResult = await syncTokensWithBackend();
    
    if (syncResult.success) {
      console.log('✅ Auto-recovery successful - tokens synchronized');
      return true;
    }
    
    // Step 2: If sync fails, clean up and prepare for fresh login
    console.log('🧹 Sync failed, cleaning up tokens...');
    await cleanupTokens();
    
    // Step 3: Check if we have user email for potential re-login
    const userEmail = localStorage.getItem('user_email');
    if (userEmail) {
      console.log('📧 User email found, ready for re-authentication');
      // Could potentially implement auto-login here if we had stored credentials
      // For security, we won't store passwords, so manual re-login is required
    }
    
    console.log('🔄 Auto-recovery completed - manual login required');
    return false;
    
  } catch (error) {
    console.error('❌ Auto-recovery failed:', error);
    await cleanupTokens();
    return false;
  }
};
