import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import PageHeader from '../components/PageHeader';

const EmailVerification: React.FC = () => {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get email from registration state or allow manual input
  React.useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [location.state, user]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) {
      setError('Email et code de vérification requis');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await authService.verifyEmail({ email, code });
      setMessage('Email vérifié avec succès !');
      
      // Clear the temporary user email from localStorage
      localStorage.removeItem('user_email');
      
      setTimeout(() => {
        if (user?.id === 'temp') {
          // User was already logged in but email wasn't verified
          navigate('/app');
        } else {
          // User came from registration, redirect to login
          navigate('/login', { 
            state: { message: 'Email vérifié ! Vous pouvez maintenant vous connecter.' }
          });
        }
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Email requis pour renvoyer le code');
      return;
    }

    setResendLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authService.resendVerificationCode({ email });
      setMessage('Nouveau code de vérification envoyé !');
      
      // En mode dev, afficher le code dans la console
      if (response.code) {
        console.log('🔐 Code de vérification:', response.code);
        alert(`Code de vérification (dev): ${response.code}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi du code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
      <PageHeader 
        title="Vérification Email"
        showBack={true}
        customBackAction={() => navigate('/login')}
      />
      
      <div className="flex items-center justify-center p-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Vérification Email</h1>
            <p className="text-gray-600">
              Entrez le code de vérification envoyé à votre email
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Code de vérification
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center text-2xl font-mono"
              placeholder="123456"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Vérification...' : 'Vérifier'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4">
            Vous n'avez pas reçu le code ?
          </p>
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="text-pink-600 hover:text-pink-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading ? 'Envoi...' : 'Renvoyer le code'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-600 hover:text-gray-700 font-medium"
          >
            ← Retour à la connexion
          </button>
        </div>

        {/* Debug info en développement */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Mode Développement</h3>
            <p className="text-sm text-yellow-700">
              Le code de vérification sera affiché dans la console du navigateur et dans les logs du serveur.
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
