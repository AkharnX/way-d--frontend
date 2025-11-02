import { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Shield, 
  Users, 
  MapPin, 
  Clock,
  Info,
  Lock,
  Globe
} from 'lucide-react';

export interface PrivacySettings {
  showDistance: boolean;
  showAge: boolean;
  showOnline: boolean;
  discoverableProfile: boolean;
  showLastSeen: boolean;
  allowLocationSharing: boolean;
  showReadReceipts: boolean;
  publicProfile: boolean;
}

interface PrivacyControlsProps {
  settings: PrivacySettings;
  onSettingsChange: (settings: PrivacySettings) => void;
  className?: string;
  showPreview?: boolean;
}

export default function PrivacyControls({ 
  settings, 
  onSettingsChange, 
  className = '',
  showPreview = true 
}: PrivacyControlsProps) {
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleToggle = (key: keyof PrivacySettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key]
    };
    onSettingsChange(newSettings);
  };

  const privacyOptions = [
    {
      key: 'publicProfile' as keyof PrivacySettings,
      icon: Globe,
      title: 'Profil public',
      description: 'Votre profil peut être trouvé par tous les utilisateurs',
      impact: 'Visibilité maximale - Plus de correspondances potentielles',
      category: 'visibility'
    },
    {
      key: 'discoverableProfile' as keyof PrivacySettings,
      icon: Users,
      title: 'Profil découvrable',
      description: 'Apparaître dans les suggestions de correspondances',
      impact: 'Nécessaire pour recevoir des likes et des correspondances',
      category: 'visibility'
    },
    {
      key: 'showDistance' as keyof PrivacySettings,
      icon: MapPin,
      title: 'Afficher la distance',
      description: 'Les autres peuvent voir votre distance approximative',
      impact: 'Aide à planifier les rencontres mais révèle votre localisation',
      category: 'location'
    },
    {
      key: 'allowLocationSharing' as keyof PrivacySettings,
      icon: MapPin,
      title: 'Partage de localisation',
      description: 'Permettre le partage de localisation en temps réel',
      impact: 'Facilite les rencontres mais moins de confidentialité',
      category: 'location'
    },
    {
      key: 'showAge' as keyof PrivacySettings,
      icon: Clock,
      title: 'Afficher l\'âge',
      description: 'Votre âge est visible sur votre profil',
      impact: 'Information importante pour la compatibilité',
      category: 'personal'
    },
    {
      key: 'showOnline' as keyof PrivacySettings,
      icon: Eye,
      title: 'Statut en ligne',
      description: 'Afficher quand vous êtes actif sur l\'application',
      impact: 'Montre votre disponibilité mais révèle vos habitudes',
      category: 'activity'
    },
    {
      key: 'showLastSeen' as keyof PrivacySettings,
      icon: Clock,
      title: 'Dernière connexion',
      description: 'Afficher quand vous avez été actif pour la dernière fois',
      impact: 'Donne contexte aux correspondances mais moins de confidentialité',
      category: 'activity'
    },
    {
      key: 'showReadReceipts' as keyof PrivacySettings,
      icon: Eye,
      title: 'Accusés de lecture',
      description: 'Confirmer la lecture des messages',
      impact: 'Améliore la communication mais révèle votre activité',
      category: 'messaging'
    }
  ];

  const categories = {
    visibility: { title: 'Visibilité du profil', color: 'blue' },
    location: { title: 'Localisation', color: 'green' },
    personal: { title: 'Informations personnelles', color: 'purple' },
    activity: { title: 'Activité', color: 'yellow' },
    messaging: { title: 'Messagerie', color: 'pink' }
  };

  const getPrivacyScore = () => {
    const totalOptions = privacyOptions.length;
    const enabledOptions = privacyOptions.filter(option => settings[option.key]).length;
    return Math.round((enabledOptions / totalOptions) * 100);
  };

  const getPrivacyLevel = () => {
    const score = getPrivacyScore();
    if (score >= 80) return { level: 'Ouvert', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 50) return { level: 'Modéré', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Privé', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const privacyLevel = getPrivacyLevel();

  return (
    <div className={className}>
      {/* Privacy Overview */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Contrôles de confidentialité
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${privacyLevel.bg} ${privacyLevel.color}`}>
            {privacyLevel.level} ({getPrivacyScore()}%)
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getPrivacyScore()}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-600">
          Votre niveau de confidentialité actuel. Plus le score est élevé, plus votre profil est visible.
        </p>

        {showPreview && (
          <button
            onClick={() => setShowPreviewModal(true)}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Prévisualiser mon profil
          </button>
        )}
      </div>

      {/* Privacy Controls by Category */}
      <div className="space-y-6">
        {Object.entries(categories).map(([categoryKey, category]) => {
          const categoryOptions = privacyOptions.filter(option => option.category === categoryKey);
          
          return (
            <div key={categoryKey} className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 bg-${category.color}-500`}></span>
                {category.title}
              </h4>
              
              <div className="space-y-4">
                {categoryOptions.map((option) => (
                  <div key={option.key} className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <option.icon className="w-4 h-4 mr-2 text-gray-600" />
                        <span className="font-medium text-gray-900">{option.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{option.description}</p>
                      <div className="flex items-center text-xs">
                        <Info className="w-3 h-3 mr-1 text-blue-500" />
                        <span className="text-blue-600">{option.impact}</span>
                      </div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings[option.key]}
                        onChange={() => handleToggle(option.key)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-3">Actions rapides</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const maxPrivacy: PrivacySettings = {
                showDistance: false,
                showAge: true,
                showOnline: false,
                discoverableProfile: true,
                showLastSeen: false,
                allowLocationSharing: false,
                showReadReceipts: false,
                publicProfile: false
              };
              onSettingsChange(maxPrivacy);
            }}
            className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200"
          >
            <Lock className="w-3 h-3 inline mr-1" />
            Maximum confidentialité
          </button>
          
          <button
            onClick={() => {
              const balanced: PrivacySettings = {
                showDistance: true,
                showAge: true,
                showOnline: true,
                discoverableProfile: true,
                showLastSeen: false,
                allowLocationSharing: false,
                showReadReceipts: true,
                publicProfile: false
              };
              onSettingsChange(balanced);
            }}
            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200"
          >
            Équilibré
          </button>
          
          <button
            onClick={() => {
              const maxVisibility: PrivacySettings = {
                showDistance: true,
                showAge: true,
                showOnline: true,
                discoverableProfile: true,
                showLastSeen: true,
                allowLocationSharing: true,
                showReadReceipts: true,
                publicProfile: true
              };
              onSettingsChange(maxVisibility);
            }}
            className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
          >
            <Eye className="w-3 h-3 inline mr-1" />
            Maximum visibilité
          </button>
        </div>
      </div>

      {/* Profile Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Aperçu de votre profil</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-2">Informations visibles:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${settings.showAge ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    Âge {settings.showAge ? 'visible' : 'masqué'}
                  </li>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${settings.showDistance ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    Distance {settings.showDistance ? 'visible' : 'masquée'}
                  </li>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${settings.showOnline ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    Statut en ligne {settings.showOnline ? 'visible' : 'masqué'}
                  </li>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${settings.showLastSeen ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    Dernière connexion {settings.showLastSeen ? 'visible' : 'masquée'}
                  </li>
                </ul>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-2">Visibilité du profil:</h4>
                <div className="text-sm text-gray-600">
                  {settings.publicProfile ? (
                    <div className="flex items-center text-green-600">
                      <Globe className="w-4 h-4 mr-1" />
                      Profil public - Visible par tous
                    </div>
                  ) : settings.discoverableProfile ? (
                    <div className="flex items-center text-blue-600">
                      <Users className="w-4 h-4 mr-1" />
                      Profil découvrable - Visible dans les suggestions
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <EyeOff className="w-4 h-4 mr-1" />
                      Profil privé - Non découvrable
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
                💡 Cet aperçu montre comment votre profil apparaît aux autres utilisateurs selon vos paramètres de confidentialité actuels.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}