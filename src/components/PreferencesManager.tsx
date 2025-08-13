import { useState, useEffect } from 'react';
import { ProfilePreference } from '../types';
import { Settings, Users, MapPin, Calendar, Heart, Tag } from 'lucide-react';
import { configService } from '../services/configService';
import { preferencesService } from '../services/preferencesService';

interface EnhancedProfilePreference extends ProfilePreference {
  gender_preference?: string;
  looking_for?: string[];
  interests_filter?: string[];
}

interface PreferencesManagerProps {
  preferences: Partial<EnhancedProfilePreference>;
  onPreferencesChange: (preferences: Partial<EnhancedProfilePreference>) => void;
  className?: string;
  showInterestsFilter?: boolean;
  showGenderPreference?: boolean;
}

export default function PreferencesManager({ 
  preferences, 
  onPreferencesChange, 
  className = '',
  showInterestsFilter = true,
  showGenderPreference = true
}: PreferencesManagerProps) {
  const [localPrefs, setLocalPrefs] = useState({
    min_age: preferences.min_age || 18,
    max_age: preferences.max_age || 50,
    min_distance: preferences.min_distance || 1,
    max_distance: preferences.max_distance || 50,
    gender_preference: preferences.gender_preference || 'any',
    looking_for: preferences.looking_for || [],
    interests_filter: preferences.interests_filter || []
  });

  // Dynamic data from config service
  const [preferenceRanges, setPreferenceRanges] = useState({
    ageRanges: [
      { value: 18, label: '18 ans' },
      { value: 21, label: '21 ans' },
      { value: 25, label: '25 ans' },
      { value: 30, label: '30 ans' },
      { value: 35, label: '35 ans' },
      { value: 40, label: '40 ans' },
      { value: 45, label: '45 ans' },
      { value: 50, label: '50 ans' },
      { value: 60, label: '60 ans' },
      { value: 70, label: '70+ ans' }
    ],
    distanceRanges: [
      { value: 1, label: '1 km' },
      { value: 5, label: '5 km' },
      { value: 10, label: '10 km' },
      { value: 25, label: '25 km' },
      { value: 50, label: '50 km' },
      { value: 100, label: '100 km' },
      { value: 200, label: '200 km' },
      { value: 500, label: '500+ km' }
    ],
    genderOptions: [
      { value: 'any', label: 'Peu importe' },
      { value: 'male', label: 'Hommes' },
      { value: 'female', label: 'Femmes' },
      { value: 'non-binary', label: 'Non-binaire' }
    ],
    lookingForOptions: [
      { value: 'serious', label: 'Relation sérieuse' },
      { value: 'casual', label: 'Relation décontractée' },
      { value: 'friends', label: 'Amitié' },
      { value: 'networking', label: 'Réseautage' }
    ],
    availableInterests: [
      'Football', 'Basketball', 'Musique', 'Danse', 'Cuisine', 'Voyages',
      'Lecture', 'Cinéma', 'Photographie', 'Art', 'Mode', 'Technologie',
      'Fitness', 'Yoga', 'Nature', 'Festivals', 'Culture africaine'
    ]
  });

  // Load dynamic preference ranges on component mount
  useEffect(() => {
    loadPreferenceRanges();
  }, []);

  const loadPreferenceRanges = async () => {
    try {
      const ranges = await configService.getPreferenceRanges();
      setPreferenceRanges(prev => ({ ...prev, ...ranges }));
      
      // Also load interests from preferences service
      if (showInterestsFilter) {
        const options = await preferencesService.getPreferenceOptions();
        setPreferenceRanges(prev => ({
          ...prev,
          genderOptions: options.genderOptions,
          lookingForOptions: options.lookingForOptions
        }));
      }
    } catch (error) {
      console.error('Error loading preference ranges:', error);
      // Keep default ranges if loading fails
    }
  };

  const handleChange = (field: string, value: number | string | string[]) => {
    const newPrefs = { ...localPrefs, [field]: value };
    setLocalPrefs(newPrefs);
    onPreferencesChange(newPrefs);
  };

  const addInterestFilter = (interest: string) => {
    if (!localPrefs.interests_filter.includes(interest)) {
      const newInterests = [...localPrefs.interests_filter, interest];
      handleChange('interests_filter', newInterests);
    }
  };

  const removeInterestFilter = (interest: string) => {
    const newInterests = localPrefs.interests_filter.filter(i => i !== interest);
    handleChange('interests_filter', newInterests);
  };

  const toggleLookingFor = (value: string) => {
    const newLookingFor = localPrefs.looking_for.includes(value)
      ? localPrefs.looking_for.filter(item => item !== value)
      : [...localPrefs.looking_for, value];
    handleChange('looking_for', newLookingFor);
  };

  return (
    <div className={className}>
      <div className="flex items-center mb-6">
        <Settings className="w-5 h-5 mr-2 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Préférences de recherche</h3>
      </div>

      <div className="space-y-6">
        {/* Age Preferences */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            <h4 className="font-medium text-gray-900">Tranche d'âge</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Âge minimum
              </label>
              <select
                value={localPrefs.min_age}
                onChange={(e) => handleChange('min_age', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {preferenceRanges.ageRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Âge maximum
              </label>
              <select
                value={localPrefs.max_age}
                onChange={(e) => handleChange('max_age', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {preferenceRanges.ageRanges.filter(range => range.value >= localPrefs.min_age).map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Recherche entre {localPrefs.min_age} et {localPrefs.max_age} ans
            </p>
          </div>
        </div>

        {/* Distance Preferences */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <MapPin className="w-5 h-5 mr-2 text-green-600" />
            <h4 className="font-medium text-gray-900">Distance géographique</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distance minimum
              </label>
              <select
                value={localPrefs.min_distance}
                onChange={(e) => handleChange('min_distance', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                {preferenceRanges.distanceRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distance maximum
              </label>
              <select
                value={localPrefs.max_distance}
                onChange={(e) => handleChange('max_distance', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                {preferenceRanges.distanceRanges.filter(range => range.value >= localPrefs.min_distance).map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              Recherche entre {localPrefs.min_distance} km et {localPrefs.max_distance} km
            </p>
          </div>
        </div>

        {/* Gender Preference */}
        {showGenderPreference && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              <h4 className="font-medium text-gray-900">Préférence de genre</h4>
            </div>
            
            <select
              value={localPrefs.gender_preference}
              onChange={(e) => handleChange('gender_preference', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              {preferenceRanges.genderOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="mt-3 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700">
                Recherche: {preferenceRanges.genderOptions.find(opt => opt.value === localPrefs.gender_preference)?.label}
              </p>
            </div>
          </div>
        )}

        {/* Looking For Preferences */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <Heart className="w-5 h-5 mr-2 text-pink-600" />
            <h4 className="font-medium text-gray-900">Type de relation recherchée</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {preferenceRanges.lookingForOptions.map(option => (
              <label key={option.value} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPrefs.looking_for.includes(option.value)}
                  onChange={() => toggleLookingFor(option.value)}
                  className="mr-3 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>

          {localPrefs.looking_for.length > 0 && (
            <div className="mt-3 p-3 bg-pink-50 rounded-lg">
              <p className="text-sm text-pink-700">
                Recherche: {localPrefs.looking_for.map(value => 
                  preferenceRanges.lookingForOptions.find(opt => opt.value === value)?.label
                ).join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Interests Filter */}
        {showInterestsFilter && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <Tag className="w-5 h-5 mr-2 text-indigo-600" />
              <h4 className="font-medium text-gray-900">Centres d'intérêt souhaités</h4>
              <span className="ml-2 text-xs text-gray-500">(optionnel)</span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Sélectionnez les centres d'intérêt que vous aimeriez partager avec vos correspondances
            </p>

            {/* Selected interests */}
            {localPrefs.interests_filter.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Centres d'intérêt sélectionnés:</h5>
                <div className="flex flex-wrap gap-2">
                  {localPrefs.interests_filter.map(interest => (
                    <span
                      key={interest}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterestFilter(interest)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Available interests */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Centres d'intérêt disponibles:</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {preferenceRanges.availableInterests
                  .filter(interest => !localPrefs.interests_filter.includes(interest))
                  .map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => addInterestFilter(interest)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-left"
                    >
                      {interest}
                    </button>
                  ))}
              </div>
            </div>

            <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-700">
                💡 Les profils ayant des centres d'intérêt similaires seront prioritaires dans vos suggestions
              </p>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center mb-3">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            <h4 className="font-medium text-gray-900">Résumé des préférences</h4>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• Personnes entre <strong>{localPrefs.min_age}</strong> et <strong>{localPrefs.max_age}</strong> ans</p>
            <p>• Dans un rayon de <strong>{localPrefs.min_distance}</strong> à <strong>{localPrefs.max_distance}</strong> km</p>
            {showGenderPreference && (
              <p>• Genre: <strong>{preferenceRanges.genderOptions.find(opt => opt.value === localPrefs.gender_preference)?.label}</strong></p>
            )}
            {localPrefs.looking_for.length > 0 && (
              <p>• Recherche: <strong>{localPrefs.looking_for.map(value => 
                preferenceRanges.lookingForOptions.find(opt => opt.value === value)?.label
              ).join(', ')}</strong></p>
            )}
            {showInterestsFilter && localPrefs.interests_filter.length > 0 && (
              <p>• Centres d'intérêt: <strong>{localPrefs.interests_filter.length} sélectionnés</strong></p>
            )}
            <p className="text-purple-600 font-medium mt-2">
              Ces préférences amélioreront vos suggestions de profils !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
