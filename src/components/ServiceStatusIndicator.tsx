// Service status checker and indicator
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { healthService } from '../services/api';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'healthy' | 'unhealthy' | 'checking';
  port: number;
}

const ServiceStatusIndicator: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Auth', url: 'http://localhost:8080', status: 'checking', port: 8080 },
    { name: 'Profile', url: 'http://localhost:8081', status: 'checking', port: 8081 },
    { name: 'Interactions', url: 'http://localhost:8082', status: 'checking', port: 8082 }
  ]);
  
  const [isExpanded, setIsExpanded] = useState(false);

  const checkServices = async () => {
    const updatedServices = await Promise.all(
      services.map(async (service) => {
        try {
          await healthService.checkAuth();
          return { ...service, status: 'healthy' as const };
        } catch (error) {
          return { ...service, status: 'unhealthy' as const };
        }
      })
    );
    setServices(updatedServices);
  };

  useEffect(() => {
    checkServices();
    const interval = setInterval(checkServices, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const healthyCount = services.filter(s => s.status === 'healthy').length;
  const totalCount = services.length;
  const allHealthy = healthyCount === totalCount;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
        {/* Main indicator */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center space-x-2 px-4 py-3 w-full text-left transition-colors ${
            allHealthy ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'
          }`}
        >
          {allHealthy ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <span className={`font-medium ${allHealthy ? 'text-green-700' : 'text-red-700'}`}>
            Services: {healthyCount}/{totalCount}
          </span>
          <span className="text-xs text-gray-500">
            {isExpanded ? '▲' : '▼'}
          </span>
        </button>

        {/* Expanded view */}
        {isExpanded && (
          <div className="border-t bg-gray-50 p-3 space-y-2">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between text-sm">
                <span className="font-medium">{service.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">:{service.port}</span>
                  {service.status === 'checking' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : service.status === 'healthy' ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
            
            <div className="pt-2 border-t">
              <button
                onClick={checkServices}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                🔄 Vérifier maintenant
              </button>
            </div>
            
            {!allHealthy && (
              <div className="pt-2 border-t text-xs text-gray-600">
                💡 Pour démarrer: <code className="bg-gray-200 px-1 rounded">docker-compose up -d</code>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceStatusIndicator;
