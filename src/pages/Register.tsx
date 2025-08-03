import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Calendar, Users, CheckCircle, Loader2, Heart, MapPin } from 'lucide-react';
import { profileService } from '../services/api';
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
    gender: 'other',
    // Champs de profil de base
    bio: '',
    height: 175,
    location: '',
    looking_for: 'serious'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [genderOptions, setGenderOptions] = useState<Array<{ value: string; label: string }>>([
    { value: 'male', label: 'Homme' },
    { value: 'female', label: 'Femme' },
    { value: 'other', label: 'Autre / Ne se prononce pas' }
  ]);

  const totalSteps = 4; // Augmenté pour inclure les informations de profil

  // Load dynamic gender options on component mount
  useEffect(() => {
    loadGenderOptions();
  }, []);

  const loadGenderOptions = async () => {
    try {
      const options = await profileService.getGenderOptions();
      setGenderOptions(options);
    } catch (error) {
      console.error('Error loading gender options:', error);
      // Keep fallback options already set
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      case 4:
        return !!(formData.bio && formData.location && formData.looking_for);
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
    if (!validateStep(4)) return; // Maintenant validation de l'étape 4

    setError('');
    setLoading(true);

    try {
      const response = await register(formData);
      
      // Store profile data for auto-creation after email verification
      if (formData.bio || formData.height || formData.location || formData.looking_for) {
        const profileData = {
          bio: formData.bio,
          height: formData.height,
          location: formData.location,
          looking_for: formData.looking_for
        };
        localStorage.setItem('pending_profile_data', JSON.stringify(profileData));
      }
      
      // After successful registration, redirect to email verification
      navigate('/verify-email', { 
        state: { 
          email: formData.email,
          verificationCode: response.verification_code,
          message: response.message,
          instructions: response.instructions,
          // Passer les données de profil pour pré-remplir le formulaire de création
          profileData: {
            bio: formData.bio,
            height: formData.height,
            location: formData.location,
            looking_for: formData.looking_for
          }
        },
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
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Back Button */}
      <div className="p-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-white hover:text-white/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour à l'accueil
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white text-sm">Étape {currentStep}/{totalSteps}</span>
              <span className="text-white text-sm">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <img 
                src="/logo-name-blue.png" 
                alt="Way-d" 
                className="h-12 w-auto mx-auto mb-4"
              />
              <h1 className="text-2xl font-bold way-d-primary">Inscription</h1>
              <p className="text-gray-600">Créez votre compte Way-d</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                {error}
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
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label htmlFor="passwordConfirm" className="text-sm font-medium text-gray-700">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      id="passwordConfirm"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className="input-field pl-11"
                      placeholder="••••••••"
                      required
                    />
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

                  {/* Gender - Dynamic options from backend */}
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
                        {genderOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Basic Profile Information */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-way-d-primary/10 rounded-full mb-3">
                      <Heart className="w-8 h-8 way-d-primary" />
                    </div>
                    <h3 className="text-xl font-semibold way-d-primary">Votre profil</h3>
                    <p className="text-gray-600 text-sm mt-1">Quelques informations pour créer votre profil</p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium text-gray-700">
                      Présentez-vous en quelques mots
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio || ''}
                      onChange={handleChange}
                      placeholder="Décrivez-vous brièvement..."
                      className="input-field min-h-[80px] resize-none"
                      maxLength={300}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      {(formData.bio || '').length}/300 caractères
                    </p>
                  </div>

                  {/* Height */}
                  <div className="space-y-2">
                    <label htmlFor="height" className="text-sm font-medium text-gray-700">
                      Taille (cm)
                    </label>
                    <input
                      type="number"
                      id="height"
                      name="height"
                      value={formData.height || 175}
                      onChange={handleChange}
                      min="140"
                      max="220"
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium text-gray-700">
                      Localisation
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location || ''}
                        onChange={handleChange}
                        placeholder="Ville, Région"
                        className="input-field pl-11"
                        required
                      />
                    </div>
                  </div>

                  {/* Looking For */}
                  <div className="space-y-2">
                    <label htmlFor="looking_for" className="text-sm font-medium text-gray-700">
                      Que recherchez-vous ?
                    </label>
                    <div className="relative">
                      <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        id="looking_for"
                        name="looking_for"
                        value={formData.looking_for || 'serious'}
                        onChange={handleChange}
                        className="input-field pl-11 appearance-none"
                        required
                      >
                        <option value="serious">Relation sérieuse</option>
                        <option value="casual">Relation décontractée</option>
                        <option value="friends">Amitié</option>
                        <option value="unsure">Je ne sais pas encore</option>
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
                    disabled={loading || !validateStep(4) || !isValidAge}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
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

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Déjà inscrit ? {' '}
                <Link to="/login" className="way-d-primary font-semibold hover:underline">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
