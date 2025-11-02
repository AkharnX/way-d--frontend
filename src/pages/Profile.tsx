import { Calendar, Edit, Heart, MapPin, Plus, Settings, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/api';
import type { Profile as ProfileType } from '../types';
import { getErrorMessage, logError } from '../utils/errorUtils';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (error: any) {
      logError('Error loading profile:', error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate('/edit-profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-8">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profil introuvable</h2>
          <div className="text-red-600 mb-4">{error}</div>
          <div className="space-x-4">
            <button
              onClick={loadProfile}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Réessayer
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Modifier le profil
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-8">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Aucun profil trouvé</h2>
          <p className="text-gray-600 mb-6">Créez votre profil pour commencer à utiliser Way-d</p>
          <button
            onClick={handleEdit}
            className="px-6 py-3 bg-way-d-secondary text-white rounded-md hover:bg-way-d-secondary/90 flex items-center mx-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Modifier mon profil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="bg-gradient-to-r from-way-d-primary to-way-d-secondary p-6 text-white rounded-t-lg">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-6">
                  {profile.photos && profile.photos.length > 0 ? (
                    <img
                      src={profile.photos[0]}
                      alt={profile.first_name}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96x96?text=' + profile.first_name?.charAt(0);
                      }}
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  <div className="flex items-center mt-2 text-white text-opacity-90">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{profile.age} ans</span>
                    {profile.location && (
                      <>
                        <span className="mx-2">•</span>
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{profile.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleEdit}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {profile.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">À propos de moi</h3>
                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {profile.photos && profile.photos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {profile.photos.map((photo, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden">
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=Photo';
                            }}
                            onClick={() => window.open(photo, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profile.interests && profile.interests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Centres d'intérêt</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, index) => (
                        <span key={index} className="bg-way-d-secondary/10 text-way-d-secondary px-3 py-1 rounded-full text-sm border border-way-d-secondary/20">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
                  <div className="space-y-3">
                    {profile.profession && (
                      <div className="flex items-center">
                        <span className="text-gray-600 text-sm">Profession:</span>
                        <span className="ml-2 text-gray-900">{profile.profession}</span>
                      </div>
                    )}

                    {profile.education && (
                      <div className="flex items-center">
                        <span className="text-gray-600 text-sm">Éducation:</span>
                        <span className="ml-2 text-gray-900">{profile.education}</span>
                      </div>
                    )}

                    {profile.looking_for && (
                      <div className="flex items-start">
                        <Heart className="w-4 h-4 text-red-500 mt-1 mr-2" />
                        <div>
                          <span className="text-gray-600 text-sm block">Recherche:</span>
                          <span className="text-gray-900 text-sm">
                            {profile.looking_for === 'serious' ? 'Une relation sérieuse' :
                              profile.looking_for === 'casual' ? 'Quelque chose de décontracté' :
                                profile.looking_for === 'friends' ? 'Des amis' :
                                  'Je ne sais pas encore'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate('/discovery')}
                      className="w-full px-4 py-2 bg-way-d-secondary text-white rounded-md hover:bg-way-d-secondary/90 text-sm"
                    >
                      Découvrir des profils
                    </button>
                    <button
                      onClick={() => navigate('/messages')}
                      className="w-full px-4 py-2 bg-way-d-primary text-white rounded-md hover:bg-way-d-primary/90 text-sm"
                    >
                      Mes messages
                    </button>
                    <button
                      onClick={handleEdit}
                      className="w-full px-4 py-2 border border-way-d-primary text-way-d-primary rounded-md hover:bg-way-d-primary/5 text-sm"
                    >
                      Modifier le profil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
