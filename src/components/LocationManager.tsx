import React, { useState, useEffect } from 'react';
import { MapPin, Crosshair, Globe, AlertCircle } from 'lucide-react';
import { profileService } from '../services/api';

interface LocationManagerProps {
  currentLocation?: string;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
  className?: string;
}

interface LocationData {
  lat: number;
  lng: number;
  address?: string;
}

export default function LocationManager({ 
  currentLocation, 
  onLocationChange, 
  className = '' 
}: LocationManagerProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useManualEntry, setUseManualEntry] = useState(false);

  useEffect(() => {
    if (currentLocation) {
      setManualAddress(currentLocation);
    }
  }, [currentLocation]);

  const getCurrentLocation = async () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par ce navigateur');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding pour obtenir l'adresse
          const address = await reverseGeocode(latitude, longitude);
          
          const locationData = {
            lat: latitude,
            lng: longitude,
            address
          };
          
          setLocation(locationData);
          onLocationChange(latitude, longitude, address);
          
          // Sauvegarder dans le backend
          await profileService.updateLocation(latitude, longitude);
          
        } catch (error) {
          console.error('Error with reverse geocoding:', error);
          const locationData = {
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          };
          
          setLocation(locationData);
          onLocationChange(latitude, longitude, locationData.address);
          
          // Sauvegarder dans le backend même sans adresse
          await profileService.updateLocation(latitude, longitude);
        }
        
        setLoading(false);
      },
      (error) => {
        let errorMessage = 'Erreur de géolocalisation';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permission de géolocalisation refusée';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position indisponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout de géolocalisation';
            break;
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // Utilisation de l'API Nominatim (OpenStreetMap) gratuite
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  const geocodeAddress = async (address: string): Promise<LocationData> => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      throw new Error('Adresse non trouvée');
    }
    
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      address: data[0].display_name
    };
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAddress.trim()) return;

    setLoading(true);
    setError('');

    try {
      const locationData = await geocodeAddress(manualAddress.trim());
      setLocation(locationData);
      onLocationChange(locationData.lat, locationData.lng, locationData.address);
      
      // Sauvegarder dans le backend
      await profileService.updateLocation(locationData.lat, locationData.lng);
      
    } catch (error) {
      setError('Impossible de localiser cette adresse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium text-gray-700">
          <MapPin className="w-4 h-4 inline mr-1" />
          Localisation
        </label>
        <button
          type="button"
          onClick={() => setUseManualEntry(!useManualEntry)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {useManualEntry ? 'Utiliser GPS' : 'Saisie manuelle'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!useManualEntry ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <Crosshair className="w-5 h-5 mr-2" />
            )}
            {loading ? 'Localisation en cours...' : 'Utiliser ma position actuelle'}
          </button>

          {location && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Position détectée</p>
                  <p className="text-sm text-green-700 mt-1">
                    {location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Coordonnées: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="Entrez votre ville ou adresse..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !manualAddress.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Localiser'
              )}
            </button>
          </div>

          {location && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Adresse trouvée</p>
                  <p className="text-sm text-green-700 mt-1">{location.address}</p>
                  <p className="text-xs text-green-600 mt-1">
                    Coordonnées: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          💡 Votre localisation est utilisée pour vous proposer des profils à proximité. 
          Elle n'est jamais partagée exactement avec les autres utilisateurs.
        </p>
      </div>
    </div>
  );
}
