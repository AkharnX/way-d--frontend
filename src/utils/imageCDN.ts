// CDN utilities for optimized image delivery with WebP/AVIF support

export interface ImageCDNConfig {
  baseUrl: string;
  enableWebP: boolean;
  enableAVIF: boolean;
  quality: number;
  enableLazyLoading: boolean;
}

export interface ResponsiveImageOptions {
  src: string;
  alt: string;
  sizes?: string;
  quality?: number;
  enableWebP?: boolean;
  enableAVIF?: boolean;
  loadingStrategy?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

// Default CDN configuration
const defaultConfig: ImageCDNConfig = {
  baseUrl: '/api/cdn',
  enableWebP: true,
  enableAVIF: true,
  quality: 85,
  enableLazyLoading: true
};

// Image size presets for responsive delivery
export const IMAGE_PRESETS = {
  thumbnail: { width: 150, height: 150, quality: 80 },
  small: { width: 300, height: 300, quality: 85 },
  medium: { width: 600, height: 600, quality: 90 },
  large: { width: 1200, height: 1200, quality: 95 },
  hero: { width: 1920, height: 1080, quality: 95 }
} as const;

/**
 * Check browser support for modern image formats
 */
export const getBrowserSupport = (): {
  webp: boolean;
  avif: boolean;
} => {
  if (typeof window === 'undefined') {
    return { webp: false, avif: false };
  }

  // Check WebP support
  const webpSupport = (() => {
    try {
      return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch {
      return false;
    }
  })();

  // Check AVIF support (basic check)
  const avifSupport = (() => {
    try {
      const img = new Image();
      img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
      return img.complete && img.width > 0;
    } catch {
      return false;
    }
  })();

  return { webp: webpSupport, avif: avifSupport };
};

/**
 * Generate optimized image URLs for different formats and sizes
 */
export const generateImageUrls = (
  originalUrl: string,
  preset: keyof typeof IMAGE_PRESETS = 'medium',
  config: Partial<ImageCDNConfig> = {}
): {
  original: string;
  webp?: string;
  avif?: string;
  srcSet: string;
  sizes: string;
} => {
  const finalConfig = { ...defaultConfig, ...config };
  const presetConfig = IMAGE_PRESETS[preset];
  
  // For external URLs or demo purposes, return as-is
  if (originalUrl.startsWith('http') && !originalUrl.includes(finalConfig.baseUrl)) {
    return {
      original: originalUrl,
      srcSet: originalUrl,
      sizes: '100vw'
    };
  }

  // Extract filename and extension
  const urlParts = originalUrl.split('/');
  const filename = urlParts[urlParts.length - 1];
  const [name, ext] = filename.split('.');
  
  // Generate CDN URLs for different formats
  const baseParams = `w=${presetConfig.width}&h=${presetConfig.height}&q=${presetConfig.quality}`;
  
  const urls = {
    original: `${finalConfig.baseUrl}/${name}.${ext}?${baseParams}`,
    webp: finalConfig.enableWebP ? `${finalConfig.baseUrl}/${name}.webp?${baseParams}` : undefined,
    avif: finalConfig.enableAVIF ? `${finalConfig.baseUrl}/${name}.avif?${baseParams}` : undefined
  };

  // Generate responsive srcSet
  const srcSetEntries: string[] = [];
  
  // Add different sizes for the same format
  Object.entries(IMAGE_PRESETS).forEach(([, preset]) => {
    if (preset.width <= presetConfig.width) {
      const params = `w=${preset.width}&h=${preset.height}&q=${preset.quality}`;
      srcSetEntries.push(`${finalConfig.baseUrl}/${name}.${ext}?${params} ${preset.width}w`);
    }
  });

  const srcSet = srcSetEntries.join(', ');
  
  // Generate sizes attribute
  const sizes = generateSizesAttribute(presetConfig.width);

  return {
    ...urls,
    srcSet,
    sizes
  };
};

/**
 * Generate sizes attribute for responsive images
 */
const generateSizesAttribute = (maxWidth: number): string => {
  const breakpoints = [
    { condition: '(max-width: 640px)', size: '100vw' },
    { condition: '(max-width: 768px)', size: '80vw' },
    { condition: '(max-width: 1024px)', size: '60vw' },
    { condition: '', size: `${Math.min(maxWidth, 1200)}px` }
  ];

  return breakpoints
    .filter(bp => bp.condition || bp.size)
    .map(bp => bp.condition ? `${bp.condition} ${bp.size}` : bp.size)
    .join(', ');
};

/**
 * Create a responsive image element with modern format support
 */
export const createResponsiveImage = (options: ResponsiveImageOptions): HTMLPictureElement => {
  const browserSupport = getBrowserSupport();
  const imageUrls = generateImageUrls(options.src);
  
  // Create picture element
  const picture = document.createElement('picture');
  
  // Add AVIF source if supported
  if (browserSupport.avif && imageUrls.avif) {
    const avifSource = document.createElement('source');
    avifSource.srcset = imageUrls.avif;
    avifSource.type = 'image/avif';
    if (options.sizes) avifSource.sizes = options.sizes;
    picture.appendChild(avifSource);
  }
  
  // Add WebP source if supported
  if (browserSupport.webp && imageUrls.webp) {
    const webpSource = document.createElement('source');
    webpSource.srcset = imageUrls.webp;
    webpSource.type = 'image/webp';
    if (options.sizes) webpSource.sizes = options.sizes;
    picture.appendChild(webpSource);
  }
  
  // Add fallback img element
  const img = document.createElement('img');
  img.src = imageUrls.original;
  img.srcset = imageUrls.srcSet;
  img.alt = options.alt;
  img.loading = options.loadingStrategy || 'lazy';
  if (options.sizes) img.sizes = options.sizes;
  
  // Add event listeners
  if (options.onLoad) img.addEventListener('load', options.onLoad);
  if (options.onError) img.addEventListener('error', options.onError);
  
  picture.appendChild(img);
  
  return picture;
};

/**
 * Lazy loading intersection observer for images
 */
export class LazyImageLoader {
  private observer: IntersectionObserver;
  
  constructor(options: IntersectionObserverInit = {}) {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const dataSrc = img.dataset.src;
          
          if (dataSrc) {
            img.src = dataSrc;
            img.removeAttribute('data-src');
            this.observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01,
      ...options
    });
  }
  
  observe(img: HTMLImageElement): void {
    this.observer.observe(img);
  }
  
  disconnect(): void {
    this.observer.disconnect();
  }
}

/**
 * Preload critical images for better performance
 */
export const preloadImage = (src: string, priority: 'high' | 'low' = 'low'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    
    if (priority === 'high') {
      link.setAttribute('fetchpriority', 'high');
    }
    
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    
    document.head.appendChild(link);
  });
};

