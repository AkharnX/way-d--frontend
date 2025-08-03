// Token validation and security utilities
import { logError } from './errorUtils';

/**
 * Store tokens in localStorage
 */
export function setTokens(accessToken: string, refreshToken: string): void {
  try {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  } catch (error) {
    logError('Error storing tokens:', error);
    throw error;
  }
}

/**
 * Clear all tokens from localStorage
 */
export function clearTokens(): void {
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  } catch (error) {
    logError('Error clearing tokens:', error);
  }
}

/**
 * Validates if a token is properly formatted and not expired
 */
export function ensureValidToken(token: string | null): boolean {
  if (!token) return false;
  
  try {
    // Basic JWT format check
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode payload to check expiration
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    return payload.exp > now;
  } catch (error) {
    logError('Token validation error:', error);
    return false;
  }
}

/**
 * Validates tokens and removes invalid ones from localStorage
 */
export function validateAndCleanupTokens(): void {
  try {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    // Check access token
    if (accessToken && !ensureValidToken(accessToken)) {
      localStorage.removeItem('access_token');
      console.log('🧹 Removed invalid access token');
    }
    
    // Check refresh token
    if (refreshToken && !ensureValidToken(refreshToken)) {
      localStorage.removeItem('refresh_token');
      console.log('🧹 Removed invalid refresh token');
    }
  } catch (error) {
    logError('Token cleanup error:', error);
  }
}

/**
 * Completely clears all authentication tokens
 */
export function cleanupTokens(): void {
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile_data');
    console.log('🧹 All tokens cleaned up');
  } catch (error) {
    logError('Error cleaning up tokens:', error);
  }
}

/**
 * Gets a valid access token, refreshing if necessary
 */
export async function getValidAccessToken(): Promise<string | null> {
  const accessToken = localStorage.getItem('access_token');
  
  if (accessToken && ensureValidToken(accessToken)) {
    return accessToken;
  }
  
  // Try to refresh the token
  const refreshToken = localStorage.getItem('refresh_token');
  if (refreshToken && ensureValidToken(refreshToken)) {
    try {
      // This would call your refresh endpoint
      // For now, just return null to trigger login
      console.log('🔄 Token refresh needed');
      return null;
    } catch (error) {
      logError('Token refresh failed:', error);
      cleanupTokens();
      return null;
    }
  }
  
  return null;
}
