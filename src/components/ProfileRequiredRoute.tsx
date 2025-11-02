import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProfileRequiredRouteProps {
  children: React.ReactNode;
}

const ProfileRequiredRoute: React.FC<ProfileRequiredRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  // Attendre que l'authentification soit terminée
  if (authLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Vérification de votre authentification...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur, rediriger vers login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // With the new architecture, profiles are created during registration
  // So we always allow access to the app
  return <>{children}</>;
};

export default ProfileRequiredRoute;