/**
 * Get optimal image format based on browser support and file size
 */
export const getOptimalFormat = (originalSize: number): 'avif' | 'webp' | 'jpeg' => {
  const support = getBrowserSupport();
  
  // For very small images, the overhead might not be worth it
  if (originalSize < 10000) { // 10KB
    return support.webp ? 'webp' : 'jpeg';
  }
  
  // For larger images, prefer AVIF if supported
  if (support.avif) return 'avif';
  if (support.webp) return 'webp';
  return 'jpeg';
};

/**
 * Calculate estimated load time based on image size and connection
 */
export const estimateLoadTime = (imageSize: number, connectionType?: string): number => {
  // Rough estimates in KB/s
  const connectionSpeeds = {
    'slow-2g': 25,
    '2g': 35,
    '3g': 200,
    '4g': 1000,
    'wifi': 2000
  };
  
  const defaultSpeed = 500; // KB/s
  const speed = connectionType ? connectionSpeeds[connectionType as keyof typeof connectionSpeeds] || defaultSpeed : defaultSpeed;
  
  return (imageSize / 1024) / speed; // seconds
};

/**
 * Performance monitoring for image loading
 */
export class ImagePerformanceMonitor {
  private measurements: Map<string, number> = new Map();
  
  startMeasurement(imageUrl: string): void {
    this.measurements.set(imageUrl, performance.now());
  }
  
  endMeasurement(imageUrl: string): number | null {
    const startTime = this.measurements.get(imageUrl);
    if (!startTime) return null;
    
    const loadTime = performance.now() - startTime;
    this.measurements.delete(imageUrl);
    
    // Log to analytics if load time is poor (>500ms for profile photos)
    if (loadTime > 500) {
      console.warn(`Slow image load: ${imageUrl} took ${loadTime.toFixed(2)}ms`);
    }
    
    return loadTime;
  }
  
  getAverageLoadTime(): number {
    // This would integrate with your analytics service
    return 0;
  }
}