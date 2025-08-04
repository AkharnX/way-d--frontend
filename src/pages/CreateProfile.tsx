import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { profileService, authService } from '../services/api';
import { User, Upload, MapPin, Calendar, Heart, AlertCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';

interface ProfileForm {
  first_name: string;
  last_name: string;
  bio: string;
  age: number;
  height: number;
  location: string;
  interests: string[];
  photos: string[];
  looking_for: string;
  education: string;
  profession: string;
}

interface DynamicData {
  interestSuggestions: string[];
  professionOptions: string[];
  educationLevels: string[];
  lookingForOptions: Array<{ value: string; label: string }>;
}

function CreateProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRequired, setIsRequired] = useState(false);

  // Pré-remplir les données depuis l'état de navigation ou l'utilisateur connecté
  const [formData, setFormData] = useState<ProfileForm>({
    first_name: '',
    last_name: '',
    bio: '',
    age: 18,
    height: 175,
    location: '',
    interests: [],
    photos: [],
    looking_for: 'serious',
    education: '',
    profession: ''
  });

  const [dynamicData, setDynamicData] = useState<DynamicData>({
    interestSuggestions: [],
    professionOptions: [],
    educationLevels: [],
    lookingForOptions: [
      { value: 'serious', label: 'Relation sérieuse' },
      { value: 'casual', label: 'Relation décontractée' },
      { value: 'friends', label: 'Amitié' },
      { value: 'unsure', label: 'Je ne sais pas encore' }
    ]
  });

  const [newInterest, setNewInterest] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Load dynamic data and user data on component mount
  useEffect(() => {
    loadDynamicData();
    initializeUserData();
  }, []);

  const initializeUserData = async () => {
    try {
      // Vérifier si c'est un profil requis depuis la navigation
      if (location.state?.required) {
        setIsRequired(true);
      }

      // Récupérer les données utilisateur actuelles
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        // Calculer l'âge depuis la date de naissance
        const birthDate = new Date(currentUser.birth_date);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        
        setFormData(prev => ({
          ...prev,
          first_name: currentUser.first_name || '',
          last_name: currentUser.last_name || '',
          age: age || 18
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Erreur lors du chargement des données utilisateur');
    }
  };

  const loadDynamicData = async () => {
    try {
      const [interests, professions, education, lookingFor] = await Promise.all([
        profileService.getInterestsSuggestions(),
        profileService.getProfessionsSuggestions(),
        profileService.getEducationLevels(),
        profileService.getLookingForOptions()
      ]);

      setDynamicData({
        interestSuggestions: interests,
        professionOptions: professions,
        educationLevels: education,
        lookingForOptions: lookingFor
      });
    } catch (error) {
      console.error('Error loading dynamic data:', error);
      // Keep fallback data that's already set in state
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 18 : value
    }));
  };

  const addInterest = (interest: string) => {
    if (interest && !formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const addPhoto = () => {
    if (photoUrl && !formData.photos.includes(photoUrl)) {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, photoUrl]
      }));
      setPhotoUrl('');
    }
  };

  const removePhoto = (photo: string) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p !== photo)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation des champs requis
    if (!formData.first_name || !formData.last_name) {
      setError('Le prénom et le nom sont obligatoires');
      setLoading(false);
      return;
    }

    if (formData.age < 18) {
      setError('Vous devez avoir au moins 18 ans pour utiliser cette application');
      setLoading(false);
      return;
    }

    try {
      await profileService.createProfile(formData);
      // Profile créé avec succès - redirection obligatoire vers l'app
      navigate('/app', { replace: true });
    } catch (error: any) {
      console.error('Error creating profile:', error);
      setError('Erreur lors de la création du profil: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <PageHeader 
        title="Créer votre profil"
        showBack={!isRequired}
        customBackAction={isRequired ? undefined : () => navigate('/app')}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Message d'alerte si le profil est requis */}
            {isRequired && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="text-orange-600 w-5 h-5" />
                <p className="text-orange-800 font-medium">
                  Vous devez créer votre profil pour accéder à l'application
                </p>
              </div>
            )}

            {/* Message d'erreur */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-way-d-primary to-way-d-secondary bg-clip-text text-transparent mb-4">
                {isRequired ? 'Finalisez votre inscription' : 'Créer votre profil'}
              </h1>
              <p className="text-gray-600 text-lg">
                {isRequired ? 'Complétez votre profil pour commencer' : 'Montrez qui vous êtes vraiment'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Informations personnelles */}
              <div className="bg-way-d-primary/5 rounded-2xl p-8 border border-way-d-primary/10">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-way-d-primary rounded-full flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold way-d-primary">Informations personnelles</h2>
                </div>
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold text-gray-700 mb-3 text-lg">Prénom</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-3 text-lg">Nom</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold text-gray-700 mb-3 text-lg">
                  <Calendar className="w-5 h-5 inline mr-2 way-d-secondary" />
                  Âge
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="18"
                  max="100"
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-3 text-lg">
                  <Heart className="w-5 h-5 inline mr-2 way-d-secondary" />
                  Recherche
                </label>
                <select
                  name="looking_for"
                  value={formData.looking_for}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {dynamicData.lookingForOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
              </div>

              {/* Localisation et détails */}
              <div className="bg-way-d-secondary/5 rounded-2xl p-8 border border-way-d-secondary/10">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-way-d-secondary rounded-full flex items-center justify-center mr-4">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold way-d-primary">Localisation & Détails</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-3 text-lg">
                      <MapPin className="w-5 h-5 inline mr-2 way-d-secondary" />
                      Localisation
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Ville, Pays"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-3 text-lg">Taille (cm)</label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        min="140"
                        max="220"
                        className="input-field"
                        placeholder="175"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-3 text-lg">Profession</label>
                      <select
                        name="profession"
                        value={formData.profession}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      >
                        <option value="">Sélectionner une profession</option>
                        {dynamicData.professionOptions.map((profession) => (
                          <option key={profession} value={profession}>
                            {profession}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-3 text-lg">Éducation</label>
                      <select
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      >
                        <option value="">Sélectionner un niveau</option>
                        {dynamicData.educationLevels.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-3 text-lg">Présentation</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="input-field resize-none"
                      placeholder="Parlez-nous de vous..."
                    />
                  </div>
                </div>
              </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Centres d'intérêt</label>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Ajouter un centre d'intérêt"
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addInterest(newInterest);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => addInterest(newInterest)}
                  className="px-4 py-2 bg-way-d-secondary text-white rounded-md hover:bg-way-d-secondary/90"
                >
                  Ajouter
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {dynamicData.interestSuggestions.map((suggestion: string) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addInterest(suggestion)}
                    disabled={formData.interests.includes(suggestion)}
                    className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-way-d-secondary text-white"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="ml-2 text-white hover:text-gray-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Upload className="w-4 h-4 inline mr-1" />
                Photos
              </label>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="URL de votre photo"
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-white"
                />
                <button
                  type="button"
                  onClick={addPhoto}
                  className="px-4 py-2 bg-way-d-secondary text-white rounded-md hover:bg-way-d-secondary/90"
                >
                  Ajouter Photo
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-way-d-primary to-way-d-secondary text-white py-3 px-4 rounded-xl font-medium hover:from-way-d-primary/90 hover:to-way-d-secondary/90 disabled:opacity-50 transition-all transform hover:scale-105"
              >
                {loading ? 'Création...' : 'Créer mon profil'}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateProfile;
