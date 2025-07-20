# 📸 Way-d - Gestion des Photos Utilisateur

## Solutions de Stockage des Photos

Actuellement, Way-d utilise des URLs pour les photos. Voici les options recommandées pour le stockage des photos :

### Option 1: Service Cloud (Recommandé)

#### Cloudinary (Gratuit + Payant)
```javascript
// Installation
npm install cloudinary

// Configuration
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'your_cloud_name',
  api_key: 'your_api_key',
  api_secret: 'your_api_secret'
});

// Upload depuis le frontend
const uploadPhoto = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'your_preset');
  
  const response = await fetch(
    'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload',
    { method: 'POST', body: formData }
  );
  
  const data = await response.json();
  return data.secure_url;
};
```

#### Amazon S3
```javascript
// Configuration avec AWS SDK
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'eu-west-1'
});
```

### Option 2: Stockage Local (Développement)

#### Structure des dossiers
```
way-d/
├── uploads/
│   ├── profiles/
│   │   ├── user_123/
│   │   │   ├── profile_1.jpg
│   │   │   ├── profile_2.jpg
│   │   │   └── ...
│   │   └── user_456/
│   └── temp/
```

#### Service de stockage local
```javascript
// services/fileStorage.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user.id;
    const uploadPath = `uploads/profiles/${userId}/`;
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile_' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Images seulement (jpeg, jpg, png, gif)'));
    }
  }
});
```

### Option 3: Base64 (Non Recommandé)

⚠️ **Attention** : Stockage en base64 non recommandé pour la production (taille des données, performance).

```javascript
// Conversion en base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};
```

## Implementation Actuelle dans Way-d

### Frontend - Upload de Photo
```tsx
// Dans CreateProfile.tsx et EditProfile.tsx
const [photoUrl, setPhotoUrl] = useState('');

const addPhoto = () => {
  if (photoUrl && !formData.photos.includes(photoUrl)) {
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, photoUrl]
    }));
    setPhotoUrl('');
  }
};

// Interface utilisateur
<input
  type="url"
  value={photoUrl}
  onChange={(e) => setPhotoUrl(e.target.value)}
  placeholder="URL de la photo"
/>
```

### Backend - API Photos (services/api.ts)
```typescript
export const profileService = {
  uploadPhoto: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await profileApi.post('/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deletePhoto: async (photoUrl: string): Promise<void> => {
    await profileApi.delete('/photo', { data: { photo_url: photoUrl } });
  },
};
```

## Recommandations

### Pour le Développement
1. **URLs externes** (Unsplash, Lorem Picsum) - Actuel ✅
2. **Stockage local** avec multer
3. **Cloudinary gratuit** (jusqu'à 25GB)

### Pour la Production
1. **Cloudinary** - Le plus simple à implémenter
2. **Amazon S3** - Le plus économique à grande échelle
3. **Google Cloud Storage** - Alternative solide

## URLs de Test Recommandées

```javascript
const testPhotos = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1494790108755-2616b612b287?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop'
];
```

## Sécurité

### Validation côté serveur
- Type de fichier (JPEG, PNG, GIF)
- Taille maximale (5MB recommandé)
- Scan antivirus pour la production
- Redimensionnement automatique

### Optimisation
- Compression d'images automatique
- Multiple formats (thumbnail, medium, full)
- CDN pour la distribution globale
- Cache headers appropriés

---

💡 **Conseil** : Commencez avec Cloudinary pour sa simplicité, puis migrez vers S3 si nécessaire.
