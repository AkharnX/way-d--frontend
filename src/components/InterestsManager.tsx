import React, { useState, useEffect } from 'react';
import { profileService } from '../services/api';
import { Interest } from '../types';
import { Plus, X, Tag } from 'lucide-react';

interface InterestsManagerProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  className?: string;
}

export default function InterestsManager({ 
  selectedInterests, 
  onInterestsChange, 
  className = '' 
}: InterestsManagerProps) {
  const [availableInterests, setAvailableInterests] = useState<Interest[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadInterests();
  }, []);

  const loadInterests = async () => {
    try {
      const interests = await profileService.getAvailableInterests();
      setAvailableInterests(interests);
    } catch (error) {
      console.error('Error loading interests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleInterest = (interestId: string) => {
    if (selectedInterests.includes(interestId)) {
      onInterestsChange(selectedInterests.filter(id => id !== interestId));
    } else {
      onInterestsChange([...selectedInterests, interestId]);
    }
  };

  const handleAddInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterest.trim()) return;

    try {
      const interest = await profileService.addInterest(newInterest.trim());
      setAvailableInterests([...availableInterests, interest]);
      setNewInterest('');
      setShowAddForm(false);
      // Automatically select the new interest
      onInterestsChange([...selectedInterests, interest.id]);
    } catch (error) {
      console.error('Error adding interest:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Centres d'intérêt
        </label>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Ajouter
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddInterest} className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Nouveau centre d'intérêt"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              maxLength={50}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewInterest('');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {availableInterests.map((interest) => (
          <button
            key={interest.id}
            type="button"
            onClick={() => handleToggleInterest(interest.id)}
            className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center ${
              selectedInterests.includes(interest.id)
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <Tag className="w-4 h-4 mr-2" />
            <div className="text-left">
              <div className="font-medium text-sm">{interest.name}</div>
              {interest.description && (
                <div className="text-xs opacity-75">{interest.description}</div>
              )}
            </div>
            {selectedInterests.includes(interest.id) && (
              <div className="ml-auto w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center">
                ✓
              </div>
            )}
          </button>
        ))}
      </div>

      {selectedInterests.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            {selectedInterests.length} intérêt{selectedInterests.length > 1 ? 's' : ''} sélectionné{selectedInterests.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
