/**
 * 🔄 TRANSFORMATEURS DE DONNÉES - WAY-D
 * 
 * Conversion bidirectionnelle entre les formats frontend et backend.
 * Résout les problèmes d'incohérence de types et de mapping.
 */

import type { Profile, User } from '../types';
import type {
    BackendLocation,
    BackendProfile,
    BackendProfileCreateRequest,
    BackendRegisterRequest,
    BackendUser
} from '../types/backend';

// ============================================================================
// 📍 HELPERS - Utilitaires de transformation
// ============================================================================

/**
 * Convertit une date en format YYYY-MM-DD pour le backend
 */
export const formatDateForBackend = (dateString: string): string => {
    if (!dateString) {
        // Retourner une date par défaut valide (il y a 25 ans)
        const defaultDate = new Date();
        defaultDate.setFullYear(defaultDate.getFullYear() - 25);
        return defaultDate.toISOString().split('T')[0];
    }

    // Si c'est déjà au format YYYY-MM-DD, retourner tel quel
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }

    // Si c'est un format ISO complet, extraire juste la date
    if (dateString.includes('T')) {
        return dateString.split('T')[0];
    }

    // Essayer de parser et formater
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            // Date invalide, retourner une date par défaut
            const defaultDate = new Date();
            defaultDate.setFullYear(defaultDate.getFullYear() - 25);
            return defaultDate.toISOString().split('T')[0];
        }
        return date.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error formatting date:', error);
        // Fallback vers une date par défaut
        const defaultDate = new Date();
        defaultDate.setFullYear(defaultDate.getFullYear() - 25);
        return defaultDate.toISOString().split('T')[0];
    }
};

/**
 * Calcule l'âge à partir d'une date de naissance
 */
export const calculateAge = (birthdate: string): number => {
    try {
        const birth = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        // Validation de l'âge
        return age >= 16 && age <= 100 ? age : 25;
    } catch (error) {
        console.error('Error calculating age:', error);
        return 25; // Âge par défaut
    }
};

/**
 * Convertit une localisation string en coordonnées
 */
export const geocodeLocation = async (locationString: string): Promise<BackendLocation> => {
    // Mapping des villes de Côte d'Ivoire
    const locationMap: { [key: string]: BackendLocation } = {
        // Abidjan et communes
        'abidjan': { lat: 5.3600, lng: -4.0083 },
        'abidjan-cocody': { lat: 5.3474, lng: -3.9857 },
        'abidjan-plateau': { lat: 5.3189, lng: -4.0245 },
        'abidjan-yopougon': { lat: 5.3364, lng: -4.0822 },
        'abidjan-marcory': { lat: 5.2909, lng: -3.9827 },
        'abidjan-treichville': { lat: 5.2947, lng: -4.0030 },
        'abidjan-abobo': { lat: 5.4167, lng: -4.0167 },
        'abidjan-adjame': { lat: 5.3667, lng: -4.0167 },
        'abidjan-koumassi': { lat: 5.2833, lng: -3.9667 },
        'abidjan-port-bouet': { lat: 5.2500, lng: -3.9167 },

        // Autres villes importantes
        'yamoussoukro': { lat: 6.8276, lng: -5.2893 },
        'bouake': { lat: 7.6884, lng: -5.0306 },
        'daloa': { lat: 6.8772, lng: -6.4503 },
        'san-pedro': { lat: 4.7467, lng: -6.6364 },
        'korhogo': { lat: 9.4581, lng: -5.6296 },
        'man': { lat: 7.4125, lng: -7.5544 },
        'gagnoa': { lat: 6.1316, lng: -5.9506 },
        'divo': { lat: 5.8397, lng: -5.3572 },
        'abengourou': { lat: 6.7294, lng: -3.4960 },
        'grand-bassam': { lat: 5.2111, lng: -3.7378 }
    };

    // Normaliser la chaîne de localisation
    const normalized = locationString.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    // Chercher une correspondance exacte d'abord
    if (locationMap[normalized]) {
        return locationMap[normalized];
    }

    // Chercher une correspondance partielle
    for (const [key, coords] of Object.entries(locationMap)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return coords;
        }
    }

    // Fallback vers Abidjan-Cocody
    console.warn(`Location "${locationString}" not found, using Abidjan-Cocody as fallback`);
    return locationMap['abidjan-cocody'];
};

/**
 * Convertit des coordonnées en nom de ville
 */
export const reverseGeocode = (location: BackendLocation): string => {
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        return 'Abidjan - Cocody';
    }

    const { lat, lng } = location;

    // Locations avec tolérance pour le reverse geocoding
    const locations = [
        { name: 'Abidjan - Cocody', lat: 5.3474, lng: -3.9857, tolerance: 0.05 },
        { name: 'Abidjan - Plateau', lat: 5.3189, lng: -4.0245, tolerance: 0.05 },
        { name: 'Abidjan - Yopougon', lat: 5.3364, lng: -4.0822, tolerance: 0.05 },
        { name: 'Abidjan - Marcory', lat: 5.2909, lng: -3.9827, tolerance: 0.05 },
        { name: 'Abidjan - Treichville', lat: 5.2947, lng: -4.0030, tolerance: 0.05 },
        { name: 'Abidjan', lat: 5.3600, lng: -4.0083, tolerance: 0.1 },
        { name: 'Yamoussoukro', lat: 6.8276, lng: -5.2893, tolerance: 0.1 },
        { name: 'Bouaké', lat: 7.6884, lng: -5.0306, tolerance: 0.1 },
        { name: 'Daloa', lat: 6.8772, lng: -6.4503, tolerance: 0.1 },
        { name: 'San-Pédro', lat: 4.7467, lng: -6.6364, tolerance: 0.1 },
        { name: 'Korhogo', lat: 9.4581, lng: -5.6296, tolerance: 0.1 },
        { name: 'Man', lat: 7.4125, lng: -7.5544, tolerance: 0.1 }
    ];

    // Trouver la ville la plus proche
    for (const city of locations) {
        if (Math.abs(lat - city.lat) < city.tolerance &&
            Math.abs(lng - city.lng) < city.tolerance) {
            return city.name;
        }
    }

    // Si aucune correspondance, retourner les coordonnées
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};

