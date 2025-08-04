import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Profile } from '../types';
import { profileService, interactionsService } from '../services/api';
import { logError, getErrorMessage } from '../utils/errorUtils';
import { Heart, X, MapPin, Briefcase, Sparkles, RotateCcw, TrendingUp } from 'lucide-react';

const ModernDiscovery: React.FC = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastAction, setLastAction] = useState<{ type: 'like' | 'dislike'; profileId: string; profileName: string } | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [matchModal, setMatchModal] = useState<{ show: boolean; profile?: Profile }>({ show: false });
  const [stats, setStats] = useState({
    totalLikes: 0,
    totalDislikes: 0,
    totalMatches: 0,
    likesReceived: 0,
    profileViews: 0
  });

  const currentProfile = profiles[currentProfileIndex];

  useEffect(() => {
    loadProfiles();
    loadStats();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Loading fresh discovery profiles...');
      
      // Utiliser l'endpoint optimisé qui exclut les profils déjà likés/dislikés
      const data = await profileService.getDiscoverProfiles();
      console.log(`📊 Loaded ${data.length} fresh profiles for discovery`);
      
      if (data.length === 0) {
        setError('Aucun nouveau profil à découvrir pour le moment. Revenez plus tard !');
      } else {
        setProfiles(data);
        setCurrentProfileIndex(0);
      }
    } catch (error: any) {
      logError('Error loading profiles:', error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const userStats = await interactionsService.getUserStats();
      setStats(userStats);
    } catch (error) {
      console.warn('Could not load stats:', error);
    }
  };

  const refreshProfiles = async () => {
    try {
      setRefreshing(true);
      console.log('🔄 Refreshing discovery profiles...');
      await loadProfiles();
      await loadStats();
    } catch (error) {
      console.error('Error refreshing profiles:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLike = async () => {
    if (!currentProfile || actionLoading) return;

    try {
      setActionLoading(true);
      console.log(`💚 Liking profile: ${currentProfile.first_name}`);
      
      const result = await interactionsService.likeProfile(currentProfile.id || currentProfile.user_id);
      
      // Check if it's a match!
      if (result?.match) {
        console.log('🎉 IT\'S A MATCH!', result.match);
        setMatchModal({ show: true, profile: currentProfile });
        setStats(prev => ({ ...prev, totalMatches: prev.totalMatches + 1 }));
      }
      
      // Remove this profile and move to next
      removeCurrentProfileAndNext();
      
      setStats(prev => ({ ...prev, totalLikes: prev.totalLikes + 1 }));
      setLastAction({ type: 'like', profileId: currentProfile.id || '', profileName: currentProfile.first_name || 'Utilisateur' });
    } catch (error: any) {
      logError('Error liking profile:', error);
      
      if (error.response?.status === 409 && error.response?.data?.error === 'Already liked') {
        console.log(`⚠️ Profile ${currentProfile.first_name} was already liked - removing from discovery`);
        removeCurrentProfileAndNext();
        setLastAction({ type: 'like', profileId: currentProfile.id || '', profileName: currentProfile.first_name || 'Utilisateur' });
        return;
      }
      
      setError(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDislike = async () => {
    if (!currentProfile || actionLoading) return;

    try {
      setActionLoading(true);
      console.log(`❌ Disliking profile: ${currentProfile.first_name}`);
      
      await interactionsService.dislikeProfile(currentProfile.id || currentProfile.user_id);
      
      removeCurrentProfileAndNext();
      
      setStats(prev => ({ ...prev, totalDislikes: prev.totalDislikes + 1 }));
      setLastAction({ type: 'dislike', profileId: currentProfile.id || '', profileName: currentProfile.first_name || 'Utilisateur' });
    } catch (error: any) {
      logError('Error disliking profile:', error);
      
      if (error.response?.status === 409 && error.response?.data?.error === 'Already disliked') {
        console.log(`⚠️ Profile ${currentProfile.first_name} was already disliked - removing from discovery`);
        removeCurrentProfileAndNext();
        setLastAction({ type: 'dislike', profileId: currentProfile.id || '', profileName: currentProfile.first_name || 'Utilisateur' });
        return;
      }
      
      setError(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const removeCurrentProfileAndNext = () => {
    const updatedProfiles = profiles.filter((_, index) => index !== currentProfileIndex);
    setProfiles(updatedProfiles);
    
    if (currentProfileIndex >= updatedProfiles.length) {
      setCurrentProfileIndex(Math.max(0, updatedProfiles.length - 1));
    }
    
    if (updatedProfiles.length === 0) {
      console.log('📭 No more profiles, attempting to load more...');
      loadProfiles();
    }
  };

  const closeMatchModal = () => {
    setMatchModal({ show: false });
  };

  const toggleStats = () => {
    setShowStats(prev => !prev);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Recherche de nouveaux profils...</h3>
          <p className="text-gray-500">Préparation de votre découverte personnalisée</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-pink-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Aucun nouveau profil</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={refreshProfiles} 
            disabled={refreshing}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50"
          >
            {refreshing ? (
              <>
                <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                Actualisation...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Réessayer
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">🎉 Félicitations !</h3>
          <p className="text-gray-600 mb-6">
            Vous avez découvert tous les profils disponibles ! De nouveaux profils apparaîtront quand d'autres utilisateurs s'inscriront.
          </p>
          <button 
            onClick={refreshProfiles} 
            disabled={refreshing}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50"
          >
            {refreshing ? 'Actualisation...' : 'Actualiser'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Découverte</h1>
                <p className="text-sm text-gray-500">{profiles.length} profils à découvrir</p>
              </div>
            </div>
            <button
              onClick={refreshProfiles}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
              title="Actualiser les profils"
            >
              <RotateCcw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6 transform transition-all duration-300 hover:scale-[1.02]">
          {/* Profile Image */}
          <div className="relative h-96 bg-gradient-to-b from-gray-200 to-gray-300">
            {currentProfile.photos && currentProfile.photos.length > 0 ? (
              <img
                src={currentProfile.photos[0]}
                alt={currentProfile.first_name}
                className="w-full h-full object-cover"
              />
            ) : currentProfile.profile_photo_url ? (
              <img
                src={currentProfile.profile_photo_url}
                alt={currentProfile.first_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-6xl text-gray-400">👤</div>
              </div>
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Age badge */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-sm font-semibold text-gray-800">{currentProfile.age} ans</span>
            </div>
            
            {/* Name overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold text-white mb-1">
                {currentProfile.first_name} {currentProfile.last_name && currentProfile.last_name}
              </h2>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-6 space-y-4">
            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4">
              {(currentProfile.profession || currentProfile.occupation) && (
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-pink-500" />
                  <span className="text-sm text-gray-600">{currentProfile.profession || currentProfile.occupation}</span>
                </div>
              )}
              
              {currentProfile.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-pink-500" />
                  <span className="text-sm text-gray-600">{currentProfile.location}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {(currentProfile.bio || currentProfile.trait) && (
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-gray-700 leading-relaxed">
                  {currentProfile.bio || currentProfile.trait}
                </p>
              </div>
            )}

            {/* Interests */}
            {currentProfile.interests && currentProfile.interests.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Centres d'intérêt</h4>
                <div className="flex flex-wrap gap-2">
                  {currentProfile.interests.slice(0, 6).map((interest, index) => (
                    <span key={index} className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
                      {interest}
                    </span>
                  ))}
                  {currentProfile.interests.length > 6 && (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                      +{currentProfile.interests.length - 6} autres
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Additional Info */}
            {currentProfile.height && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Taille:</span>
                <span className="text-sm font-medium text-gray-700">{currentProfile.height} cm</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-6 mb-6">
          <button
            onClick={handleDislike}
            disabled={actionLoading}
            className="w-16 h-16 bg-white hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl disabled:opacity-50 border-2 border-gray-200 hover:border-red-300"
            title="Passer"
          >
            <X className="w-8 h-8" />
          </button>
          
          <button
            onClick={handleLike}
            disabled={actionLoading}
            className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-xl hover:shadow-2xl disabled:opacity-50"
            title="J'aime"
          >
            {actionLoading ? (
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Heart className="w-10 h-10 fill-current" />
            )}
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Profil {currentProfileIndex + 1} sur {profiles.length}</span>
            <button
              onClick={toggleStats}
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              {showStats ? 'Masquer les stats' : 'Voir mes stats'}
            </button>
          </div>
          {profiles.length > 1 && (
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${((currentProfileIndex + 1) / profiles.length) * 100}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Last action info */}
        {lastAction && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-gray-100">
            <div className="flex items-center justify-center space-x-2">
              {lastAction.type === 'like' ? (
                <Heart className="w-4 h-4 text-pink-500 fill-current" />
              ) : (
                <X className="w-4 h-4 text-gray-500" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {lastAction.type === 'like' ? 'Vous avez aimé' : 'Vous avez passé'} {lastAction.profileName}
              </span>
            </div>
          </div>
        )}

        {/* Stats Panel */}
        {showStats && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-pink-500" />
              Vos statistiques
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-pink-50 rounded-xl">
                <div className="text-2xl font-bold text-pink-600">{stats.totalLikes}</div>
                <div className="text-sm text-gray-600">J'aime donnés</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">{stats.totalMatches}</div>
                <div className="text-sm text-gray-600">Matches</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-600">{stats.totalDislikes}</div>
                <div className="text-sm text-gray-600">Profils passés</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{stats.likesReceived}</div>
                <div className="text-sm text-gray-600">J'aime reçus</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Match Modal */}
      {matchModal.show && matchModal.profile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center transform animate-bounce">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">🎉 C'est un match !</h3>
            <p className="text-gray-600 mb-6">
              Vous et {matchModal.profile.first_name} vous êtes aimés mutuellement !
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  closeMatchModal();
                  // Navigate to messages with the new match
                  if (matchModal.profile) {
                    navigate('/app/messages', { 
                      state: { 
                        newMatch: matchModal.profile,
                        message: `Félicitations ! Vous avez matché avec ${matchModal.profile.first_name}. Commencez la conversation !`
                      }
                    });
                  }
                }}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all font-medium"
              >
                💬 Envoyer un message
              </button>
              <button
                onClick={closeMatchModal}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
              >
                Continuer à découvrir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernDiscovery;
