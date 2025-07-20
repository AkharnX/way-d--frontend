import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/api';
import { User, Upload, MapPin, Calendar, Heart } from 'lucide-react';
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

function CreateProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const [newInterest, setNewInterest] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const interestSuggestions = [
    'Voyage', 'Sport', 'Cinéma', 'Musique', 'Lecture', 'Cuisine', 'Art',
    'Technologie', 'Nature', 'Photographie', 'Danse', 'Fitness', 'Gaming'
  ];

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
      await profileService.createProfile(formData);
      navigate('/profile');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      alert('Erreur lors de la création du profil: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <PageHeader 
        title="Créer votre profil"
        showBack={true}
        customBackAction={() => navigate('/app')}
      />
      
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-6">
              <User className="w-8 h-8 text-cyan-400 mr-3" />
              <h2 className="text-2xl font-bold">Informations personnelles</h2>
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
                  <option value="serious">Relation sérieuse</option>
                  <option value="casual">Relation décontractée</option>
                  <option value="friendship">Amitié</option>
                  <option value="open">Ouvert à tout</option>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Taille (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  min="140"
                  max="220"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-white"
                  placeholder="175"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Profession</label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-white"
                />
              </div>
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

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-400 text-slate-900 py-3 px-4 rounded-md font-medium hover:bg-opacity-80 disabled:opacity-50"
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