/**
 * Normalise les valeurs de genre
 */
export const normalizeGender = (gender: string): "male" | "female" | "other" => {
    const normalized = gender.toLowerCase();

    if (normalized === 'man' || normalized === 'homme' || normalized === 'male') {
        return 'male';
    }
    if (normalized === 'woman' || normalized === 'femme' || normalized === 'female') {
        return 'female';
    }
    return 'other';
};

// ============================================================================
// 🔄 TRANSFORMATEURS PRINCIPAUX
// ============================================================================

/**
 * Frontend Registration Data → Backend Register Request
 */
export const transformRegistrationForBackend = async (frontendData: any): Promise<BackendRegisterRequest> => {
    return {
        first_name: frontendData.first_name?.trim() || '',
        last_name: frontendData.last_name?.trim() || '',
        email: frontendData.email?.toLowerCase().trim() || '',
        password: frontendData.password || '',
        gender: normalizeGender(frontendData.gender || 'other'),
        birth_date: formatDateForBackend(frontendData.birthdate || frontendData.birth_date)
    };
};

/**
 * Frontend Profile Data → Backend Profile Create Request
 */
export const transformProfileForBackend = async (frontendData: any): Promise<BackendProfileCreateRequest> => {
    const location = await geocodeLocation(frontendData.location || 'Abidjan - Cocody');

    return {
        height: parseInt(frontendData.height as string) || 170,
        profile_photo_url: frontendData.photos?.[0] || frontendData.profile_photo_url || '',
        occupation: frontendData.profession || frontendData.occupation || '',
        trait: frontendData.bio || frontendData.trait || '',
        birthdate: formatDateForBackend(frontendData.birthdate || frontendData.birth_date),
        location: location,
        active: true
    };
};

/**
 * Backend User → Frontend User
 */
export const transformUserFromBackend = (backendUser: BackendUser): User => {
    return {
        id: backendUser.id,
        email: backendUser.email,
        first_name: backendUser.first_name,
        last_name: backendUser.last_name,
        birth_date: backendUser.birth_date,
        gender: backendUser.gender as 'male' | 'female' | 'other',
        created_at: backendUser.created_at,
        updated_at: backendUser.updated_at
    };
};

/**
 * Backend Profile → Frontend Profile
 */
export const transformProfileFromBackend = (backendProfile: BackendProfile, userData?: BackendUser): Profile => {
    const age = calculateAge(backendProfile.birthdate);
    const location = reverseGeocode(backendProfile.location);

    return {
        id: backendProfile.id,
        user_id: backendProfile.user_id,
        height: backendProfile.height,
        profile_photo_url: backendProfile.profile_photo_url,
        location: location,
        occupation: backendProfile.occupation,
        trait: backendProfile.trait,
        last_activity_at: backendProfile.last_activity_at,
        created_at: backendProfile.created_at,
        updated_at: backendProfile.updated_at,
        active: backendProfile.active,
        birthdate: backendProfile.birthdate,

        // Frontend compatibility fields
        first_name: userData?.first_name || '',
        last_name: userData?.last_name || '',
        age: age,
        bio: backendProfile.trait,
        profession: backendProfile.occupation,
        photos: backendProfile.profile_photo_url ? [backendProfile.profile_photo_url] : [],
        interests: [], // À charger séparément
        looking_for: 'serious', // Valeur par défaut
        distance: 0 // À calculer selon contexte
    };
};

/**
 * Combine User + Profile data from backend
 */
export const combineUserAndProfile = (userData: BackendUser, profileData: BackendProfile): Profile => {
    return transformProfileFromBackend(profileData, userData);
};

// ============================================================================
// 🔍 VALIDATION HELPERS
// ============================================================================

/**
 * Valide les données avant transformation vers le backend
 */
export const validateForBackend = (data: any, type: 'user' | 'profile'): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (type === 'user') {
        if (!data.first_name?.trim()) errors.push('Prénom requis');
        if (!data.last_name?.trim()) errors.push('Nom requis');
        if (!data.email?.trim()) errors.push('Email requis');
        if (!/\S+@\S+\.\S+/.test(data.email || '')) errors.push('Email invalide');
        if (!data.password || data.password.length < 6) errors.push('Mot de passe trop court');
        if (!data.birthdate && !data.birth_date) errors.push('Date de naissance requise');
        if (!['male', 'female', 'other', 'man', 'woman'].includes(data.gender)) errors.push('Genre invalide');
    }

    if (type === 'profile') {
        if (!data.bio?.trim() && !data.trait?.trim()) errors.push('Description requise');
        if (!data.location?.trim()) errors.push('Localisation requise');
        if (!data.profession?.trim() && !data.occupation?.trim()) errors.push('Profession requise');
        if (data.height && (data.height < 100 || data.height > 250)) errors.push('Taille invalide');
    }

    return { valid: errors.length === 0, errors };
};

/**
 * Debug helper pour voir les transformations
 */
export const debugTransformation = (original: any, transformed: any, direction: string) => {
    if (process.env.NODE_ENV === 'development') {
        console.group(`🔄 Data Transformation: ${direction}`);
        console.log('Original:', original);
        console.log('Transformed:', transformed);
        console.groupEnd();
    }
};
