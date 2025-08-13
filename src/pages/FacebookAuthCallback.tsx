import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function FacebookAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      // Send error to parent window
      window.opener?.postMessage({
        type: 'FACEBOOK_AUTH_ERROR',
        error: error
      }, window.location.origin);
      window.close();
      return;
    }

    if (code) {
      // Send auth code to parent window
      window.opener?.postMessage({
        type: 'FACEBOOK_AUTH_SUCCESS',
        token: code
      }, window.location.origin);
      window.close();
      return;
    }

    // No code or error, redirect to login
    navigate('/login');
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Traitement de l'authentification Facebook...</p>
      </div>
    </div>
  );
}

export default FacebookAuthCallback;