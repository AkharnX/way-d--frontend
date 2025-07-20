import React, { useState, useCallback } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  className?: string;
}

export default function PhotoUpload({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 6,
  className = '' 
}: PhotoUploadProps) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addPhoto = useCallback((url: string) => {
    if (!url) return;
    
    // Validation de l'URL
    try {
      new URL(url);
    } catch {
      setError('URL de photo invalide');
      return;
    }

    if (photos.includes(url)) {
      setError('Cette photo est déjà ajoutée');
      return;
    }

    if (photos.length >= maxPhotos) {
      setError(`Maximum ${maxPhotos} photos autorisées`);
      return;
    }

    onPhotosChange([...photos, url]);
    setPhotoUrl('');
    setError('');
  }, [photos, onPhotosChange, maxPhotos]);

  const removePhoto = useCallback((photoToRemove: string) => {
    onPhotosChange(photos.filter(photo => photo !== photoToRemove));
  }, [photos, onPhotosChange]);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      setError('Seules les images sont autorisées');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('La taille du fichier ne doit pas dépasser 5MB');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Ici, vous pouvez implémenter l'upload vers Cloudinary, S3, etc.
      // Pour l'instant, on convertit en URL locale pour démonstration
      const objectUrl = URL.createObjectURL(file);
      addPhoto(objectUrl);
    } catch (error) {
      setError('Erreur lors de l\'upload de la photo');
      console.error('Photo upload error:', error);
    } finally {
      setLoading(false);
    }
  }, [addPhoto]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const testPhotos = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108755-2616b612b287?w=300&h=300&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'
  ];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Upload className="w-4 h-4 inline mr-1" />
        Photos ({photos.length}/{maxPhotos})
      </label>
      
      {/* Photos actuelles */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative group">
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              className="w-full h-32 object-cover rounded-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x150?text=Photo';
              }}
            />
            <button
              type="button"
              onClick={() => removePhoto(photo)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Zone d'ajout de photo */}
      {photos.length < maxPhotos && (
        <div className="space-y-4">
          {/* Upload par URL */}
          <div className="flex gap-2">
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="URL de la photo"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => addPhoto(photoUrl)}
              disabled={!photoUrl || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Ajouter
            </button>
          </div>

          {/* Upload par fichier */}
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Cliquez pour sélectionner ou glissez une image
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPEG, PNG, GIF - Max 5MB
              </p>
            </label>
          </div>

          {/* Photos de test suggérées */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Photos de test suggérées:</p>
            <div className="flex flex-wrap gap-2">
              {testPhotos.map((photo, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addPhoto(photo)}
                  disabled={photos.includes(photo)}
                  className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-300 hover:border-blue-500 disabled:opacity-50"
                >
                  <img
                    src={photo}
                    alt={`Test ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {photos.includes(photo) && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages d'erreur */}
      {error && (
        <div className="flex items-center mt-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}

      {/* Indicateur de chargement */}
      {loading && (
        <div className="flex items-center mt-2 text-blue-600 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Upload en cours...
        </div>
      )}
    </div>
  );
}
