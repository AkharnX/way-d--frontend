import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PostLoginRedirect: React.FC = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const handleRedirection = async () => {
      try {
        // Since profiles are now created during registration, 
        // always redirect to dashboard after login
        navigate('/app', { replace: true });
      } catch (error) {
        console.error('Error during post-login redirect:', error);
        // Even on error, redirect to dashboard since profiles are created at registration
        navigate('/app', { replace: true });
      } finally {
        setChecking(false);
      }
    };

    handleRedirection();
  }, [navigate]);

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
