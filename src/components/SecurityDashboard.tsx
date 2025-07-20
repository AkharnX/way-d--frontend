import { useState, useEffect } from 'react';
import { useSecurity } from './SecurityProvider';
import { Shield, AlertTriangle, CheckCircle, Clock, Activity, Eye, Settings } from 'lucide-react';

interface SecurityMetrics {
  sessionHealth: 'healthy' | 'warning' | 'critical';
  lastSecurityCheck: Date;
  activeThreats: number;
  securityScore: number;
}

export default function SecurityDashboard() {
  const { 
    user, 
    securityLevel, 
    loginAttempts, 
    lastActivity, 
    sessionExpiry, 
    isSessionValid,
    checkSecurity 
  } = useSecurity();

  const [metrics, setMetrics] = useState<SecurityMetrics>({
    sessionHealth: 'healthy',
    lastSecurityCheck: new Date(),
    activeThreats: 0,
    securityScore: 85
  });

  const [securityDetails, setSecurityDetails] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    runSecurityCheck();
    const interval = setInterval(runSecurityCheck, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const runSecurityCheck = async () => {
    try {
      const result = await checkSecurity();
      setSecurityDetails(result);
      
      // Update metrics based on security check
      const newMetrics: SecurityMetrics = {
        sessionHealth: result.riskLevel === 'low' ? 'healthy' : 
                      result.riskLevel === 'medium' ? 'warning' : 'critical',
        lastSecurityCheck: new Date(),
        activeThreats: result.issues.length,
        securityScore: Math.max(0, 100 - (result.issues.length * 20))
      };
      
      setMetrics(newMetrics);
    } catch (error) {
      console.error('Security check failed:', error);
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'maximum': return 'text-green-600 bg-green-50';
      case 'enhanced': return 'text-blue-600 bg-blue-50';
      case 'basic': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Jamais';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Tableau de bord sécurité</h2>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSecurityLevelColor(securityLevel)}`}>
            {securityLevel.toUpperCase()}
          </div>
        </div>

        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Activity className={`w-5 h-5 mr-2 ${getHealthColor(metrics.sessionHealth)}`} />
              <div>
                <p className="text-sm text-gray-600">État session</p>
                <p className={`font-semibold ${getHealthColor(metrics.sessionHealth)}`}>
                  {metrics.sessionHealth === 'healthy' ? 'Saine' :
                   metrics.sessionHealth === 'warning' ? 'Attention' : 'Critique'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className={`w-5 h-5 mr-2 ${metrics.activeThreats > 0 ? 'text-red-500' : 'text-green-500'}`} />
              <div>
                <p className="text-sm text-gray-600">Menaces actives</p>
                <p className="text-lg font-semibold text-gray-900">{metrics.activeThreats}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Score sécurité</p>
                <p className="text-lg font-semibold text-gray-900">{metrics.securityScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Dernière activité</p>
                <p className="text-sm font-medium text-gray-900">{formatTimeAgo(lastActivity)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Session Information */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Informations de session</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Session valide:</span>
              <span className={`ml-2 font-medium ${isSessionValid() ? 'text-green-600' : 'text-red-600'}`}>
                {isSessionValid() ? 'Oui' : 'Non'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Expiration:</span>
              <span className="ml-2 font-medium text-gray-900">
                {sessionExpiry ? sessionExpiry.toLocaleString() : 'Inconnue'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Tentatives connexion:</span>
              <span className={`ml-2 font-medium ${loginAttempts > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                {loginAttempts}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      {securityDetails && securityDetails.issues.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Alertes de sécurité</h3>
          </div>
          <div className="space-y-3">
            {securityDetails.issues.map((issue: string, index: number) => (
              <div key={index} className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-500 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-800">{issue}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Recommendations */}
      {securityDetails && securityDetails.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Eye className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Recommandations</h3>
          </div>
          <div className="space-y-3">
            {securityDetails.recommendations.map((rec: string, index: number) => (
              <div key={index} className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle className="w-4 h-4 text-blue-500 mr-3 flex-shrink-0" />
                <p className="text-sm text-blue-800">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Security Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Settings className="w-5 h-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Détails avancés</h3>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showAdvanced ? 'Masquer' : 'Afficher'}
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Utilisateur</h4>
                <div className="space-y-1 text-gray-600">
                  <p>ID: {user?.id}</p>
                  <p>Email: {user?.email}</p>
                  <p>Créé: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tokens</h4>
                <div className="space-y-1 text-gray-600">
                  <p>Access Token: {localStorage.getItem('access_token') ? '✓ Présent' : '✗ Absent'}</p>
                  <p>Refresh Token: {localStorage.getItem('refresh_token') ? '✓ Présent' : '✗ Absent'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Actions de maintenance</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={runSecurityCheck}
                  className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  Vérifier sécurité
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Actualiser session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
