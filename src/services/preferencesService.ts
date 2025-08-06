// Service pour les préférences utilisateur avec données dynamiques
import { configService } from './configService';

export interface UserPreferences {
  min_age: number;
  max_age: number;
  min_distance: number;
  max_distance: number;
  looking_for: string[];
  interests_filter: string[];
  gender_preference: string;
}

export interface PreferenceOptions {
  ageRanges: Array<{ value: number; label: string }>;
  distanceRanges: Array<{ value: number; label: string }>;
  genderOptions: Array<{ value: string; label: string }>;
  lookingForOptions: Array<{ value: string; label: string }>;
}

class PreferencesService {
  private cachedOptions: PreferenceOptions | null = null;

  // Récupérer les options de préférences depuis la configuration
  async getPreferenceOptions(): Promise<PreferenceOptions> {
    if (this.cachedOptions) {
      return this.cachedOptions;
    }

    try {
      const config = await configService.getConfig();
      
      this.cachedOptions = {
        ageRanges: config.preferences.ageRanges,
        distanceRanges: config.preferences.distanceRanges,
        genderOptions: config.defaultGenderOptions,
        lookingForOptions: config.defaultLookingForOptions
      };

      return this.cachedOptions;
    } catch (error) {
      console.error('Error loading preference options:', error);
      
      // Fallback vers des options par défaut
      this.cachedOptions = {
        ageRanges: [
          { value: 18, label: '18 ans' },
          { value: 25, label: '25 ans' },
          { value: 30, label: '30 ans' },
          { value: 35, label: '35 ans' },
          { value: 40, label: '40 ans' },
          { value: 50, label: '50 ans' },
          { value: 60, label: '60+ ans' }
        ],
        distanceRanges: [
          { value: 5, label: '5 km' },
          { value: 10, label: '10 km' },
          { value: 25, label: '25 km' },
          { value: 50, label: '50 km' },
          { value: 100, label: '100 km' },
          { value: 500, label: '500+ km' }
        ],
        genderOptions: [
          { value: 'male', label: 'Homme' },
          { value: 'female', label: 'Femme' },
          { value: 'other', label: 'Autre' }
        ],
        lookingForOptions: [
          { value: 'serious', label: 'Relation sérieuse' },
          { value: 'casual', label: 'Relation décontractée' },
          { value: 'friends', label: 'Amitié' }
        ]
      };

      return this.cachedOptions;
    }
  }

  // Suggérer des préférences par défaut basées sur l'utilisateur
  async suggestDefaultPreferences(userAge: number, userGender: string): Promise<Partial<UserPreferences>> {
    try {
      return {
        min_age: Math.max(18, userAge - 5),
        max_age: Math.min(65, userAge + 10),
        min_distance: 5,
        max_distance: 50,
        gender_preference: userGender === 'male' ? 'female' : 
                          userGender === 'female' ? 'male' : 'any',
        looking_for: ['serious'],
        interests_filter: []
      };
    } catch (error) {
      console.error('Error suggesting preferences:', error);
      return {
        min_age: 20,
        max_age: 35,
        min_distance: 5,
        max_distance: 25
      };
    }
  }

  // Valider les préférences utilisateur
  validatePreferences(preferences: Partial<UserPreferences>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (preferences.min_age && preferences.max_age) {
      if (preferences.min_age >= preferences.max_age) {
        errors.push('L\'âge minimum doit être inférieur à l\'âge maximum');
      }
      if (preferences.min_age < 18) {
        errors.push('L\'âge minimum doit être d\'au moins 18 ans');
      }
    }

    if (preferences.min_distance && preferences.max_distance) {
      if (preferences.min_distance >= preferences.max_distance) {
        errors.push('La distance minimum doit être inférieure à la distance maximum');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Nettoyer le cache
  clearCache(): void {
    this.cachedOptions = null;
  }
}

export const preferencesService = new PreferencesService();
