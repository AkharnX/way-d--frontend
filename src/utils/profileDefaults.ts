// Utilitaires pour les valeurs par défaut du profil adaptées au contexte ivoirien
import { configService } from '../services/configService';

export interface LocalizedDefaults {
  defaultAge: number;
  defaultHeight: number;
  defaultMinAge: number;
  defaultMaxAge: number;
  defaultMaxDistance: number;
  defaultBio: string[];
  defaultInterests: string[];
  suggestedLocations: string[];
}

// Valeurs par défaut contextualisées pour la Côte d'Ivoire
export const getLocalizedDefaults = async (): Promise<LocalizedDefaults> => {
  try {
    const config = await configService.getConfig();
    
    return {
      defaultAge: 25, // Âge moyen des utilisateurs d'applications de rencontre
      defaultHeight: 170, // Taille moyenne adaptée aux deux genres
      defaultMinAge: 20, // Âge minimum raisonnable
      defaultMaxAge: 35, // Âge maximum pour une recherche par défaut
      defaultMaxDistance: 25, // Distance raisonnable pour Abidjan/grandes villes
      defaultBio: [
        "Salut ! Je suis nouveau(elle) sur Way-d et j'ai hâte de faire de belles rencontres.",
        "Passionné(e) par la vie, j'aime découvrir de nouvelles personnes et partager de beaux moments.",
        "À la recherche de connexions authentiques dans la bonne humeur !",
        "Fan de culture ivoirienne, j'aime sortir, danser et profiter de la vie.",
        "Curieux(se) de nature, j'adore échanger et découvrir ce qui nous rend uniques."
      ],
      defaultInterests: config.defaultInterests,
      suggestedLocations: [
        'Abidjan - Cocody',
        'Abidjan - Plateau', 
        'Abidjan - Yopougon',
        'Abidjan - Marcory',
        'Abidjan - Treichville',
        'Abidjan - Abobo',
        'Abidjan - Adjamé',
        'Yamoussoukro',
        'Bouaké',
        'Daloa',
        'San-Pédro',
        'Korhogo',
        'Man'
      ]
    };
  } catch (error) {
    console.error('Error loading localized defaults:', error);
    
    // Fallback vers des valeurs statiques mais réalistes
    return {
      defaultAge: 25,
      defaultHeight: 170,
      defaultMinAge: 20,
      defaultMaxAge: 35,
      defaultMaxDistance: 25,
      defaultBio: [
        "Nouveau(elle) sur Way-d, prêt(e) pour de belles rencontres !",
        "À la recherche de connexions authentiques."
      ],
      defaultInterests: [
        'Voyage', 'Sport', 'Cinéma', 'Musique', 'Lecture', 'Cuisine',
        'Danse', 'Fitness', 'Football', 'Afrobeat'
      ],
      suggestedLocations: [
        'Abidjan - Cocody',
        'Abidjan - Plateau',
        'Yamoussoukro',
        'Bouaké'
      ]
    };
  }
};

// Générer une bio par défaut aléatoire
export const getRandomDefaultBio = async (): Promise<string> => {
  const defaults = await getLocalizedDefaults();
  const randomIndex = Math.floor(Math.random() * defaults.defaultBio.length);
  return defaults.defaultBio[randomIndex];
};

// Calculer un âge réaliste basé sur la date de naissance
export const calculateRealisticAge = (birthDate: string): number => {
  try {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    // Vérifier que l'âge est dans une plage raisonnable
    if (age < 18) age = 18;
    if (age > 80) age = 25; // Valeur par défaut si l'âge semble incorrect
    
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return 25; // Valeur par défaut
  }
};

// Suggérer des intérêts basés sur l'âge et la localisation
export const suggestInterestsByContext = async (age: number, location?: string): Promise<string[]> => {
  const defaults = await getLocalizedDefaults();
  let suggestions = [...defaults.defaultInterests];
  
  // Adapter les suggestions selon l'âge
  if (age < 25) {
    suggestions = [
      'Gaming', 'Réseaux sociaux', 'TikTok', 'Sport', 'Musique', 
      'Danse', 'Mode', 'Photographie', ...suggestions
    ].slice(0, 12);
  } else if (age > 30) {
    suggestions = [
      'Entrepreneuriat', 'Cuisine', 'Lecture', 'Voyage', 'Art',
      'Développement personnel', 'Famille', ...suggestions
    ].slice(0, 12);
  }
  
  // Adapter selon la localisation (si fournie)
  if (location?.toLowerCase().includes('abidjan')) {
    suggestions = ['Plage', 'Nightlife', 'Shopping', ...suggestions].slice(0, 12);
  }
  
  return [...new Set(suggestions)]; // Supprimer les doublons
};

// Suggérer une taille réaliste basée sur le genre et la région
export const suggestRealisticHeight = (gender: 'male' | 'female' | 'other'): number => {
  // Basé sur les statistiques moyennes en Côte d'Ivoire
  if (gender === 'male') {
    return 175; // Taille moyenne des hommes
  } else if (gender === 'female') {
    return 165; // Taille moyenne des femmes
  }
  return 170; // Valeur neutre
};

// Suggérer des préférences par défaut basées sur l'âge
export const suggestDefaultPreferences = async (userAge: number) => {
  const defaults = await getLocalizedDefaults();
  
  return {
    min_age: Math.max(18, userAge - 5),
    max_age: Math.min(80, userAge + 10),
    max_distance: defaults.defaultMaxDistance
  };
};
