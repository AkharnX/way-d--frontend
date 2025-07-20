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
    <div className="min-h-screen gradient-bg">
      <PageHeader 
        title="Vérification Email"
        showBack={true}
        customBackAction={() => navigate('/login')}
      />
      
      <div className="flex items-center justify-center p-6 pt-24">
        <div className="max-w-lg w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-10">
          <div className="text-center mb-10">
            <div className="mb-6">
              <img 
                src="/logo-name-blue.png" 
                alt="Way-d" 
                className="h-16 w-auto mx-auto"
              />
            </div>
            <h1 className="text-4xl font-bold way-d-primary mb-3">Vérification Email</h1>
            <p className="text-gray-600 text-lg">
              Entrez le code de vérification envoyé à votre email
            </p>
          </div>

          {message && (
            <div className="mb-8 p-5 bg-way-d-secondary/10 border border-way-d-secondary/30 way-d-secondary rounded-xl font-medium text-center">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-8 p-5 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-8">
            <div>
              <label htmlFor="email" className="block font-semibold text-gray-700 mb-3 text-lg">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="code" className="block font-semibold text-gray-700 mb-3 text-lg">
                Code de vérification
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="input-field text-center text-3xl font-mono tracking-widest"
                placeholder="123456"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xl"
            >
              {loading ? 'Vérification...' : 'Vérifier'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-6 text-lg">
              Vous n'avez pas reçu le code ?
            </p>
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="way-d-secondary hover:text-way-d-secondary/80 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resendLoading ? 'Envoi...' : 'Renvoyer le code'}
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-600 hover:text-gray-700 font-medium text-lg transition-colors"
            >
              ← Retour à la connexion
            </button>
          </div>

          {/* Debug info en développement */}
          {import.meta.env.DEV && (
            <div className="mt-8 p-6 bg-way-d-primary/5 border border-way-d-primary/20 rounded-xl">
              <h3 className="font-semibold way-d-primary mb-3 text-lg">Mode Développement</h3>
              <p className="text-gray-700">
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
