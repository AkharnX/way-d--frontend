import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { User, Mail, Lock, Heart, MapPin, Camera, Calendar, Briefcase, GraduationCap, ArrowRight, ArrowLeft, Check, Upload, X } from 'lucide-react';

interface RegistrationData {
  // Étape 1: Informations de base
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  birthdate: string;
  
  // Étape 2: Profil de base
  bio: string;
  height: number;
  location: string;
  country: string;
  occupation: string;
  education: string;
  
  // Étape 3: Préférences et photos
  looking_for: string;
  interests: string[];
  photos: File[];
  
  // Étape 4: Préférences de découverte
  min_age: number;
  max_age: number;
  max_distance: number;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<RegistrationData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    birthdate: '',
    bio: '',
    height: 170,
    location: '',
    country: '',
    occupation: '',
    education: '',
    looking_for: 'serious',
    interests: [],
    photos: [],
    min_age: 18,
    max_age: 35,
    max_distance: 50
  });

  const genderOptions = [
    { value: 'man', label: '👨 Homme' },
    { value: 'woman', label: '👩 Femme' },
    { value: 'non-binary', label: '🌈 Non-binaire' }
  ];

  const lookingForOptions = [
    { value: 'serious', label: '💍 Relation sérieuse' },
    { value: 'casual', label: '😊 Relation décontractée' },
    { value: 'friendship', label: '🤝 Amitié' },
    { value: 'not_sure', label: '🤔 Je ne sais pas encore' }
  ];

  const educationLevels = [
    'Collège', 'Lycée', 'Bac+2', 'Bac+3', 'Bac+5', 'Doctorat', 'Autre'
  ];

  const interestOptions = [
    '🎵 Musique', '🎬 Cinéma', '📚 Lecture', '🏃‍♂️ Sport', '🧘‍♀️ Yoga',
    '🍳 Cuisine', '✈️ Voyage', '🎨 Art', '🎮 Jeux vidéo', '🌱 Nature',
    '📸 Photographie', '💃 Danse', '🎭 Théâtre', '🏔️ Randonnée', '🏊‍♀️ Natation',
    '🎸 Guitare', '🍷 Vin', '☕ Café', '🐶 Animaux', '🌍 Écologie'
  ];

  const handleInputChange = (field: keyof RegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.first_name.trim()) newErrors.first_name = 'Prénom requis';
        if (!formData.last_name.trim()) newErrors.last_name = 'Nom requis';
        if (!formData.email.trim()) newErrors.email = 'Email requis';
        if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
        if (formData.password.length < 6) newErrors.password = 'Mot de passe trop court (min 6 caractères)';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        if (!formData.gender) newErrors.gender = 'Genre requis';
        if (!formData.birthdate) newErrors.birthdate = 'Date de naissance requise';
        break;
      
      case 2:
        if (!formData.bio.trim()) newErrors.bio = 'Description requise';
        if (formData.bio.length < 20) newErrors.bio = 'Description trop courte (min 20 caractères)';
        if (!formData.location.trim()) newErrors.location = 'Localisation requise';
        if (!formData.occupation.trim()) newErrors.occupation = 'Profession requise';
        if (!formData.education) newErrors.education = 'Niveau d\'éducation requis';
        break;
      
      case 3:
        if (formData.interests.length < 3) newErrors.interests = 'Sélectionnez au moins 3 centres d\'intérêt';
        if (formData.photos.length < 2) newErrors.photos = 'Ajoutez au moins 2 photos';
        break;
      
      case 4:
        if (formData.min_age < 18) newErrors.min_age = 'Âge minimum 18 ans';
        if (formData.max_age > 100) newErrors.max_age = 'Âge maximum 100 ans';
        if (formData.min_age >= formData.max_age) newErrors.max_age = 'Âge max doit être supérieur à l\'âge min';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);
    try {
      // 1. Créer le compte utilisateur
      const authData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        gender: formData.gender as 'male' | 'female' | 'other',
        birth_date: formData.birthdate
      };

      const response = await authService.register(authData);

      // 2. Stocker les données de profil pour création après connexion
      const profileData = {
        bio: formData.bio,
        height: formData.height,
        location: formData.location,
        occupation: formData.occupation,
        education: formData.education,
        looking_for: formData.looking_for,
        interests: formData.interests,
        min_age: formData.min_age,
        max_age: formData.max_age,
        max_distance: formData.max_distance,
        photos: formData.photos // Stocker aussi les photos
      };

      // Stocker les données de profil pour auto-création après connexion
      localStorage.setItem('pending_profile_data', JSON.stringify(profileData));

      // 3. Rediriger vers la vérification email
      navigate('/verify-email', { 
        state: { 
          email: formData.email,
          verification_code: response.verification_code,
          message: response.message,
          instructions: response.instructions,
          profileData: profileData // Passer aussi dans l'état de navigation
        }
      });

    } catch (error: any) {
      setErrors({ general: error.response?.data?.error || 'Erreur lors de la création du compte' });
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handlePhotoUpload = (files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files).slice(0, 6 - formData.photos.length);
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos]
      }));
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const renderProgressBar = () => (
    <div className="flex items-center justify-between mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
            step <= currentStep
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 border-pink-500 text-white'
              : 'border-gray-300 text-gray-400'
          }`}>
            {step < currentStep ? <Check size={20} /> : step}
          </div>
          {step < 4 && (
            <div className={`flex-1 h-1 mx-4 rounded transition-all ${
              step < currentStep ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Informations de base</h2>
        <p className="text-gray-600">Créons votre compte Way-d</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-2" />
            Prénom *
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Votre prénom"
          />
          {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-2" />
            Nom *
          </label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Votre nom"
          />
          {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Mail className="inline w-4 h-4 mr-2" />
          Email *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          placeholder="votre@email.com"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Lock className="inline w-4 h-4 mr-2" />
            Mot de passe *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Mot de passe sécurisé"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Lock className="inline w-4 h-4 mr-2" />
            Confirmer le mot de passe *
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Répétez votre mot de passe"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Genre *
          </label>
          <div className="grid grid-cols-1 gap-3">
            {genderOptions.map((option) => (
              <label key={option.value} className="flex items-center p-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={formData.gender === option.value}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="mr-3 text-pink-500"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-2" />
            Date de naissance *
          </label>
          <input
            type="date"
            value={formData.birthdate}
            onChange={(e) => handleInputChange('birthdate', e.target.value)}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          {errors.birthdate && <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre profil</h2>
        <p className="text-gray-600">Parlez-nous de vous pour créer un profil attractif</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description personnelle *
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          placeholder="Décrivez-vous en quelques lignes... Vos passions, votre personnalité, ce qui vous rend unique !"
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm text-gray-500">{formData.bio.length}/500</span>
          {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-2" />
            Localisation *
          </label>
          <div className="space-y-3">
            <select
              value={formData.country || ''}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">Sélectionnez votre pays</option>
              <option value="FR">🇫🇷 France</option>
              <option value="BE">🇧🇪 Belgique</option>
              <option value="CH">🇨🇭 Suisse</option>
              <option value="CA">🇨🇦 Canada</option>
              <option value="MA">🇲🇦 Maroc</option>
              <option value="DZ">🇩🇿 Algérie</option>
              <option value="TN">🇹🇳 Tunisie</option>
              <option value="SN">🇸🇳 Sénégal</option>
              <option value="CI">🇨🇮 Côte d'Ivoire</option>
              <option value="CM">🇨🇲 Cameroun</option>
              <option value="OTHER">🌍 Autre</option>
            </select>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Ville précise (ex: Paris 15ème, Lyon Centre, Casablanca Maarif...)"
            />
          </div>
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Taille (cm)
          </label>
          <input
            type="number"
            value={formData.height}
            onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
            min="140"
            max="220"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="170"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Briefcase className="inline w-4 h-4 mr-2" />
            Profession *
          </label>
          <input
            type="text"
            value={formData.occupation}
            onChange={(e) => handleInputChange('occupation', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Développeur, Médecin, Étudiant..."
          />
          {errors.occupation && <p className="text-red-500 text-sm mt-1">{errors.occupation}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <GraduationCap className="inline w-4 h-4 mr-2" />
            Éducation *
          </label>
          <select
            value={formData.education}
            onChange={(e) => handleInputChange('education', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">Sélectionnez votre niveau</option>
            {educationLevels.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          {errors.education && <p className="text-red-500 text-sm mt-1">{errors.education}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Préférences & Photos</h2>
        <p className="text-gray-600">Qu'est-ce qui vous intéresse et montrez-vous !</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Heart className="inline w-4 h-4 mr-2" />
          Je recherche *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lookingForOptions.map((option) => (
            <label key={option.value} className="flex items-center p-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="looking_for"
                value={option.value}
                checked={formData.looking_for === option.value}
                onChange={(e) => handleInputChange('looking_for', e.target.value)}
                className="mr-3 text-pink-500"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Centres d'intérêt * (minimum 3)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {interestOptions.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`p-3 rounded-xl border-2 transition-all text-center ${
                formData.interests.includes(interest)
                  ? 'border-pink-500 bg-pink-50 text-pink-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
        {errors.interests && <p className="text-red-500 text-sm mt-2">{errors.interests}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Camera className="inline w-4 h-4 mr-2" />
          Photos * (minimum 2, maximum 6)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handlePhotoUpload(e.target.files)}
            className="hidden"
            id="photo-upload"
          />
          <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center">
            <Upload className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-600">Cliquez pour ajouter des photos</p>
            <p className="text-sm text-gray-400">JPG, PNG - Max 5MB par photo</p>
          </label>
        </div>

        {formData.photos.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {formData.photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        {errors.photos && <p className="text-red-500 text-sm mt-2">{errors.photos}</p>}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Préférences de découverte</h2>
        <p className="text-gray-600">Personnalisez qui vous souhaitez rencontrer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Âge minimum (ans)
          </label>
          <input
            type="range"
            min="18"
            max="100"
            value={formData.min_age}
            onChange={(e) => handleInputChange('min_age', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-way-d"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>18</span>
            <span className="font-medium way-d-secondary">{formData.min_age} ans</span>
            <span>100</span>
          </div>
          {errors.min_age && <p className="text-red-500 text-sm mt-1">{errors.min_age}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Âge maximum (ans)
          </label>
          <input
            type="range"
            min="18"
            max="100"
            value={formData.max_age}
            onChange={(e) => handleInputChange('max_age', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-way-d"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>18</span>
            <span className="font-medium way-d-secondary">{formData.max_age} ans</span>
            <span>100</span>
          </div>
          {errors.max_age && <p className="text-red-500 text-sm mt-1">{errors.max_age}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="inline w-4 h-4 mr-2" />
          Distance maximale (km)
        </label>
        <input
          type="range"
          min="1"
          max="100"
          value={formData.max_distance}
          onChange={(e) => handleInputChange('max_distance', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-way-d"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>1 km</span>
          <span className="font-medium way-d-secondary">{formData.max_distance} km</span>
          <span>100 km</span>
        </div>
      </div>

      <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
        <h3 className="font-medium text-pink-800 mb-2">🎉 Récapitulatif de votre profil</h3>
        <div className="text-sm text-pink-700 space-y-1">
          <p><strong>Nom :</strong> {formData.first_name} {formData.last_name}</p>
          <p><strong>Recherche :</strong> {lookingForOptions.find(o => o.value === formData.looking_for)?.label}</p>
          <p><strong>Âge :</strong> {formData.min_age} - {formData.max_age} ans</p>
          <p><strong>Distance :</strong> Jusqu'à {formData.max_distance} km</p>
          <p><strong>Centres d'intérêt :</strong> {formData.interests.length} sélectionnés</p>
          <p><strong>Photos :</strong> {formData.photos.length} ajoutées</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#021533] to-[#40BDE0] bg-clip-text text-transparent mb-4">
              Rejoignez Way-d
            </h1>
            <p className="text-gray-600 text-lg">
              Créez votre profil complet pour commencer à rencontrer des personnes exceptionnelles
            </p>
          </div>

          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {errors.general}
              </div>
            )}

            {/* Steps */}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center px-6 py-3 rounded-xl transition-all ${
                  currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Précédent
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-[#021533] to-[#40BDE0] text-white rounded-xl hover:from-[#021533]/90 hover:to-[#40BDE0]/90 transition-all transform hover:scale-105"
                >
                  Suivant
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-[#021533] to-[#40BDE0] text-white rounded-xl hover:from-[#021533]/90 hover:to-[#40BDE0]/90 transition-all transform hover:scale-105 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      Créer mon compte
                      <Check className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Vous avez déjà un compte ?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-way-d-secondary hover:text-way-d-secondary/80 font-medium"
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;