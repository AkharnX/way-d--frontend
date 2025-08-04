// Données de localisation pour la Côte d'Ivoire
export const COTE_DIVOIRE_REGIONS = [
  {
    name: "Abidjan",
    districts: [
      "Abobo", "Adjamé", "Attécoubé", "Cocody", "Koumassi", 
      "Marcory", "Port-Bouët", "Treichville", "Yopougon", "Plateau"
    ]
  },
  {
    name: "Yamoussoukro", 
    districts: ["Centre-ville", "Habitat", "Millionnaire", "N'Zuessy"]
  },
  {
    name: "Bouaké",
    districts: ["Centre", "Gonfreville", "Koko", "Nimbo", "Sokoura"]
  },
  {
    name: "Daloa", 
    districts: ["Centre", "Lobia", "Tazibouo", "Gbeleban"]
  },
  {
    name: "San-Pédro",
    districts: ["Centre", "Bardo", "Balmer"]
  },
  {
    name: "Korhogo",
    districts: ["Centre", "Résidentiel", "Koko", "Petit Paris"]
  },
  {
    name: "Man",
    districts: ["Centre", "Libreville", "Domobly"]
  },
  {
    name: "Gagnoa",
    districts: ["Centre", "Dioulabougou", "Gnamangui"]
  },
  {
    name: "Divo",
    districts: ["Centre", "Hiré", "Zépréguhé"]
  },
  {
    name: "Abengourou",
    districts: ["Centre", "Sampa", "Ehania"]
  },
  {
    name: "Grand-Bassam",
    districts: ["Ancien Bassam", "Moossou", "Vitré"]
  },
  {
    name: "Sassandra",
    districts: ["Centre", "Drewin"]
  }
];

export const POPULAR_COTE_DIVOIRE_LOCATIONS = [
  "Abidjan - Cocody",
  "Abidjan - Plateau", 
  "Abidjan - Yopougon",
  "Abidjan - Marcory",
  "Abidjan - Treichville",
  "Yamoussoukro - Centre",
  "Bouaké - Centre",
  "Daloa - Centre",
  "San-Pédro - Centre",
  "Korhogo - Centre",
  "Man - Centre",
  "Grand-Bassam - Ancien Bassam"
];

// Coordonnées pour géolocalisation
export const COTE_DIVOIRE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'abidjan': { lat: 5.3600, lng: -4.0083 },
  'yamoussoukro': { lat: 6.8276, lng: -5.2893 },
  'bouake': { lat: 7.6884, lng: -5.0306 },
  'daloa': { lat: 6.8772, lng: -6.4503 },
  'san-pedro': { lat: 4.7467, lng: -6.6364 },
  'korhogo': { lat: 9.4581, lng: -5.6296 },
  'man': { lat: 7.4125, lng: -7.5544 },
  'gagnoa': { lat: 6.1316, lng: -5.9506 },
  'divo': { lat: 5.8397, lng: -5.3572 },
  'abengourou': { lat: 6.7294, lng: -3.4960 },
  'grand-bassam': { lat: 5.2111, lng: -3.7378 },
  'sassandra': { lat: 4.9500, lng: -6.0833 }
};

// Fonction pour obtenir la géolocalisation automatique
export const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Géolocalisation non supportée'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Erreur géolocalisation:', error);
        // Fallback vers Abidjan
        resolve(COTE_DIVOIRE_COORDINATES.abidjan);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

// Fonction pour trouver la ville la plus proche
export const findClosestCity = (lat: number, lng: number): string => {
  let closestCity = 'Abidjan';
  let minDistance = Infinity;

  Object.entries(COTE_DIVOIRE_COORDINATES).forEach(([city, coords]) => {
    const distance = Math.sqrt(
      Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestCity = city.charAt(0).toUpperCase() + city.slice(1);
    }
  });

  return closestCity;
};
