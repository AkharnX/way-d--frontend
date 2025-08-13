// Image processing utilities for photo upload and optimization

export interface ImageSize {
  width: number;
  height: number;
  quality: number;
  suffix: string;
}

export interface ProcessedImage {
  file: File;
  url: string;
  size: ImageSize;
}

export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Standard image sizes for profile photos
export const IMAGE_SIZES: Record<string, ImageSize> = {
  thumbnail: { width: 150, height: 150, quality: 0.8, suffix: '_thumb' },
  medium: { width: 400, height: 400, quality: 0.85, suffix: '_med' },
  large: { width: 800, height: 800, quality: 0.9, suffix: '_large' },
  original: { width: 1200, height: 1200, quality: 0.95, suffix: '' }
};

// Supported image formats
export const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MIN_IMAGE_SIZE = 200; // 200x200 minimum

/**
 * Validate image file before processing
 */
export function validateImageFile(file: File): ImageValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file type
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    errors.push(`Format non supporté. Formats acceptés: ${SUPPORTED_FORMATS.join(', ')}`);
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`Fichier trop volumineux. Taille maximale: ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  if (file.size < 50 * 1024) { // 50KB minimum
    warnings.push('Fichier très petit, la qualité pourrait être insuffisante');
  }

  // Check file name for suspicious patterns
  const suspiciousPatterns = /[<>:"/\\|?*]/;
  if (suspiciousPatterns.test(file.name)) {
    warnings.push('Nom de fichier contient des caractères suspects');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Strip EXIF data from image (basic implementation)
 */
export async function stripExifData(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        // Draw image to canvas (this strips EXIF data)
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const strippedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(strippedFile);
          } else {
            reject(new Error('Failed to process image'));
          }
        }, file.type, 0.95);
      } else {
        reject(new Error('Canvas context not available'));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Resize and compress image to specific dimensions
 */
export async function resizeImage(file: File, targetSize: ImageSize): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      let { width, height } = calculateAspectRatio(
        img.width, 
        img.height, 
        targetSize.width, 
        targetSize.height
      );

      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        // Set high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const processedFile = new File(
              [blob], 
              file.name.replace(/\.[^/.]+$/, `${targetSize.suffix}.webp`),
              { type: 'image/webp', lastModified: Date.now() }
            );
            
            resolve({
              file: processedFile,
              url: URL.createObjectURL(blob),
              size: { ...targetSize, width, height }
            });
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, 'image/webp', targetSize.quality);
      } else {
        reject(new Error('Canvas context not available'));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image for resizing'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calculate aspect ratio maintaining proportions
 */
function calculateAspectRatio(
  originalWidth: number, 
  originalHeight: number, 
  maxWidth: number, 
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = maxWidth;
  let height = maxHeight;
  
  if (aspectRatio > 1) {
    // Landscape
    height = Math.round(width / aspectRatio);
    if (height > maxHeight) {
      height = maxHeight;
      width = Math.round(height * aspectRatio);
    }
  } else {
    // Portrait or square
    width = Math.round(height * aspectRatio);
    if (width > maxWidth) {
      width = maxWidth;
      height = Math.round(width / aspectRatio);
    }
  }
  
  return { width, height };
}

/**
 * Process image into multiple sizes
 */
export async function processImageMultipleSizes(file: File): Promise<ProcessedImage[]> {
  const processedImages: ProcessedImage[] = [];
  
  // First strip EXIF data
  const cleanFile = await stripExifData(file);
  
  // Process each size
  for (const [sizeName, sizeConfig] of Object.entries(IMAGE_SIZES)) {
    try {
      const processed = await resizeImage(cleanFile, sizeConfig);
      processedImages.push(processed);
    } catch (error) {
      console.error(`Failed to process ${sizeName} size:`, error);
      // Continue with other sizes even if one fails
    }
  }
  
  return processedImages;
}

/**
 * Generate presigned upload URL (simulation for frontend)
 */
export async function generatePresignedUrl(fileName: string): Promise<{
  uploadUrl: string;
  viewUrl: string;
  key: string;
}> {
  // Simulate API call to backend for presigned URL
  const key = `profile-photos/${Date.now()}-${fileName}`;
  
  // In real implementation, this would call backend API
  return {
    uploadUrl: `/api/upload/presigned/${encodeURIComponent(key)}`,
    viewUrl: `/api/photos/${encodeURIComponent(key)}`,
    key
  };
}

/**
 * Upload file using presigned URL
 */
export async function uploadWithPresignedUrl(
  file: File, 
  uploadUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: `Upload failed with status ${response.status}` 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}

/**
 * Create responsive image srcset for different screen sizes
 */
export function createResponsiveImageSrcSet(baseUrl: string, sizes: ProcessedImage[]): {
  src: string;
  srcSet: string;
  sizes: string;
} {
  const srcSet = sizes
    .map(size => `${baseUrl}${size.size.suffix} ${size.size.width}w`)
    .join(', ');
    
  const sizesStr = `
    (max-width: 400px) 150px,
    (max-width: 800px) 400px,
    800px
  `.trim();
  
  // Use medium size as default src
  const defaultSize = sizes.find(s => s.size.suffix === '_med') || sizes[0];
  const src = `${baseUrl}${defaultSize?.size.suffix || ''}`;
  
  return { src, srcSet, sizes: sizesStr };
}