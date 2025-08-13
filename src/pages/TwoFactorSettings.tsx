import { useState } from 'react';
import { Shield, AlertCircle, CheckCircle, Key, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/api';
import TwoFactorSetup from '../components/TwoFactorSetup';

function TwoFactorSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [showDisableForm, setShowDisableForm] = useState(false);

  const handle2FASetupComplete = (enabled: boolean) => {
    setShowSetup(false);
    if (enabled) {
      setSuccess('Authentification à deux facteurs activée avec succès !');
      // Optionally refresh user data to update 2FA status
    }
  };

  const handleDisable2FA = async () => {
    if (!disableCode.trim()) {
      setError('Veuillez entrer un code de vérification');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.disable2FA({ code: disableCode.trim() });
      setSuccess('Authentification à deux facteurs désactivée');
      setShowDisableForm(false);
      setDisableCode('');
      // Optionally refresh user data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la désactivation');
    } finally {
      setLoading(false);
    }
  };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <TwoFactorSetup
            onSetupComplete={handle2FASetupComplete}
            onCancel={() => setShowSetup(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Shield className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Authentification à deux facteurs</h2>
            <p className="text-gray-600">Sécurisez votre compte avec une couche de protection supplémentaire</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Current Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${user?.two_factor_enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Statut : {user?.two_factor_enabled ? 'Activé' : 'Désactivé'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {user?.two_factor_enabled 
                      ? 'Votre compte est protégé par l\'authentification à deux facteurs'
                      : 'Activez la 2FA pour une sécurité renforcée'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enable/Disable Actions */}
          {!user?.two_factor_enabled ? (
            <div className="space-y-4">
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h3 className="font-semibold text-blue-900 mb-2">Pourquoi activer la 2FA ?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Protection contre l'accès non autorisé</li>
                  <li>• Sécurité renforcée même si votre mot de passe est compromis</li>
                  <li>• Conformité aux meilleures pratiques de sécurité</li>
                </ul>
              </div>
              
              <button
                onClick={() => setShowSetup(true)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Key className="h-5 w-5 mr-2" />
                Activer l'authentification à deux facteurs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <h3 className="font-semibold text-green-900 mb-2">Authentification à deux facteurs active</h3>
                <p className="text-sm text-green-800">
                  Votre compte est maintenant protégé. Vous devrez entrer un code de votre application d'authentification à chaque connexion.
                </p>
              </div>

              {!showDisableForm ? (
                <button
                  onClick={() => setShowDisableForm(true)}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Désactiver l'authentification à deux facteurs
                </button>
              ) : (
                <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
                  <h3 className="font-semibold text-red-900">Confirmer la désactivation</h3>
                  <p className="text-sm text-red-800">
                    Entrez un code de votre application d'authentification pour confirmer la désactivation.
                  </p>
                  
                  <div>
                    <input
                      type="text"
                      value={disableCode}
                      onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Code à 6 chiffres"
                      className="w-full text-center text-xl font-mono py-3 px-4 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleDisable2FA}
                      disabled={loading || disableCode.length !== 6}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                    >
                      {loading ? 'Désactivation...' : 'Confirmer'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDisableForm(false);
                        setDisableCode('');
                        setError('');
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Tips */}
          <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <h3 className="font-semibold text-yellow-900 mb-2">Conseils de sécurité</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Utilisez une application d'authentification fiable (Google Authenticator, Authy, etc.)</li>
              <li>• Conservez vos codes de récupération en lieu sûr</li>
              <li>• Ne partagez jamais vos codes avec qui que ce soit</li>
              <li>• Activez la 2FA sur tous vos comptes importants</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwoFactorSettings;