import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { formatErrorForUser } from '../utils/apiErrorUtils';
import { authService } from '../services/api';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, WifiOff } from 'lucide-react';
import TwoFactorVerify from '../components/TwoFactorVerify';
import SocialLoginButtons from '../components/SocialLoginButtons';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [pendingLogin, setPendingLogin] = useState<{ email: string; password: string; rememberMe: boolean } | null>(null);

  // Show message from email verification if available
  React.useEffect(() => {
    if (location.state?.message) {
      // You could show this in a toast or similar UI component
      console.log('Login message:', location.state.message);
    }
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(formData);
      
      // Check if 2FA is required
      if (response.requires_2fa) {
        setPendingLogin(formData);
        setShowTwoFactor(true);
        setLoading(false);
        return;
      }
      
      // Regular login success - use the auth hook to set tokens
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

  const handle2FAVerify = async (code: string) => {
    if (!pendingLogin) return;
    
    setError('');
    setLoading(true);

    try {
      const response = await authService.verify2FA({
        email: pendingLogin.email,
        code
      });
      
      // Set tokens and authenticate user
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      navigate('/post-login-redirect', { replace: true });
    } catch (err: any) {
      const userFriendlyError = formatErrorForUser(err);
      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook', token: string) => {
    setError('');
    setLoading(true);

    try {
      const response = provider === 'google' 
        ? await authService.googleAuth({ token })
        : await authService.facebookAuth({ token });
      
      // Set tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // If new user, redirect to profile creation
      if (response.is_new_user) {
        navigate('/create-profile', { replace: true });
      } else {
        navigate('/post-login-redirect', { replace: true });
      }
    } catch (err: any) {
      const userFriendlyError = formatErrorForUser(err);
      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleBack2FA = () => {
    setShowTwoFactor(false);
    setPendingLogin(null);
    setError('');
  };

  // Show 2FA verification if required
  if (showTwoFactor && pendingLogin) {
    return (
      <TwoFactorVerify
        email={pendingLogin.email}
        onVerify={handle2FAVerify}
        onBack={handleBack2FA}
        loading={loading}
        error={error}
      />
    );
  }

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

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>
              <Link 
                to="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mot de passe oublié ?
              </Link>
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

            {/* Social Login */}
            <SocialLoginButtons
              onGoogleLogin={(token) => handleSocialLogin('google', token)}
              onFacebookLogin={(token) => handleSocialLogin('facebook', token)}
              loading={loading}
            />
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
                onClick={() => navigate('/forgot-password')}
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