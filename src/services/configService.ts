// Service de configuration dynamique pour l'application Way-d
export interface AppConfig {
  version: string;
  buildDate: string;
  environment: string;
  features: {
    notifications: boolean;
    analytics: boolean;
    premium: boolean;
    events: boolean;
  };
  limits: {
    maxPhotos: number;
    maxInterests: number;
    maxBio: number;
    freeSwipesPerDay: number;
  };
  contact: {
    supportEmail: string;
    helpUrl: string;
    privacyUrl: string;
    bugReportUrl: string;
  };
  // Nouvelles propriétés pour les données dynamiques
  defaultInterests: string[];
  defaultProfessions: string[];
  defaultEducationLevels: string[];
  defaultLookingForOptions: Array<{ value: string; label: string }>;
  defaultGenderOptions: Array<{ value: string; label: string }>;
  preferences: {
    ageRanges: Array<{ value: number; label: string }>;
    distanceRanges: Array<{ value: number; label: string }>;
  };
}

class ConfigService {
  private config: AppConfig | null = null;

  // Configuration par défaut
  private defaultConfig: AppConfig = {
    version: '1.0.0',
    buildDate: new Date().toISOString().split('T')[0],
    environment: 'development',
    features: {
      notifications: true,
      analytics: true,
      premium: true,
      events: true,
    },
    limits: {
      maxPhotos: 6,
      maxInterests: 10,
      maxBio: 500,
      freeSwipesPerDay: 10,
    },
    contact: {
      supportEmail: 'support@way-d.com',
      helpUrl: 'https://way-d.com/help',
      privacyUrl: 'https://way-d.com/privacy',
      bugReportUrl: 'https://way-d.com/bug-report',
    },
    // Nouvelles données par défaut intelligentes
    defaultInterests: [
      'Voyage', 'Sport', 'Cinéma', 'Musique', 'Lecture', 'Cuisine', 'Art',
      'Technologie', 'Nature', 'Photographie', 'Danse', 'Fitness', 'Gaming',
      'Mode', 'Entrepreneuriat', 'Yoga', 'Randonnée', 'Plage', 'Festival'
    ],
    defaultProfessions: [
      'Étudiant(e)', 'Ingénieur(e)', 'Médecin', 'Professeur(e)', 'Commercial(e)',
      'Artiste', 'Entrepreneur(e)', 'Avocat(e)', 'Infirmier(e)', 'Architecte',
      'Designer', 'Développeur(euse)', 'Marketing', 'Consultant(e)',
      'Journaliste', 'Banquier(e)', 'Pharmacien(ne)', 'Autre'
    ],
    defaultEducationLevels: [
      'Collège', 'Lycée', 'Bac+2', 'Bac+3', 'Bac+5', 'Master', 'Doctorat',
      'École de commerce', 'École d\'ingénieur', 'Formation professionnelle', 'Autre'
    ],
    defaultLookingForOptions: [
      { value: 'serious', label: 'Relation sérieuse' },
      { value: 'casual', label: 'Relation décontractée' },
      { value: 'friends', label: 'Amitié' },
      { value: 'networking', label: 'Réseautage professionnel' },
      { value: 'unsure', label: 'Je ne sais pas encore' }
    ],
    defaultGenderOptions: [
      { value: 'male', label: 'Homme' },
      { value: 'female', label: 'Femme' },
      { value: 'non-binary', label: 'Non-binaire' },
      { value: 'other', label: 'Autre / Ne se prononce pas' }
    ],
    preferences: {
      ageRanges: [
        { value: 18, label: '18 ans' }, { value: 21, label: '21 ans' },
        { value: 25, label: '25 ans' }, { value: 30, label: '30 ans' },
        { value: 35, label: '35 ans' }, { value: 40, label: '40 ans' },
        { value: 45, label: '45 ans' }, { value: 50, label: '50 ans' },
        { value: 60, label: '60 ans' }, { value: 70, label: '70+ ans' }
      ],
      distanceRanges: [
        { value: 1, label: '1 km' }, { value: 5, label: '5 km' },
        { value: 10, label: '10 km' }, { value: 25, label: '25 km' },
        { value: 50, label: '50 km' }, { value: 100, label: '100 km' },
        { value: 200, label: '200 km' }, { value: 500, label: '500+ km' }
      ]
    }
  };

  async getConfig(): Promise<AppConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      // Try to load config from backend
      // TODO: Implement when admin/config endpoint is ready
      // const response = await adminApi.get('/config/app');
      // this.config = response.data;

      // For now, merge environment variables with defaults
      this.config = {
        ...this.defaultConfig,
        version: import.meta.env.VITE_APP_VERSION || this.defaultConfig.version,
        buildDate: import.meta.env.VITE_BUILD_DATE || this.defaultConfig.buildDate,
        environment: import.meta.env.NODE_ENV || this.defaultConfig.environment,
        features: {
          ...this.defaultConfig.features,
          analytics: import.meta.env.VITE_ANALYTICS_ENABLED !== 'false',
          premium: import.meta.env.VITE_PREMIUM_ENABLED !== 'false',
        },
      };

      return this.config;
    } catch (error) {
      console.debug('Using default configuration (backend config not available)');
      this.config = this.defaultConfig;
      return this.config;
    }
  }

  async getVersion(): Promise<string> {
    const config = await this.getConfig();
    return config.version;
  }

  async getBuildDate(): Promise<string> {
    const config = await this.getConfig();
    return config.buildDate;
  }

  async getEnvironment(): Promise<string> {
    const config = await this.getConfig();
    return config.environment;
  }

  async getFeatures(): Promise<AppConfig['features']> {
    const config = await this.getConfig();
    return config.features;
  }

  async getLimits(): Promise<AppConfig['limits']> {
    const config = await this.getConfig();
    return config.limits;
  }

  async getContactInfo(): Promise<AppConfig['contact']> {
    const config = await this.getConfig();
    return config.contact;
  }

  // Invalider le cache pour forcer le rechargement
  invalidateCache(): void {
    this.config = null;
  }

  // Nouvelles méthodes pour récupérer les données dynamiques
  async getDefaultInterests(): Promise<string[]> {
    const config = await this.getConfig();
    return config.defaultInterests;
  }

  async getDefaultProfessions(): Promise<string[]> {
    const config = await this.getConfig();
    return config.defaultProfessions;
  }

  async getDefaultEducationLevels(): Promise<string[]> {
    const config = await this.getConfig();
    return config.defaultEducationLevels;
  }

  async getDefaultLookingForOptions(): Promise<Array<{ value: string; label: string }>> {
    const config = await this.getConfig();
    return config.defaultLookingForOptions;
  }

  async getDefaultGenderOptions(): Promise<Array<{ value: string; label: string }>> {
    const config = await this.getConfig();
    return config.defaultGenderOptions;
  }

  async getPreferenceRanges(): Promise<{ ageRanges: Array<{ value: number; label: string }>; distanceRanges: Array<{ value: number; label: string }> }> {
    const config = await this.getConfig();
    return config.preferences;
  }
}

export const configService = new ConfigService();
