// Discovery Cache Service - Évite de montrer les mêmes profils répétitivement
class DiscoveryCache {
  private static readonly CACHE_KEY = 'way_d_discovery_cache';
  private static readonly MAX_CACHE_SIZE = 1000;
  private static readonly CACHE_EXPIRY_HOURS = 24;

  // Get the list of profile IDs that should be excluded from discovery
  static getExcludedProfileIds(): Set<string> {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return new Set();

      const data = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now - data.timestamp > this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000) {
        console.log('🗑️ Discovery cache expired, clearing...');
        this.clearCache();
        return new Set();
      }

      console.log(`📋 Loaded ${data.profileIds.length} excluded profile IDs from cache`);
      return new Set(data.profileIds);
    } catch (error) {
      console.warn('Error loading discovery cache:', error);
      return new Set();
    }
  }

  // Add profile IDs to the exclusion cache (when user likes/dislikes)
  static addExcludedProfileIds(profileIds: string[]): void {
    try {
      const existingExcluded = this.getExcludedProfileIds();
      
      // Add new IDs to the set
      profileIds.forEach(id => {
        if (id) existingExcluded.add(id);
      });

      // Convert to array and limit size
      const allExcluded = Array.from(existingExcluded);
      if (allExcluded.length > this.MAX_CACHE_SIZE) {
        // Keep only the most recent entries
        allExcluded.splice(0, allExcluded.length - this.MAX_CACHE_SIZE);
      }

      // Save to localStorage
      const cacheData = {
        profileIds: allExcluded,
        timestamp: Date.now()
      };

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      console.log(`💾 Cached ${allExcluded.length} excluded profile IDs`);
    } catch (error) {
      console.warn('Error saving to discovery cache:', error);
    }
  }

  // Clear the cache (useful for testing or cache corruption)
  static clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('🗑️ Discovery cache cleared');
    } catch (error) {
      console.warn('Error clearing discovery cache:', error);
    }
  }

  // Get cache statistics for debugging
  static getCacheStats(): { size: number; ageHours: number; isExpired: boolean } {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return { size: 0, ageHours: 0, isExpired: false };

      const data = JSON.parse(cached);
      const now = Date.now();
      const ageMs = now - data.timestamp;
      const ageHours = ageMs / (60 * 60 * 1000);
      const isExpired = ageHours > this.CACHE_EXPIRY_HOURS;

      return {
        size: data.profileIds.length,
        ageHours: Math.round(ageHours * 100) / 100,
        isExpired
      };
    } catch (error) {
      console.warn('Error getting cache stats:', error);
      return { size: 0, ageHours: 0, isExpired: false };
    }
  }
}

export default DiscoveryCache;
