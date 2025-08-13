import React, { useState, useCallback } from 'react';
import { Upload, X, AlertCircle, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import { 
  validateImageFile, 
  processImageMultipleSizes, 
  generatePresignedUrl,
  uploadWithPresignedUrl,
  type ProcessedImage
} from '../utils/imageUtils';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  className?: string;
  enableAdvancedProcessing?: boolean;
}

export default function PhotoUpload({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 6,
  className = '',
  enableAdvancedProcessing = true
}: PhotoUploadProps) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);

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
    const fileId = `${Date.now()}-${file.name}`;
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    // Show warnings if any
    if (validation.warnings.length > 0) {
      console.warn('Image warnings:', validation.warnings);
    }

    if (photos.length >= maxPhotos) {
      setError(`Maximum ${maxPhotos} photos autorisées`);
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress({ ...uploadProgress, [fileId]: 0 });

    try {
      if (enableAdvancedProcessing) {
        // Advanced processing with multiple sizes
        setUploadProgress({ ...uploadProgress, [fileId]: 20 });
        
        // Process image into multiple sizes
        const processed = await processImageMultipleSizes(file);
        setProcessedImages(prev => [...prev, ...processed]);
        
        setUploadProgress({ ...uploadProgress, [fileId]: 60 });
        
        // Generate presigned URL for the original size
        const originalImage = processed.find(p => p.size.suffix === '') || processed[0];
        const { uploadUrl, viewUrl } = await generatePresignedUrl(originalImage.file.name);
        
        setUploadProgress({ ...uploadProgress, [fileId]: 80 });
        
        // Upload using presigned URL
        const uploadResult = await uploadWithPresignedUrl(originalImage.file, uploadUrl);
        
        if (uploadResult.success) {
          // Use the view URL for display
          onPhotosChange([...photos, viewUrl]);
          setUploadProgress({ ...uploadProgress, [fileId]: 100 });
          
          // Clean up progress after successful upload
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[fileId];
              return newProgress;
            });
          }, 2000);
        } else {
          throw new Error(uploadResult.error || 'Upload failed');
        }
      } else {
        // Simple processing (for backward compatibility)
        const objectUrl = URL.createObjectURL(file);
        onPhotosChange([...photos, objectUrl]);
      }
    } catch (error) {
      setError('Erreur lors de l\'upload de la photo');
      console.error('Photo upload error:', error);
      
      // Clean up failed upload progress
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
    } finally {
      setLoading(false);
    }
  }, [photos, onPhotosChange, maxPhotos, enableAdvancedProcessing, uploadProgress]);

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
        {enableAdvancedProcessing && (
          <span className="ml-2 text-xs text-green-600">
            ✓ Optimisation avancée activée
          </span>
        )}
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
            {/* Verification badge for uploaded photos */}
            <div className="absolute bottom-1 left-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
              <Check className="w-3 h-3" />
            </div>
          </div>
        ))}
      </div>

      {/* Upload progress indicators */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mb-4 space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-2 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
              <div className="text-xs text-gray-600 mt-1">
                Upload en cours... {progress}%
              </div>
            </div>
          ))}
        </div>
      )}

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
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="photo-upload"
              disabled={loading}
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              {loading ? (
                <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              )}
              <p className="text-sm text-gray-600">
                {loading ? 'Traitement en cours...' : 'Cliquez pour sélectionner ou glissez une image'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPEG, PNG, WebP - Max 10MB
                {enableAdvancedProcessing && ' - Optimisation automatique'}
              </p>
            </label>
          </div>

          {/* Advanced processing info */}
          {enableAdvancedProcessing && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <ImageIcon className="w-5 h-5 text-green-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-green-800">Optimisation avancée activée</h4>
                  <ul className="text-sm text-green-700 mt-1 space-y-1">
                    <li>• Suppression automatique des données EXIF</li>
                    <li>• Génération de tailles multiples (150px, 400px, 800px)</li>
                    <li>• Compression WebP pour un chargement rapide</li>
                    <li>• Upload sécurisé avec validation côté serveur</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Photos de test suggérées */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Photos de test suggérées:</p>
            <div className="flex flex-wrap gap-2">
              {testPhotos.map((photo, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addPhoto(photo)}
                  disabled={photos.includes(photo) || loading}
                  className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-300 hover:border-blue-500 disabled:opacity-50 transition-colors"
                >
                  <img
                    src={photo}
                    alt={`Test ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {photos.includes(photo) && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Check className="text-white w-4 h-4" />
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

      {/* Processed images info (for debugging) */}
      {processedImages.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <details>
            <summary className="cursor-pointer">Images traitées ({processedImages.length})</summary>
            <div className="mt-2 space-y-1">
              {processedImages.map((img, idx) => (
                <div key={idx}>
                  {img.size.suffix || 'original'}: {img.size.width}x{img.size.height}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
