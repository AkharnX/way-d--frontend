import React, { useState, useEffect } from 'react';
import type { Profile } from '../types';
import { profileService, interactionsService } from '../services/api';
import { logError, getErrorMessage } from '../utils/errorUtils';
import { Heart, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const Discovery: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastAction, setLastAction] = useState<{ type: 'like' | 'dislike'; profileId: string; profileName: string } | null>(null);
  const [showStats, setShowStats] = useState(false);
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
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Loading filtered discovery profiles...');
      
      // Use the backend-optimized discover endpoint that excludes already interacted profiles
      const data = await profileService.getDiscoverProfiles();
      console.log(`📊 Loaded ${data.length} filtered profiles for discovery`);
      
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

  const refreshProfiles = async () => {
    try {
      setRefreshing(true);
      console.log('🔄 Refreshing discovery profiles...');
      await loadProfiles();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLike = async () => {
    if (!currentProfile) return;

    try {
      console.log(`💚 Liking profile: ${currentProfile.first_name}`);
      
      // Send like to backend
      const result = await interactionsService.likeProfile(currentProfile.id || currentProfile.user_id);
      
      // Check if it's a match!
      if (result?.match) {
        // Show match notification (you can add a modal/toast here later)
        console.log('🎉 IT\'S A MATCH!', result.match);
        alert(`🎉 C'est un match avec ${currentProfile.first_name} !`);
      }
      
      // Remove this profile from the list and move to next
      removeCurrentProfileAndNext();
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        totalLikes: prevStats.totalLikes + 1,
        likesReceived: prevStats.likesReceived + (result?.match ? 1 : 0)
      }));
      setLastAction({ type: 'like', profileId: currentProfile.id || '', profileName: currentProfile.first_name || 'Utilisateur' });
    } catch (error: any) {
      logError('Error liking profile:', error);
      setError(getErrorMessage(error));
    }
  };

  const handleDislike = async () => {
    if (!currentProfile) return;

    try {
      console.log(`❌ Disliking profile: ${currentProfile.first_name}`);
      
      // Send dislike to backend
      await interactionsService.dislikeProfile(currentProfile.id || currentProfile.user_id);
      
      // Remove this profile from the list and move to next
      removeCurrentProfileAndNext();
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        totalDislikes: prevStats.totalDislikes + 1
      }));
      setLastAction({ type: 'dislike', profileId: currentProfile.id || '', profileName: currentProfile.first_name || 'Utilisateur' });
    } catch (error: any) {
      logError('Error disliking profile:', error);
      setError(getErrorMessage(error));
    }
  };

  const removeCurrentProfileAndNext = () => {
    // Remove the current profile from the list
    const updatedProfiles = profiles.filter((_, index) => index !== currentProfileIndex);
    setProfiles(updatedProfiles);
    
    // If we're at the end of the list, stay at the last profile
    if (currentProfileIndex >= updatedProfiles.length) {
      setCurrentProfileIndex(Math.max(0, updatedProfiles.length - 1));
    }
    
    // If no profiles left, try to load more
    if (updatedProfiles.length === 0) {
      console.log('📭 No more profiles, attempting to load more...');
      loadProfiles();
    }
  };

  const toggleStats = () => {
    setShowStats(prev => !prev);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Recherche de nouveaux profils...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-white/90 mb-6 text-lg">{error}</div>
        <button 
          onClick={loadProfiles} 
          className="btn-secondary text-lg"
          disabled={refreshing}
        >
          {refreshing ? 'Actualisation...' : 'Réessayer'}
        </button>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="text-center py-12">
        <div className="text-white/90 mb-6 text-xl">
          🎉 Vous avez découvert tous les profils disponibles !
        </div>
        <div className="text-white/70 mb-6 text-lg">
          De nouveaux profils apparaîtront quand d'autres utilisateurs s'inscriront.
        </div>
        <button 
          onClick={refreshProfiles} 
          className="btn-secondary text-lg"
          disabled={refreshing}
        >
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header with refresh button */}
      <PageHeader 
        title="Découvrir" 
        rightActions={
          <button
            onClick={refreshProfiles}
            disabled={refreshing}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Actualiser les profils"
          >
            <svg 
              className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </button>
        }
      />

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Profile Image */}
        <div className="h-96 bg-gray-200 flex items-center justify-center">
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
            <span className="text-8xl text-gray-400">👤</span>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentProfile.first_name} {currentProfile.last_name && currentProfile.last_name}, {currentProfile.age}
          </h2>
          
          <div className="space-y-2 mb-4">
            {(currentProfile.profession || currentProfile.occupation) && (
              <p className="text-gray-600">
                <span className="font-semibold">Profession:</span> {currentProfile.profession || currentProfile.occupation}
              </p>
            )}
            
            {currentProfile.location && (
              <p className="text-gray-600">
                <span className="font-semibold">Lieu:</span> {currentProfile.location}
              </p>
            )}
            
            {currentProfile.height && (
              <p className="text-gray-600">
                <span className="font-semibold">Taille:</span> {currentProfile.height} cm
              </p>
            )}
            
            {(currentProfile.bio || currentProfile.trait) && (
              <p className="text-gray-600">
                <span className="font-semibold">À propos:</span> {currentProfile.bio || currentProfile.trait}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-8">
            <button
              onClick={handleDislike}
              className="w-20 h-20 bg-white/90 hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-xl hover:shadow-2xl backdrop-blur-sm border-2 border-gray-200 hover:border-red-300"
              title="Passer"
            >
              <X className="w-10 h-10" />
            </button>
            
            <button
              onClick={handleLike}
              className="w-24 h-24 bg-way-d-secondary hover:bg-way-d-secondary/90 text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-xl hover:shadow-2xl"
              title="J'aime"
            >
              <Heart className="w-12 h-12 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 text-center">
        <div className="text-white/80 mb-3 font-medium">
          Profil {currentProfileIndex + 1} sur {profiles.length}
        </div>
        {profiles.length > 1 && (
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-way-d-secondary h-3 rounded-full transition-all duration-500 shadow-sm" 
              style={{ width: `${((currentProfileIndex + 1) / profiles.length) * 100}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Last action info */}
      {lastAction && (
        <div className="mt-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div className="text-white/90 font-medium">
              Dernière action: {lastAction.type === 'like' ? 'Aimé' : 'Passé'} {lastAction.profileName}
            </div>
            <button 
              onClick={toggleStats} 
              className="way-d-secondary hover:text-way-d-secondary/80 font-medium underline transition-colors"
            >
              {showStats ? 'Cacher les stats' : 'Voir les stats'}
            </button>
          </div>

          {showStats && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-white/80">
              <div className="bg-white/10 p-3 rounded-xl">
                <div className="text-2xl font-bold way-d-secondary">{stats.totalLikes}</div>
                <div className="text-sm">J'aime donnés</div>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <div className="text-2xl font-bold text-white">{stats.totalDislikes}</div>
                <div className="text-sm">Profils passés</div>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <div className="text-2xl font-bold way-d-secondary">{stats.totalMatches}</div>
                <div className="text-sm">Matches</div>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <div className="text-2xl font-bold text-white">{stats.likesReceived}</div>
                <div className="text-sm">J'aime reçus</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Discovery;
