// Côte d'Ivoire localized data generators for fallback

export const generateLocalizedInterests = (): string[] => {
  return [
    // Loisirs populaires en Côte d'Ivoire
    'Football', 'Basketball', 'Musique', 'Danse', 'Cuisine', 'Voyages',
    'Lecture', 'Cinéma', 'Photographie', 'Art', 'Mode', 'Technologie',
    'Fitness', 'Yoga', 'Meditation', 'Nature', 'Randonnée', 'Plage',
    'Festivals', 'Culture africaine', 'Langues', 'Éducation',
    'Entrepreneuriat', 'Bénévolat', 'Musique traditionnelle',
    'Coupé-décalé', 'Zouglou', 'Reggae', 'Afrobeat'
  ];
};

export const generateLocalizedProfessions = (): string[] => {
  return [
    // Professions communes en Côte d'Ivoire
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

export const generateLocalizedEducationLevels = (): string[] => {
  return [
    'Aucun diplôme',
    'CEPE',
    'BEPC',
    'BAC',
    'BTS/DUT',
    'Licence',
    'Master',
    'Doctorat',
    'École professionnelle',
    'Formation technique',
    'Université',
    'Grande école'
  ];
};

export const generateLocalizedLocations = (): string[] => {
  return [
    // Principales villes de Côte d'Ivoire
    'Abidjan - Cocody', 'Abidjan - Plateau', 'Abidjan - Marcory',
    'Abidjan - Treichville', 'Abidjan - Adjamé', 'Abidjan - Yopougon',
    'Yamoussoukro', 'San-Pédro', 'Bouaké', 'Daloa', 'Korhogo',
    'Man', 'Divo', 'Gagnoa', 'Abengourou', 'Grand-Bassam',
    'Sassandra', 'Soubré', 'Agboville', 'Adzopé', 'Bondoukou'
  ];
};

export const getDefaultLookingForOptions = (): Array<{ value: string; label: string }> => {
  return [
    { value: 'serious', label: 'Relation sérieuse' },
    { value: 'casual', label: 'Relation décontractée' },
    { value: 'friends', label: 'Amitié' },
    { value: 'networking', label: 'Réseautage professionnel' },
    { value: 'unsure', label: 'Je ne sais pas encore' }
  ];
};

export const getDefaultGenderOptions = (): Array<{ value: string; label: string }> => {
  return [
    { value: 'male', label: 'Homme' },
    { value: 'female', label: 'Femme' },
    { value: 'non-binary', label: 'Non-binaire' },
    { value: 'other', label: 'Autre / Ne se prononce pas' }
  ];
};
