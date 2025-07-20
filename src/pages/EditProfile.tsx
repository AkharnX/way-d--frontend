import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/api';
import { Upload, MapPin, Calendar, Heart, Edit, Save } from 'lucide-react';
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
  looking_for: 'serious' | 'casual' | 'friends' | 'unsure';
  education: string;
  profession: string;
}

interface DynamicData {
  interestSuggestions: string[];
  professionOptions: string[];
  educationLevels: string[];
  lookingForOptions: Array<{ value: string; label: string }>;
}

function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [dynamicDataLoading, setDynamicDataLoading] = useState(true);
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

  const interestSuggestions = dynamicData.interestSuggestions;

  useEffect(() => {
    loadProfile();
    loadDynamicData();
  }, []);

  const loadDynamicData = async () => {
    setDynamicDataLoading(true);
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
    } finally {
      setDynamicDataLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const profile = await profileService.getProfile();
      
      if (profile) {
        setFormData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          bio: profile.bio || '',
          age: profile.age || 18,
          height: profile.height || 175,
          location: profile.location || '',
          interests: profile.interests || [],
          photos: profile.photos || [],
          looking_for: profile.looking_for || 'serious',
          education: profile.education || '',
          profession: profile.profession || ''
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      if (error.response?.status === 404) {
        navigate('/create-profile');
      }
    } finally {
      setLoadingProfile(false);
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

    try {
      await profileService.updateProfile(formData);
      navigate('/profile');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Erreur lors de la mise à jour: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-light border-t-transparent mx-auto mb-4"></div>
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <PageHeader 
        title="Modifier votre profil"
        showBack={true}
        customBackAction={() => navigate('/app/profile')}
      />
      
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Edit className="w-8 h-8 text-cyan-400 mr-3" />
              <h2 className="text-2xl font-bold">Modifier vos informations</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Prénom</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  <Heart className="w-4 h-4 inline mr-1" />
                  Recherche
                </label>
                <select
                  name="looking_for"
                  value={formData.looking_for}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-white"
                >
                  {dynamicData.lookingForOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Localisation
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-white"
                placeholder="Ville, Pays"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Présentation</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-white"
                placeholder="Parlez-nous de vous..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Profession</label>
                <select
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-white"
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Éducation</label>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-white"
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
                  className="px-4 py-2 bg-cyan-400 text-slate-900 rounded-md hover:bg-opacity-80"
                >
                  Ajouter
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {interestSuggestions.map((suggestion) => (
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
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cyan-400 text-slate-900"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="ml-2 text-slate-900 hover:text-gray-600"
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
                  className="px-4 py-2 bg-cyan-400 text-slate-900 rounded-md hover:bg-opacity-80"
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

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-cyan-400 text-slate-900 rounded-md font-medium hover:bg-opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-dark border-t-transparent"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
