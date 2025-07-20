import { useState } from 'react';
import { ProfilePreference } from '../types';
import { Settings, Users, MapPin, Calendar } from 'lucide-react';

interface PreferencesManagerProps {
  preferences: Partial<ProfilePreference>;
  onPreferencesChange: (preferences: Partial<ProfilePreference>) => void;
  className?: string;
}

export default function PreferencesManager({ 
  preferences, 
  onPreferencesChange, 
  className = '' 
}: PreferencesManagerProps) {
  const [localPrefs, setLocalPrefs] = useState({
    min_age: preferences.min_age || 18,
    max_age: preferences.max_age || 50,
    min_distance: preferences.min_distance || 1,
    max_distance: preferences.max_distance || 50
  });

  const handleChange = (field: string, value: number) => {
    const newPrefs = { ...localPrefs, [field]: value };
    setLocalPrefs(newPrefs);
    onPreferencesChange(newPrefs);
  };

  const ageRanges = [
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
  ];

  const distanceRanges = [
    { value: 1, label: '1 km' },
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
    { value: 25, label: '25 km' },
    { value: 50, label: '50 km' },
    { value: 100, label: '100 km' },
    { value: 200, label: '200 km' },
    { value: 500, label: '500+ km' }
  ];

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
                {ageRanges.map(range => (
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
                {ageRanges.filter(range => range.value >= localPrefs.min_age).map(range => (
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
                {distanceRanges.map(range => (
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
                {distanceRanges.filter(range => range.value >= localPrefs.min_distance).map(range => (
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

        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center mb-3">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            <h4 className="font-medium text-gray-900">Résumé des préférences</h4>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• Personnes entre <strong>{localPrefs.min_age}</strong> et <strong>{localPrefs.max_age}</strong> ans</p>
            <p>• Dans un rayon de <strong>{localPrefs.min_distance}</strong> à <strong>{localPrefs.max_distance}</strong> km</p>
            <p className="text-purple-600 font-medium mt-2">
              Ces préférences amélioreront vos suggestions de profils !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
