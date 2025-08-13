/**
 * Utilitaires pour normaliser les types de données de profil
 * entre les différentes pages et le backend
 */

export interface NormalizedProfileData {
    // Champs communs normalisés
    first_name: string;
    last_name: string;
    bio: string;
    age: number;
    height: number;
    location: string;
    interests: string[];
    photos: string[];
    looking_for: 'serious' | 'casual' | 'friends' | 'unsure';
    education: string;
    profession: string;
}

export interface BackendProfileData {
    // Format backend
    height?: number;
    profile_photo_url?: string;
    location?: string;
    occupation?: string;
    trait?: string;
    birthdate?: string;
    first_name?: string;
    last_name?: string;
    age?: number;
    bio?: string;
    profession?: string;
    education?: string;
    photos?: string[];
    interests?: string[];
    looking_for?: string;
}

/**
 * Convertit les données de profil du backend vers le format normalisé
 */
export const normalizeBackendProfile = (backendProfile: BackendProfileData): NormalizedProfileData => {
    return {
        first_name: backendProfile.first_name || '',
        last_name: backendProfile.last_name || '',
        bio: backendProfile.bio || backendProfile.trait || '',
        age: backendProfile.age || (backendProfile.birthdate ?
            new Date().getFullYear() - new Date(backendProfile.birthdate).getFullYear() : 25),
        height: backendProfile.height || 170,
        location: backendProfile.location || '',
        interests: backendProfile.interests || [],
        photos: backendProfile.photos || (backendProfile.profile_photo_url ? [backendProfile.profile_photo_url] : []),
        looking_for: (backendProfile.looking_for as any) || 'serious',
        education: backendProfile.education || '',
        profession: backendProfile.profession || backendProfile.occupation || ''
    };
};

/**
 * Convertit les données normalisées vers le format backend
 */
export const formatForBackend = (normalizedData: NormalizedProfileData): BackendProfileData => {
    return {
        first_name: normalizedData.first_name,
        last_name: normalizedData.last_name,
        bio: normalizedData.bio,
        trait: normalizedData.bio, // Alias pour le backend
        age: normalizedData.age,
        height: normalizedData.height,
        location: normalizedData.location,
        interests: normalizedData.interests,
        photos: normalizedData.photos,
        profile_photo_url: normalizedData.photos[0] || undefined,
        looking_for: normalizedData.looking_for,
        education: normalizedData.education,
        profession: normalizedData.profession,
        occupation: normalizedData.profession // Alias pour le backend
    };
};

/**
 * Vérifie si un profil est complet selon nos critères
 */
export const isProfileComplete = (profile: BackendProfileData | NormalizedProfileData): boolean => {
    // Normaliser d'abord si c'est un profil backend
    const normalized = 'trait' in profile ? normalizeBackendProfile(profile as BackendProfileData) : profile as NormalizedProfileData;

    // Critères minimum pour un profil complet
    return !!(
        normalized.first_name &&
        normalized.last_name &&
        normalized.bio &&
        normalized.age >= 18 &&
        normalized.height > 0 &&
        normalized.location
    );
};

/**
 * Valide et corrige les données de profil pour éviter les erreurs de type
 */
export const validateAndFixProfileData = (data: Partial<NormalizedProfileData>): NormalizedProfileData => {
    return {
        first_name: typeof data.first_name === 'string' ? data.first_name.trim() : '',
        last_name: typeof data.last_name === 'string' ? data.last_name.trim() : '',
        bio: typeof data.bio === 'string' ? data.bio.trim() : '',
        age: typeof data.age === 'number' && data.age >= 18 ? data.age : 25,
        height: typeof data.height === 'number' && data.height > 0 ? data.height : 170,
        location: typeof data.location === 'string' ? data.location.trim() : '',
        interests: Array.isArray(data.interests) ? data.interests.filter(i => typeof i === 'string') : [],
        photos: Array.isArray(data.photos) ? data.photos.filter(p => typeof p === 'string' && p.trim()) : [],
        looking_for: ['serious', 'casual', 'friends', 'unsure'].includes(data.looking_for as string)
            ? data.looking_for as any : 'serious',
        education: typeof data.education === 'string' ? data.education.trim() : '',
        profession: typeof data.profession === 'string' ? data.profession.trim() : ''
    };
};

/**
 * Fusionne les données de localStorage avec les données du formulaire
 */
export const mergeProfileDataSources = (
    formData: Partial<NormalizedProfileData>,
    localStorageData?: string | null,
    backendData?: BackendProfileData
): NormalizedProfileData => {
    let merged: Partial<NormalizedProfileData> = {};

    // 1. Commencer avec les données backend si disponibles
    if (backendData) {
        merged = normalizeBackendProfile(backendData);
    }

    // 2. Fusionner avec les données de localStorage (de l'inscription)
    if (localStorageData) {
        try {
            const parsedData = JSON.parse(localStorageData);
            merged = {
                ...merged,
                ...parsedData,
                // Normaliser les champs spéciaux
                profession: parsedData.occupation || parsedData.profession || merged.profession,
                photos: Array.isArray(parsedData.photos) ? parsedData.photos : merged.photos
            };
        } catch (error) {
            console.warn('Erreur lors du parsing des données localStorage:', error);
        }
    }

    // 3. Appliquer les données du formulaire par-dessus
    merged = { ...merged, ...formData };

    // 4. Valider et corriger
    return validateAndFixProfileData(merged);
};
