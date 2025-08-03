export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: 'male' | 'female' | 'other';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  height?: number;
  profile_photo_url?: string;
  location?: string;
  occupation?: string;
  trait?: string;
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
  active: boolean;
  birthdate?: string;
  
  // Frontend compatibility fields
  first_name?: string;
  last_name?: string;
  age?: number;
  bio?: string;
  profession?: string;
  education?: string;
  photos?: string[];
  interests?: string[];
  looking_for?: 'serious' | 'casual' | 'friends' | 'unsure';
  distance?: number;
}

export interface ProfilePreference {
  user_id: string;
  min_age: number;
  max_age: number;
  min_distance: number;
  max_distance: number;
}

export interface ProfilePhoto {
  id: string;
  user_id: string;
  photo_url: string;
  created_at: string;
}

export interface Interest {
  id: string;
  name: string;
  description?: string;
}

export interface UserInterest {
  user_id: string;
  interest_id: string;
}

export interface FullProfile extends Profile {
  preferences?: ProfilePreference;
  photos_list?: ProfilePhoto[];
  interests_list?: Interest[];
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
  profile: Profile;
  last_message?: Message;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  sent_at: string;
  read_at?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: 'male' | 'female' | 'other';
  // Champs de profil de base
  bio?: string;
  height?: number;
  location?: string;
  looking_for?: 'serious' | 'casual' | 'friends' | 'unsure';
}

export interface ApiError {
  message: string;
  details?: string;
}

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  messageNotifications: boolean;
  matchNotifications: boolean;
}

export interface PrivacySettings {
  showDistance: boolean;
  showAge: boolean;
  showOnline: boolean;
  discoverableProfile: boolean;
}

export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface SecurityLevel {
  level: 'none' | 'basic' | 'enhanced' | 'maximum';
  description: string;
  features: string[];
}

export interface SecurityCheckResult {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export interface LocationData {
  lat: number;
  lng: number;
  address?: string;
  accuracy?: number;
  timestamp?: Date;
}
