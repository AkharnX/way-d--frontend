import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Calendar, Users, CheckCircle, Loader2 } from 'lucide-react';
import type { RegisterData } from '../types';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    birth_date: '',
    gender: 'other'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const totalSteps = 3;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) setError('');
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.email && formData.password && passwordConfirm && formData.password === passwordConfirm);
      case 2:
        return !!(formData.first_name && formData.last_name);
      case 3:
        return !!(formData.birth_date && formData.gender);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setError('');
    setLoading(true);

    try {
      await register(formData);
      // After successful registration, redirect to email verification
      navigate('/verify-email', { 
        state: { email: formData.email },
        replace: true 
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Erreur lors de l\'inscription. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const isValidAge = formData.birth_date ? calculateAge(formData.birth_date) >= 18 : true;

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

        {/* Registration Card */}
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
              Rejoignez Way-d
            </h1>
            <p className="text-gray-600 text-lg">
              Créez votre compte pour commencer l'aventure
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <span className="font-medium">Étape {currentStep} sur {totalSteps}</span>
              <span className="font-semibold way-d-secondary">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-way-d-secondary h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Email & Password */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-way-d-primary/10 rounded-full mb-3">
                    <Mail className="w-8 h-8 way-d-primary" />
                  </div>
                  <h3 className="text-xl font-semibold way-d-primary">Informations de connexion</h3>
                  <p className="text-gray-600 text-sm mt-1">Créez vos identifiants de connexion</p>
                </div>

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
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.password && formData.password.length < 6 && (
                    <p className="text-red-500 text-xs">Le mot de passe doit contenir au moins 6 caractères</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="passwordConfirm" className="text-sm font-medium text-gray-700">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      id="passwordConfirm"
                      name="passwordConfirm"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className="input-field pl-11"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  {passwordConfirm && formData.password !== passwordConfirm && (
                    <p className="text-red-500 text-xs">Les mots de passe ne correspondent pas</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Personal Info */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-way-d-secondary/10 rounded-full mb-3">
                    <User className="w-8 h-8 way-d-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold way-d-primary">Informations personnelles</h3>
                  <p className="text-gray-600 text-sm mt-1">Dites-nous qui vous êtes</p>
                </div>

                {/* First Name */}
                <div className="space-y-2">
                  <label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Votre prénom"
                    required
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                    Nom de famille
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Votre nom de famille"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 3: Demographics */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-way-d-primary/10 rounded-full mb-3">
                    <Calendar className="w-8 h-8 way-d-primary" />
                  </div>
                  <h3 className="text-xl font-semibold way-d-primary">Informations complémentaires</h3>
                  <p className="text-gray-600 text-sm mt-1">Complétez votre profil</p>
                </div>

                {/* Birth Date */}
                <div className="space-y-2">
                  <label htmlFor="birth_date" className="text-sm font-medium text-gray-700">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    id="birth_date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    className="input-field"
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    required
                  />
                  {formData.birth_date && !isValidAge && (
                    <p className="text-red-500 text-xs">Vous devez avoir au moins 18 ans pour vous inscrire</p>
                  )}
                  {formData.birth_date && isValidAge && (
                    <p className="text-green-600 text-xs">Âge: {calculateAge(formData.birth_date)} ans</p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label htmlFor="gender" className="text-sm font-medium text-gray-700">
                    Genre
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="input-field pl-11 appearance-none"
                      required
                    >
                      <option value="">Sélectionnez votre genre</option>
                      <option value="male">Homme</option>
                      <option value="female">Femme</option>
                      <option value="other">Autre / Ne se prononce pas</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex gap-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-secondary flex-1"
                >
                  Précédent
                </button>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !validateStep(3) || !isValidAge}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Inscription...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Créer mon compte
                    </div>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <Link 
              to="/login" 
              className="way-d-secondary hover:text-[#40BDE0]/80 font-medium transition-colors text-lg"
            >
              Déjà un compte ? Connectez-vous
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            En créant un compte, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;