import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PostLoginRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { checkAndRedirectToProfile } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const handleRedirection = async () => {
      try {
        const redirectTo = await checkAndRedirectToProfile();
        
        if (redirectTo === 'create-profile') {
          // Utilisateur DOIT créer son profil avant d'accéder à l'app
          navigate('/create-profile', { 
            replace: true,
            state: { 
              message: 'Vous devez créer votre profil pour accéder à l\'application.',
              required: true 
            }
          });
        } else {
          // Profil existe et est complet, accès autorisé
          navigate('/app', { replace: true });
        }
      } catch (error) {
        console.error('Error during profile check:', error);
        // En cas d'erreur, forcer la création de profil pour la sécurité
        navigate('/create-profile', { 
          replace: true,
          state: { 
            message: 'Veuillez créer votre profil pour continuer.',
            required: true 
          }
        });
      } finally {
        setChecking(false);
      }
    };

    handleRedirection();
  }, [navigate, checkAndRedirectToProfile]);

  if (checking) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Vérification de votre profil...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default PostLoginRedirect;
