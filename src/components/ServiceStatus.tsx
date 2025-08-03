import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Wifi, WifiOff, Database, Activity } from 'lucide-react';
import { healthService } from '../services/api';

interface ServiceInfo {
  name: string;
  status: 'healthy' | 'unhealthy' | 'loading' | 'unknown';
  url: string;
  port: number;
  database?: string;
  version?: string;
  timestamp?: string;
  error?: string;
}

const ServiceStatus: React.FC = () => {
  const [services, setServices] = useState<ServiceInfo[]>([
    { name: 'Auth', status: 'loading', url: 'http://localhost:8080', port: 8080 },
    { name: 'Profile', status: 'loading', url: 'http://localhost:8081', port: 8081 },
    { name: 'Interactions', status: 'loading', url: 'http://localhost:8082', port: 8082 },
  ]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkServices = async () => {
    console.log('🔍 Checking service health status...');
    setLastCheck(new Date());
    
    try {
      // Use the enhanced health service to check all services
      const healthResults = await healthService.checkAll();
      
      const updatedServices = [
        {
          name: 'Auth',
          status: healthResults.auth.status === 'healthy' ? 'healthy' as const : 'unhealthy' as const,
          url: 'http://localhost:8080',
          port: 8080,
          database: healthResults.auth.database,
          version: healthResults.auth.version,
          timestamp: healthResults.auth.timestamp,
          error: (healthResults.auth as any).error
        },
        {
          name: 'Profile', 
          status: healthResults.profile.status === 'healthy' ? 'healthy' as const : 'unhealthy' as const,
          url: 'http://localhost:8081',
          port: 8081,
          database: healthResults.profile.database,
          version: healthResults.profile.version,
          timestamp: healthResults.profile.timestamp,
          error: (healthResults.profile as any).error
        },
        {
          name: 'Interactions',
          status: healthResults.interactions.status === 'healthy' ? 'healthy' as const : 'unhealthy' as const,
          url: 'http://localhost:8082', 
          port: 8082,
          database: healthResults.interactions.database,
          version: healthResults.interactions.version,
          timestamp: healthResults.interactions.timestamp,
          error: (healthResults.interactions as any).error
        }
      ];
      
      setServices(updatedServices);
      console.log('✅ Service health check completed:', updatedServices);
      
    } catch (error) {
      console.error('❌ Health check failed:', error);
      // Fallback to individual checks if the combined check fails
      const updatedServices = await Promise.all(
        services.map(async (service) => {
          try {
            const response = await fetch(`${service.url}/health`, {
              method: 'GET',
              timeout: 5000,
            } as any);
            
            if (response.ok) {
              const data = await response.json();
              return { 
                ...service, 
                status: 'healthy' as const,
                database: data.database,
                version: data.version,
                timestamp: data.timestamp
              };
            } else {
              return { ...service, status: 'unhealthy' as const };
            }
          } catch (error) {
            return { ...service, status: 'unhealthy' as const, error: (error as Error).message };
          }
        })
      );
      
      setServices(updatedServices);
    }
  };

  useEffect(() => {
    checkServices();
    // Check every 30 seconds
    const interval = setInterval(checkServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: ServiceInfo['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'loading':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ServiceInfo['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 border-green-300';
      case 'unhealthy':
        return 'bg-red-100 border-red-300';
      case 'loading':
        return 'bg-yellow-100 border-yellow-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const allHealthy = services.every(s => s.status === 'healthy');
  const anyUnhealthy = services.some(s => s.status === 'unhealthy');

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Status Indicator Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
          allHealthy 
            ? 'bg-green-500 hover:bg-green-600' 
            : anyUnhealthy 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-yellow-500 hover:bg-yellow-600'
        }`}
      >
        {allHealthy ? (
          <Wifi className="w-5 h-5 text-white" />
        ) : (
          <WifiOff className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Expanded Status Panel */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-80 max-w-96">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Services Status</h3>
            <div className="flex items-center space-x-2">
              {lastCheck && (
                <span className="text-xs text-gray-500">
                  {lastCheck.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={checkServices}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.name}
                className={`p-3 rounded border ${getStatusColor(service.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(service.status)}
                    <span className="font-medium text-sm">{service.name}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    :{service.port}
                  </div>
                </div>
                
                {/* Service Details */}
                {service.status === 'healthy' && (
                  <div className="space-y-1 mt-2">
                    {service.database && (
                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <Database className="w-3 h-3" />
                        <span>DB: {service.database}</span>
                      </div>
                    )}
                    {service.version && (
                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <Activity className="w-3 h-3" />
                        <span>v{service.version}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Error Details */}
                {service.status === 'unhealthy' && service.error && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                    Error: {service.error}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* System Summary */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">System Status:</span>
              <span className={`font-medium ${
                allHealthy ? 'text-green-600' : anyUnhealthy ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {allHealthy ? '✅ All Healthy' : anyUnhealthy ? '❌ Issues Detected' : '⏳ Checking...'}
              </span>
            </div>
          </div>

          {anyUnhealthy && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-xs text-red-700 mb-2">
                🚨 Certains services ne sont pas disponibles.
              </p>
              <div className="text-xs text-red-600 space-y-1">
                <div>• Vérifiez que Docker Compose est démarré :</div>
                <code className="block bg-red-100 px-2 py-1 rounded text-xs">
                  docker-compose up -d
                </code>
                <div>• Vérifiez les logs des services :</div>
                <code className="block bg-red-100 px-2 py-1 rounded text-xs">
                  docker-compose logs
                </code>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceStatus;
