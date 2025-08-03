import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/api';

interface ProfileRequiredRouteProps {
  children: React.ReactNode;
}

const ProfileRequiredRoute: React.FC<ProfileRequiredRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      checkProfile();
    }
  }, [authLoading, user]);

  const checkProfile = async () => {
    try {
      const profile = await profileService.getProfile();
      
      // Vérifier que le profil est complet (au minimum first_name et last_name)
      if (profile && profile.first_name && profile.last_name) {
        setHasProfile(true);
      } else {
        setHasProfile(false);
      }
    } catch (error: any) {
      // Profil n'existe pas ou erreur - rediriger vers création
      setHasProfile(false);
    } finally {
      setProfileLoading(false);
    }
  };

  // Attendre que l'authentification soit terminée
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Vérification de votre profil...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur, rediriger vers login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si pas de profil, rediriger vers création (obligatoire)
  if (!hasProfile) {
    return <Navigate to="/create-profile" state={{ required: true, message: 'Vous devez créer votre profil pour accéder à l\'application.' }} replace />;
  }

  // Profil existe et est complet - accès autorisé
  return <>{children}</>;
};

export default ProfileRequiredRoute;
