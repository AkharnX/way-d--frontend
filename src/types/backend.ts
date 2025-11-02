/**
 * 📋 TYPES BACKEND OFFICIELS - WAY-D
 * 
 * Source de vérité pour tous les types de données backend.
 * Ces interfaces correspondent exactement aux structs Go du backend.
 */

// ============================================================================
// 👤 USER SERVICE (Port 8080) - Authentification et gestion utilisateurs
// ============================================================================

export interface BackendUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    birth_date: string; // Format: "YYYY-MM-DD" (ex: "1995-08-15")
    gender: "male" | "female" | "other"; // Valeurs exactes du backend
    created_at: string;
    updated_at: string;
}

export interface BackendRegisterRequest {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    gender: "male" | "female" | "other";
    birth_date: string; // Format: "YYYY-MM-DD" (ex: "1995-08-15")
}

export interface BackendLoginRequest {
    email: string;
    password: string;
}

export interface BackendAuthResponse {
    access_token: string;
    refresh_token: string;
    user: BackendUser;
}

// ============================================================================
// 🎭 PROFILE SERVICE (Port 8081) - Gestion des profils
// ============================================================================

export interface BackendProfile {
    id: string;
    user_id: string;
    height: number;
    profile_photo_url: string;
    occupation: string; // Profession/métier
    trait: string; // Bio/description personnelle
    birthdate: string; // Format: "YYYY-MM-DD" (ex: "1995-08-15")
    location: BackendLocation; // Point PostGIS
    active: boolean;
    last_activity_at: string;
    created_at: string;
    updated_at: string;
}

export interface BackendLocation {
    lat: number; // Latitude
    lng: number; // Longitude
}

export interface BackendProfileCreateRequest {
    height: number;
    profile_photo_url: string;
    occupation: string;
    trait: string;
    birthdate: string;
    location: BackendLocation;
    active: boolean;
}

export interface BackendProfileUpdateRequest {
    height?: number;
    profile_photo_url?: string;
    occupation?: string;
    trait?: string;
    location?: BackendLocation;
    active?: boolean;
}

// ============================================================================
// ⚙️ PREFERENCES SERVICE - Préférences de découverte
// ============================================================================

export interface BackendPreference {
    user_id: string;
    min_age: number;
    max_age: number;
    min_distance: number;
    max_distance: number;
}

export interface BackendPreferenceRequest {
    min_age: number;
    max_age: number;
    min_distance: number;
    max_distance: number;
}

// ============================================================================
// 💕 INTERACTIONS SERVICE (Port 8082) - Likes, matches, messages
// ============================================================================

export interface BackendInteraction {
    id: string;
    user_id: string;
    target_user_id: string;
    type: "like" | "dislike" | "super_like";
    created_at: string;
}

export interface BackendMatch {
    id: string;
    user1_id: string;
    user2_id: string;
    created_at: string;
    last_message_at?: string;
}

export interface BackendMessage {
    id: string;
    match_id: string;
    sender_id: string;
    content: string;
    sent_at: string;
    read_at?: string;
}

// ============================================================================
// 📷 PHOTOS - Gestion des photos de profil
// ============================================================================

export interface BackendPhoto {
    id: string;
    user_id: string;
    url: string;
    is_primary: boolean;
    created_at: string;
}

export interface BackendPhotoUploadRequest {
    photo: File; // FormData
}

export interface BackendPhotoUploadResponse {
    url: string;
    id: string;
}

// ============================================================================
// 🏷️ INTERESTS - Centres d'intérêt
// ============================================================================

export interface BackendInterest {
    id: string;
    name: string;
    category?: string;
    created_at: string;
}

export interface BackendUserInterest {
    user_id: string;
    interest_id: string;
    created_at: string;
}

// ============================================================================
// 📊 DISCOVERY - Découverte de profils
// ============================================================================

export interface BackendDiscoveryRequest {
    limit?: number;
    offset?: number;
    max_distance?: number;
    min_age?: number;
    max_age?: number;
}

export interface BackendDiscoveryResponse {
    profiles: BackendProfile[];
    total: number;
    has_more: boolean;
}

// ============================================================================
// ⚡ API RESPONSES - Réponses standardisées
// ============================================================================

export interface BackendSuccessResponse<T = any> {
    success: true;
    data: T;
    message?: string;
}

export interface BackendErrorResponse {
    success: false;
    error: string;
    message: string;
    code?: string;
}

export interface BackendHealthResponse {
    status: "ok" | "error";
    service: string;
    timestamp: string;
    database?: string;
    version?: string;
    error?: string;
}

// ============================================================================
// 🔄 UTILITY TYPES - Types utilitaires
// ============================================================================

// Type pour les erreurs API standardisées
export type BackendResponse<T> = BackendSuccessResponse<T> | BackendErrorResponse;

// Types pour les validations
export type BackendGender = "male" | "female" | "other";
export type BackendInteractionType = "like" | "dislike" | "super_like";

// Type pour les endpoints de santé
export interface BackendServiceHealth {
    auth: BackendHealthResponse;
    profile: BackendHealthResponse;
    interactions: BackendHealthResponse;
}

// ============================================================================
// 📝 VALIDATION SCHEMAS - Contraintes de validation
// ============================================================================

export const BACKEND_CONSTRAINTS = {
    user: {
        first_name: { min: 1, max: 50 },
        last_name: { min: 1, max: 50 },
        email: { max: 255 },
        password: { min: 6, max: 128 }
    },
    profile: {
        height: { min: 100, max: 250 },
        occupation: { max: 100 },
        trait: { max: 1000 },
        profile_photo_url: { max: 500 }
    },
    preferences: {
        min_age: { min: 18, max: 100 },
        max_age: { min: 18, max: 100 },
        min_distance: { min: 1, max: 1000 },
        max_distance: { min: 1, max: 1000 }
    }
} as const;
