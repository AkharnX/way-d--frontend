// Network error handling utilities
import { logError } from './errorUtils';

/**
 * Handles network and API errors with user-friendly messages
 */
export function handleApiError(error: any): Error {
  logError('API Error:', error);
  
  // Network connectivity issues
  if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
    return new Error('🔗 Impossible de se connecter au serveur.\n\nVeuillez vérifier que les services backend sont démarrés.\n\nPour démarrer les services:\n```\ncd /home/akharn/way-d\ndocker-compose up -d\n```');
  }
  
  // Server errors
  if (error.response?.status === 500) {
    return new Error('🚨 Erreur serveur.\n\nLes services backend ne fonctionnent pas correctement.\n\nVeuillez vérifier les logs des services et les redémarrer si nécessaire.');
  }
  
  // Service unavailable
  if (error.response?.status === 503) {
    return new Error('⏱️ Service temporairement indisponible.\n\nVeuillez réessayer dans quelques instants.');
  }
  
  // Authentication errors
  if (error.response?.status === 401) {
    return new Error('🔐 Email ou mot de passe incorrect.');
  }
  
  // Email verification errors
  if (error.response?.status === 403) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || '';
    if (errorMessage.includes('Email not verified')) {
      return new Error('EMAIL_NOT_VERIFIED');
    }
    return new Error('🚫 Accès non autorisé.');
  }
  
  // Client errors
  if (error.response?.status >= 400 && error.response?.status < 500) {
    return new Error(error.response?.data?.error || error.response?.data?.message || '❌ Requête invalide.');
  }
  
  // Unknown errors
  return new Error(error.message || '⚠️ Une erreur inattendue s\'est produite.');
}

/**
 * Shows user-friendly error messages with service status
 */
export function formatErrorForUser(error: any): string {
  if (error.message === 'EMAIL_NOT_VERIFIED') {
    return '📧 Votre email n\'est pas encore vérifié. Veuillez vérifier votre boîte email et cliquer sur le lien de vérification.';
  }
  
  if (error.message.includes('se connecter au serveur')) {
    return `🔗 Connexion impossible
    
Les services backend ne sont pas démarrés.

🛠️ Solution :
1. Ouvrez un terminal
2. Allez dans le dossier du projet : cd /home/akharn/way-d
3. Démarrez les services : docker-compose up -d
4. Attendez quelques secondes et réessayez`;
  }
  
  return error.message;
}

/**
 * Retry mechanism for API calls
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      // Don't retry on client errors (4xx) or email verification errors
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw handleApiError(error);
      }
      
      // Last attempt - throw the error
      if (attempt === maxRetries) {
        throw handleApiError(error);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw new Error('Max retries exceeded');
}
