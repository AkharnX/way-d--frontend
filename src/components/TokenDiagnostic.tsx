import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from './ui';
import { RefreshCw, Trash2, Eye, EyeOff, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { authService, healthService } from '../services/api';
import { clearTokens, setTokens } from '../utils/tokenUtils';
import { runQuickAuthDiagnostic } from '../utils/authFlowDiagnostic';

interface TokenInfo {
  token: string | null;
  isValid: boolean;
  isExpired: boolean;
  payload: any;
  expiresAt: Date | null;
  timeUntilExpiry: string;
  error?: string;
}

interface DiagnosticResult {
  timestamp: string;
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const TokenDiagnostic: React.FC = () => {
  const [accessTokenInfo, setAccessTokenInfo] = useState<TokenInfo | null>(null);
  const [refreshTokenInfo, setRefreshTokenInfo] = useState<TokenInfo | null>(null);
  const [showTokens, setShowTokens] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authFlowResults, setAuthFlowResults] = useState<any>(null);

  const analyzeToken = (token: string | null, tokenType: string): TokenInfo => {
    if (!token) {
      return {
        token,
        isValid: false,
        isExpired: true,
        payload: null,
        expiresAt: null,
        timeUntilExpiry: 'No token',
        error: `No ${tokenType} token found`
      };
    }

    try {
      const payload = jwtDecode(token);
      const now = Date.now() / 1000;
      const exp = payload.exp || 0;
      const isExpired = exp < now;
      const expiresAt = new Date(exp * 1000);
      const timeUntilExpiry = isExpired 
        ? 'Expired' 
        : `${Math.floor((exp - now) / 60)} minutes`;

      return {
        token,
        isValid: true,
        isExpired,
        payload,
        expiresAt,
        timeUntilExpiry,
      };
    } catch (error) {
      return {
        token,
        isValid: false,
        isExpired: true,
        payload: null,
        expiresAt: null,
        timeUntilExpiry: 'Invalid token',
        error: `Invalid ${tokenType} token format`
      };
    }
  };

  const addDiagnosticResult = (test: string, status: 'success' | 'error' | 'warning', message: string, details?: any) => {
    const result: DiagnosticResult = {
      timestamp: new Date().toISOString(),
      test,
      status,
      message,
      details
    };
    setDiagnosticResults(prev => [...prev, result]);
  };

  const refreshTokenData = () => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const email = localStorage.getItem('user_email');
    
    setUserEmail(email);
    setAccessTokenInfo(analyzeToken(accessToken, 'access'));
    setRefreshTokenInfo(analyzeToken(refreshToken, 'refresh'));
  };

  const runComprehensiveDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    setDiagnosticResults([]);

    // Test 1: Token presence
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!accessToken && !refreshToken) {
      addDiagnosticResult('Token Presence', 'warning', 'No tokens found in localStorage', {
        accessToken: !!accessToken,
        refreshToken: !!refreshToken
      });
    } else {
      addDiagnosticResult('Token Presence', 'success', 'Tokens found in localStorage', {
        accessToken: !!accessToken,
        refreshToken: !!refreshToken
      });
    }

    // Test 2: Token validity
    if (accessToken) {
      const accessInfo = analyzeToken(accessToken, 'access');
      if (accessInfo.isValid && !accessInfo.isExpired) {
        addDiagnosticResult('Access Token', 'success', 'Access token is valid and not expired', {
          expiresAt: accessInfo.expiresAt,
          timeUntilExpiry: accessInfo.timeUntilExpiry
        });
      } else if (accessInfo.isValid && accessInfo.isExpired) {
        addDiagnosticResult('Access Token', 'warning', 'Access token is expired', {
          expiresAt: accessInfo.expiresAt
        });
      } else {
        addDiagnosticResult('Access Token', 'error', 'Access token is invalid', {
          error: accessInfo.error
        });
      }
    }

    if (refreshToken) {
      const refreshInfo = analyzeToken(refreshToken, 'refresh');
      if (refreshInfo.isValid && !refreshInfo.isExpired) {
        addDiagnosticResult('Refresh Token', 'success', 'Refresh token is valid and not expired', {
          expiresAt: refreshInfo.expiresAt,
          timeUntilExpiry: refreshInfo.timeUntilExpiry
        });
      } else if (refreshInfo.isValid && refreshInfo.isExpired) {
        addDiagnosticResult('Refresh Token', 'warning', 'Refresh token is expired', {
          expiresAt: refreshInfo.expiresAt
        });
      } else {
        addDiagnosticResult('Refresh Token', 'error', 'Refresh token is invalid', {
          error: refreshInfo.error
        });
      }
    }

    // Test 3: Auth service connectivity
    try {
      const healthResponse = await healthService.checkAuth();
      addDiagnosticResult('Auth Service', 'success', 'Auth service is reachable', {
        status: healthResponse.status,
        service: healthResponse.service
      });
    } catch (error: any) {
      addDiagnosticResult('Auth Service', 'error', 'Auth service is unreachable', {
        error: error.message,
        status: error.response?.status
      });
    }

    // Test 4: Current user endpoint (if we have tokens)
    if (accessToken) {
      try {
        const currentUser = await authService.getCurrentUser();
        addDiagnosticResult('Current User', 'success', 'Successfully retrieved current user', {
          userId: currentUser.id,
          email: currentUser.email
        });
      } catch (error: any) {
        const status = error.response?.status;
        if (status === 401) {
          addDiagnosticResult('Current User', 'error', 'Unauthorized - Token may be invalid', {
            status,
            message: error.response?.data?.message
          });
        } else if (status === 403) {
          addDiagnosticResult('Current User', 'warning', 'Forbidden - Email may not be verified', {
            status,
            message: error.response?.data?.message
          });
        } else {
          addDiagnosticResult('Current User', 'error', 'Failed to get current user', {
            status,
            message: error.message
          });
        }
      }
    }

    // Test 5: Token refresh (if refresh token exists and access token is expired)
    if (refreshToken && accessToken) {
      const accessInfo = analyzeToken(accessToken, 'access');
      const refreshInfo = analyzeToken(refreshToken, 'refresh');
      
      if (accessInfo.isExpired && refreshInfo.isValid && !refreshInfo.isExpired) {
        try {
          const refreshResponse = await authService.refreshToken();
          addDiagnosticResult('Token Refresh', 'success', 'Successfully refreshed tokens', {
            newAccessToken: !!refreshResponse.access_token,
            newRefreshToken: !!refreshResponse.refresh_token
          });
          
          // Update tokens
          setTokens(refreshResponse.access_token, refreshResponse.refresh_token || refreshToken);
          refreshTokenData();
        } catch (error: any) {
          addDiagnosticResult('Token Refresh', 'error', 'Failed to refresh tokens', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
          });
        }
      }
    }

    setIsRunningDiagnostic(false);
  };

  const runAuthFlowDiagnostic = async () => {
    const email = window.prompt('Enter email for auth flow test (optional):');
    const password = email ? window.prompt('Enter password:') : undefined;
    
    setIsRunningDiagnostic(true);
    setDiagnosticResults([]);
    
    try {
      const result = await runQuickAuthDiagnostic(email || undefined, password || undefined);
      setAuthFlowResults(result);
      
      addDiagnosticResult('Auth Flow Diagnostic', result.success ? 'success' : 'error', 
        result.success ? 'Auth flow diagnostic completed successfully' : 'Auth flow has issues',
        { issues: result.issues, recommendations: result.recommendations }
      );
      
    } catch (error: any) {
      addDiagnosticResult('Auth Flow Diagnostic', 'error', 'Diagnostic failed', { error: error.message });
    }
    
    setIsRunningDiagnostic(false);
  };

  const clearAllTokens = () => {
    clearTokens();
    localStorage.removeItem('user_email');
    refreshTokenData();
    addDiagnosticResult('Manual Action', 'success', 'All tokens and user data cleared');
  };

  const testLogin = async () => {
    const email = window.prompt('Enter email for test login:');
    const password = window.prompt('Enter password:');
    
    if (!email || !password) return;

    try {
      const response = await authService.login({ email, password });
      setTokens(response.access_token, response.refresh_token);
      localStorage.setItem('user_email', email);
      refreshTokenData();
      addDiagnosticResult('Test Login', 'success', 'Login successful', {
        accessToken: !!response.access_token,
        refreshToken: !!response.refresh_token
      });
    } catch (error: any) {
      addDiagnosticResult('Test Login', 'error', 'Login failed', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }
  };

  useEffect(() => {
    refreshTokenData();
  }, []);

  const getStatusIcon = (status: 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Authentication Diagnostic Tool</h1>          <div className="space-x-2">
            <Button onClick={refreshTokenData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          <Button onClick={runComprehensiveDiagnostic} disabled={isRunningDiagnostic}>
            {isRunningDiagnostic ? 'Running...' : 'Run Full Diagnostic'}
          </Button>
          <Button onClick={runAuthFlowDiagnostic} disabled={isRunningDiagnostic} variant="outline">
            Auth Flow Test
          </Button>
        </div>
      </div>

      {/* Token Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Access Token */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Access Token
                {accessTokenInfo?.isValid && !accessTokenInfo?.isExpired ? (
                  <Badge variant="success">Valid</Badge>
                ) : accessTokenInfo?.isExpired ? (
                  <Badge variant="warning">Expired</Badge>
                ) : (
                  <Badge variant="destructive">Invalid</Badge>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {accessTokenInfo?.token ? (
              <>
                <div>
                  <label className="text-sm font-medium">Token:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-gray-100 rounded text-xs font-mono break-all">
                      {showTokens ? accessTokenInfo.token : `${accessTokenInfo.token.substring(0, 20)}...`}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTokens(!showTokens)}
                    >
                      {showTokens ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                {accessTokenInfo.isValid && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Expires:</label>
                      <p className="text-sm text-gray-600">{accessTokenInfo.expiresAt?.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Time until expiry:</label>
                      <p className="text-sm text-gray-600">{accessTokenInfo.timeUntilExpiry}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">User ID:</label>
                      <p className="text-sm text-gray-600">{accessTokenInfo.payload.user_id || 'Not found'}</p>
                    </div>
                  </>
                )}
                {accessTokenInfo.error && (
                  <div className="text-sm text-red-600">{accessTokenInfo.error}</div>
                )}
              </>
            ) : (
              <p className="text-gray-500">No access token found</p>
            )}
          </CardContent>
        </Card>

        {/* Refresh Token */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Refresh Token
                {refreshTokenInfo?.isValid && !refreshTokenInfo?.isExpired ? (
                  <Badge variant="success">Valid</Badge>
                ) : refreshTokenInfo?.isExpired ? (
                  <Badge variant="warning">Expired</Badge>
                ) : (
                  <Badge variant="destructive">Invalid</Badge>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {refreshTokenInfo?.token ? (
              <>
                <div>
                  <label className="text-sm font-medium">Token:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-gray-100 rounded text-xs font-mono break-all">
                      {showTokens ? refreshTokenInfo.token : `${refreshTokenInfo.token.substring(0, 20)}...`}
                    </code>
                  </div>
                </div>
                {refreshTokenInfo.isValid && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Expires:</label>
                      <p className="text-sm text-gray-600">{refreshTokenInfo.expiresAt?.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Time until expiry:</label>
                      <p className="text-sm text-gray-600">{refreshTokenInfo.timeUntilExpiry}</p>
                    </div>
                  </>
                )}
                {refreshTokenInfo.error && (
                  <div className="text-sm text-red-600">{refreshTokenInfo.error}</div>
                )}
              </>
            ) : (
              <p className="text-gray-500">No refresh token found</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="text-sm font-medium">Stored Email:</label>
            <p className="text-sm text-gray-600">{userEmail || 'No email stored'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={testLogin} variant="outline">
              Test Login
            </Button>
            <Button onClick={clearAllTokens} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Tokens
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Auth Flow Results */}
      {authFlowResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Auth Flow Analysis
              {authFlowResults.success ? (
                <Badge variant="success">All Good</Badge>
              ) : (
                <Badge variant="destructive">Issues Found</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {authFlowResults.issues.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 mb-2">Issues Identified:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {authFlowResults.issues.map((issue: string, index: number) => (
                    <li key={index} className="text-sm text-red-700">{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {authFlowResults.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-600 mb-2">Recommendations:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {authFlowResults.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm text-blue-700">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <details className="mt-4">
              <summary className="cursor-pointer font-medium">Full Report</summary>
              <pre className="text-xs mt-2 p-3 bg-gray-100 rounded overflow-auto max-h-64">
                {authFlowResults.report}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}

      {/* Diagnostic Results */}
      {diagnosticResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {diagnosticResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{result.message}</p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer">Details</summary>
                      <pre className="text-xs mt-1 p-2 bg-white/50 rounded">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TokenDiagnostic;
