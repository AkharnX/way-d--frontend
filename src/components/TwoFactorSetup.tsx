import React, { useState, useEffect } from 'react';
import { Shield, Copy, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import QRCode from 'qrcode';
import { authService } from '../services/api';
import type { TwoFactorSetupResponse } from '../types';

interface TwoFactorSetupProps {
  onSetupComplete: (enabled: boolean) => void;
  onCancel: () => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onSetupComplete, onCancel }) => {
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackupCode, setCopiedBackupCode] = useState<number | null>(null);

  useEffect(() => {
    initiate2FASetup();
  }, []);

  const initiate2FASetup = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.setup2FA();
      setSetupData(response);
      
      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(response.qr_code_url);
      setQrCodeDataUrl(qrDataUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la configuration de l\'authentification à deux facteurs');
    } finally {
      setLoading(false);
    }
  };

  const verifySetup = async () => {
    if (!setupData || !verificationCode.trim()) {
      setError('Veuillez entrer le code de vérification');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.verify2FASetup({
        secret: setupData.secret,
        code: verificationCode.trim()
      });
      
      // Update backup codes from verification response
      setSetupData(prev => prev ? { ...prev, backup_codes: response.backup_codes } : null);
      setStep('complete');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Code de vérification invalide');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'secret' | number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'secret') {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      } else {
        setCopiedBackupCode(type);
        setTimeout(() => setCopiedBackupCode(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleComplete = () => {
    onSetupComplete(true);
  };

  if (loading && !setupData) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Configuration de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">
          Authentification à deux facteurs
        </h2>
        <p className="text-gray-600 mt-2">
          Sécurisez votre compte avec une couche de protection supplémentaire
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {step === 'setup' && setupData && (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Scannez ce QR code avec votre application d'authentification (Google Authenticator, Authy, etc.)
            </p>
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
              <img src={qrCodeDataUrl} alt="QR Code 2FA" className="w-48 h-48" />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              Ou entrez manuellement cette clé secrète :
            </p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 p-2 bg-white rounded border text-sm font-mono break-all">
                {setupData.secret}
              </code>
              <button
                onClick={() => copyToClipboard(setupData.secret, 'secret')}
                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                title="Copier la clé secrète"
              >
                {copiedSecret ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setStep('verify')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continuer
            </button>
            <button
              onClick={onCancel}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Entrez le code à 6 chiffres généré par votre application d'authentification
            </p>
          </div>

          <div>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-2xl font-mono py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={6}
            />
          </div>

          <div className="space-y-4">
            <button
              onClick={verifySetup}
              disabled={loading || verificationCode.length !== 6}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Vérification...' : 'Vérifier'}
            </button>
            <button
              onClick={() => setStep('setup')}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Retour
            </button>
          </div>
        </div>
      )}

      {step === 'complete' && setupData && (
        <div className="space-y-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Configuration terminée !
            </h3>
            <p className="text-gray-600">
              L'authentification à deux facteurs est maintenant activée sur votre compte.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-yellow-800">Codes de récupération</h4>
              <button
                onClick={() => setShowBackupCodes(!showBackupCodes)}
                className="text-yellow-600 hover:text-yellow-700"
              >
                {showBackupCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              Conservez ces codes en lieu sûr. Ils vous permettront d'accéder à votre compte si vous perdez votre appareil d'authentification.
            </p>
            
            {showBackupCodes && (
              <div className="space-y-2">
                {setupData.backup_codes.map((code, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <code className="flex-1 p-2 bg-white rounded border text-sm font-mono">
                      {code}
                    </code>
                    <button
                      onClick={() => copyToClipboard(code, index)}
                      className="p-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                      title="Copier le code"
                    >
                      {copiedBackupCode === index ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleComplete}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Terminer
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;