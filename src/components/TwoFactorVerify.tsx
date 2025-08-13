import React, { useState } from 'react';
import { Shield, AlertCircle, ArrowLeft } from 'lucide-react';

interface TwoFactorVerifyProps {
  email: string;
  onVerify: (code: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  error: string;
}

const TwoFactorVerify: React.FC<TwoFactorVerifyProps> = ({
  email,
  onVerify,
  onBack,
  loading,
  error
}) => {
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length === 6) {
      await onVerify(code.trim());
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Vérification en deux étapes
          </h1>
          <p className="text-gray-600">
            Entrez le code à 6 chiffres généré par votre application d'authentification pour{' '}
            <span className="font-medium">{maskedEmail}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Code d'authentification
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="000000"
              className="w-full text-center text-2xl font-mono py-4 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
            />
            <p className="mt-2 text-xs text-gray-500 text-center">
              Code à 6 chiffres de votre application d'authentification
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Vérification...
              </div>
            ) : (
              'Vérifier'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Vous n'avez pas accès à votre appareil ?{' '}
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Utiliser un code de récupération
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerify;