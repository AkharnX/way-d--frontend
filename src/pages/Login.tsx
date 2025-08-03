import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { formatErrorForUser } from '../utils/apiErrorUtils';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, WifiOff } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Show message from email verification if available
  React.useEffect(() => {
    if (location.state?.message) {
      // You could show this in a toast or similar UI component
      console.log('Login message:', location.state.message);
    }
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/post-login-redirect', { replace: true });
    } catch (err: any) {
      // Use the new error formatting utility
      const userFriendlyError = formatErrorForUser(err);
      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-white/80 hover:text-white transition-colors text-lg"
          >
            <ArrowLeft className="w-6 h-6 mr-3" />
            Retour à l'accueil
          </Link>
        </div>

        {/* Login Card */}
        <div className="card-modern bg-white/95 backdrop-blur-sm p-8">
          {/* Header avec Logo */}
          <div className="text-center mb-10">
            <div className="mb-6">
              <img 
                src="/logo-name-blue.png" 
                alt="Way-d" 
                className="h-16 w-auto mx-auto"
              />
            </div>
            <h1 className="text-4xl font-bold way-d-primary mb-3">
              Content de vous revoir !
            </h1>
            <p className="text-gray-600 text-lg">
              Connectez-vous pour retrouver vos matches
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  {error.includes('se connecter au serveur') ? (
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <WifiOff className="w-4 h-4 mr-2" />
                        <span className="font-medium">Services backend non disponibles</span>
                      </div>
                      <div className="text-xs bg-red-100 p-3 rounded font-mono whitespace-pre-line">
                        {error}
                      </div>
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="text-red-600 hover:text-red-800 font-medium text-sm underline"
                      >
                        🔄 Réessayer après avoir démarré les services
                      </button>
                    </div>
                  ) : (
                    <div className="whitespace-pre-line">{error}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="votre@email.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-11 pr-11"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-10 text-center space-y-6">
            <Link 
              to="/register" 
              className="way-d-secondary hover:way-d-primary font-medium transition-colors text-lg"
            >
              Pas encore de compte ? Inscrivez-vous
            </Link>
            
            {/* Forgot Password (placeholder) */}
            <div>
              <button 
                type="button"
                className="text-gray-500 hover:text-gray-700 transition-colors text-base"
                onClick={() => alert('Fonctionnalité à venir')}
              >
                Mot de passe oublié ?
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            En vous connectant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;