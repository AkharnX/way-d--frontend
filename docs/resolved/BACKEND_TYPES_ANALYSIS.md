# 📋 DÉFINITION DES TYPES DE DONNÉES - WAY-D BACKEND/FRONTEND

## 🎯 Problème Identifié
- **Incohérence des types** entre frontend et backend
- **Recréation de profils** à chaque connexion
- **Formats de données variables** dans le frontend
- **Mapping incorrect** des champs

## 📊 TYPES BACKEND OFFICIELS (Source de vérité)

### 👤 User (Service Auth - Port 8080)
```go
type User struct {
    ID         string    `json:"id" db:"id"`
    Email      string    `json:"email" db:"email"`
    FirstName  string    `json:"first_name" db:"first_name"`
    LastName   string    `json:"last_name" db:"last_name"`
    BirthDate  time.Time `json:"birth_date" db:"birth_date"`
    Gender     string    `json:"gender" db:"gender"` // "male", "female", "other"
    CreatedAt  time.Time `json:"created_at" db:"created_at"`
    UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`
}
```

### 🎭 Profile (Service Profile - Port 8081)
```go
type Profile struct {
    ID               string         `json:"id" db:"id"`
    UserID           string         `json:"user_id" db:"user_id"`
    Height           int            `json:"height" db:"height"`
    ProfilePhotoURL  string         `json:"profile_photo_url" db:"profile_photo_url"`
    Occupation       string         `json:"occupation" db:"occupation"`
    Trait            string         `json:"trait" db:"trait"` // Bio/Description
    Birthdate        time.Time      `json:"birthdate" db:"birthdate"`
    Location         geometry.Point `json:"location" db:"location"` // PostGIS Point
    Active           bool           `json:"active" db:"active"`
    LastActivityAt   time.Time      `json:"last_activity_at" db:"last_activity_at"`
    CreatedAt        time.Time      `json:"created_at" db:"created_at"`
    UpdatedAt        time.Time      `json:"updated_at" db:"updated_at"`
}
```

### 📍 Location Format (PostGIS)
```go
// Backend attend une structure Point
type Point struct {
    Lat float64 `json:"lat"`
    Lng float64 `json:"lng"`
}
```

### ⚙️ Preferences
```go
type Preference struct {
    UserID      string `json:"user_id" db:"user_id"`
    MinAge      int    `json:"min_age" db:"min_age"`
    MaxAge      int    `json:"max_age" db:"max_age"`
    MinDistance int    `json:"min_distance" db:"min_distance"`
    MaxDistance int    `json:"max_distance" db:"max_distance"`
}
```

## 🔄 MAPPING FRONTEND → BACKEND

### Registration Data
```typescript
// Frontend Registration Form → Backend API
{
  // User fields (POST /api/auth/register)
  first_name: string     → first_name: string
  last_name: string      → last_name: string
  email: string          → email: string
  password: string       → password: string
  gender: string         → gender: "male"|"female"|"other"
  birthdate: string      → birth_date: "2002-06-06T00:00:00Z"
  
  // Profile fields (PUT /api/profile/me)
  bio: string            → trait: string
  height: number         → height: int
  location: string       → location: {lat: float64, lng: float64}
  profession: string     → occupation: string
  birthdate: string      → birthdate: "2002-06-06T00:00:00Z"
}
```

### Profile Data
```typescript
// Backend Response → Frontend Display
{
  id: string             → id: string
  user_id: string        → user_id: string
  height: int            → height: number
  profile_photo_url: string → photos: [string]
  occupation: string     → profession: string
  trait: string          → bio: string
  birthdate: "2002-06-06T00:00:00Z" → age: number (calculated)
  location: {lat, lng}   → location: string (reverse geocoded)
  active: bool           → active: boolean
}
```

## ❌ ERREURS FRÉQUENTES IDENTIFIÉES

### 1. Champs Mal Mappés
- ❌ `bio` (frontend) → `trait` (backend) 
- ❌ `profession` (frontend) → `occupation` (backend)
- ❌ `photos` (frontend) → `profile_photo_url` (backend)

### 2. Formats Date Incorrects
- ❌ Frontend: `"2002-06-06"` 
- ✅ Backend: `"2002-06-06T00:00:00Z"`

### 3. Location Mal Formatée
- ❌ Frontend: `"Abidjan - Cocody"` (string)
- ✅ Backend: `{lat: 5.3474, lng: -3.9857}` (Point)

### 4. Gender Values Incorrects
- ❌ Frontend: `"man"`, `"woman"`
- ✅ Backend: `"male"`, `"female"`, `"other"`

## 🎯 CORRECTIONS NÉCESSAIRES

### 1. Unifier les Types TypeScript
```typescript
// Nouveau: types/backend.ts
export interface BackendUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  birth_date: string; // ISO format
  gender: "male" | "female" | "other";
  created_at: string;
  updated_at: string;
}

export interface BackendProfile {
  id: string;
  user_id: string;
  height: number;
  profile_photo_url: string;
  occupation: string;
  trait: string; // bio
  birthdate: string; // ISO format
  location: { lat: number; lng: number };
  active: boolean;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}
```

### 2. Transformateurs Bidirectionnels
```typescript
// utils/dataTransformers.ts
export const transformToBackend = (frontendData: any): BackendProfile => {
  return {
    height: frontendData.height,
    profile_photo_url: frontendData.photos?.[0] || "",
    occupation: frontendData.profession || frontendData.occupation,
    trait: frontendData.bio || frontendData.trait,
    birthdate: formatDateForBackend(frontendData.birthdate),
    location: geocodeLocation(frontendData.location),
    active: true
  };
};

export const transformFromBackend = (backendData: BackendProfile): Profile => {
  return {
    id: backendData.id,
    user_id: backendData.user_id,
    height: backendData.height,
    photos: [backendData.profile_photo_url].filter(Boolean),
    profession: backendData.occupation,
    bio: backendData.trait,
    age: calculateAge(backendData.birthdate),
    location: reverseGeocode(backendData.location),
    active: backendData.active
  };
};
```

### 3. Validation de Profile Existant
```typescript
// services/profileService.ts
export const checkProfileExists = async (): Promise<boolean> => {
  try {
    const response = await profileApi.get('/me');
    return response.status === 200 && response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return false; // Profile n'existe pas
    }
    throw error;
  }
};
```

## 🚨 ACTIONS REQUISES

1. **Créer types/backend.ts** - Types backend officiels
2. **Refactorer utils/dataTransformers.ts** - Transformations bidirectionnelles
3. **Corriger Register.tsx** - Mapping correct des données
4. **Fixer api.ts** - Logique de vérification de profil
5. **Nettoyer types/index.ts** - Supprimer les doublons
6. **Tester la création de profil** - Éviter la recréation

---

*Documentation créée pour résoudre les incohérences de types de données*
