import React, { useState, useEffect } from 'react';
import { 
  getAdminDashboard, 
  getSystemConfig, 
  getAdminUsers, 
  getAuditLogs,
  healthService,
  DashboardStats,
  SystemConfiguration
} from '../services/api';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [configs, setConfigs] = useState<SystemConfiguration[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [servicesHealth, setServicesHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load dashboard stats
      const statsResult = await getAdminDashboard();
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }

      // Load system config
      const configResult = await getSystemConfig();
      if (configResult.success && configResult.data) {
        setConfigs(configResult.data);
      }

      // Load recent users
      const usersResult = await getAdminUsers({ limit: 10 });
      if (usersResult.success && usersResult.data) {
        setUsers(usersResult.data.users || []);
      }

      // Load recent audit logs
      const logsResult = await getAuditLogs({ limit: 10 });
      if (logsResult.success && logsResult.data) {
        setAuditLogs(logsResult.data.logs || []);
      }

      // Load services health status
      try {
        const healthResult = await healthService.checkAll();
        setServicesHealth(healthResult);
      } catch (healthError) {
        console.warn('Failed to load services health:', healthError);
        setServicesHealth(null);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Way-D Admin Dashboard</h1>
              <p className="text-gray-600">System administration and monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(stats?.system_health || 'unknown')}`}>
                System: {stats?.system_health || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: '📊' },
              { id: 'users', name: 'Users', icon: '👥' },
              { id: 'config', name: 'Configuration', icon: '⚙️' },
              { id: 'logs', name: 'Audit Logs', icon: '📝' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.total_users.toLocaleString()}</div>
                  <div className="ml-4 text-sm text-gray-500">Total Users</div>
                </div>
                <div className="text-sm text-green-600 mt-2">
                  +{stats.new_users_24h} in 24h
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-green-600">{stats.active_users.toLocaleString()}</div>
                  <div className="ml-4 text-sm text-gray-500">Active Users</div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {stats.active_sessions} active sessions
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.total_matches.toLocaleString()}</div>
                  <div className="ml-4 text-sm text-gray-500">Total Matches</div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {stats.total_events} events created
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-yellow-600">{stats.pending_reports}</div>
                  <div className="ml-4 text-sm text-gray-500">Pending Reports</div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {stats.total_reports} total reports
                </div>
              </div>
            </div>

            {/* Revenue and Premium */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue This Month</h3>
                <div className="text-3xl font-bold text-green-600">
                  ${stats.revenue_this_month.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {stats.premium_subscriptions} premium subscriptions
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
                <div className={`text-2xl font-bold ${getHealthColor(stats.system_health).replace('bg-', 'text-').replace('-100', '-600')}`}>
                  {stats.system_health.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  All systems operational
                </div>
              </div>
            </div>

            {/* Services Health Status */}
            {servicesHealth && (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Microservices Status</h3>
                  <button
                    onClick={loadDashboardData}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                  >
                    Refresh
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'auth', name: 'Auth Service', port: 8080 },
                    { key: 'profile', name: 'Profile Service', port: 8081 },
                    { key: 'interactions', name: 'Interactions Service', port: 8082 }
                  ].map((service) => {
                    const serviceData = servicesHealth[service.key];
                    const isHealthy = serviceData?.status === 'healthy';
                    
                    return (
                      <div
                        key={service.key}
                        className={`p-4 rounded-lg border-2 ${
                          isHealthy 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <div className={`w-3 h-3 rounded-full ${
                            isHealthy ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`font-medium ${
                              isHealthy ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {isHealthy ? 'Healthy' : 'Unhealthy'}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Port:</span>
                            <span className="text-gray-900">{service.port}</span>
                          </div>
                          
                          {serviceData?.database && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Database:</span>
                              <span className={`font-medium ${
                                serviceData.database === 'ok' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {serviceData.database}
                              </span>
                            </div>
                          )}
                          
                          {serviceData?.version && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Version:</span>
                              <span className="text-gray-900">{serviceData.version}</span>
                            </div>
                          )}
                          
                          {serviceData?.timestamp && (
                            <div className="text-xs text-gray-500 mt-2">
                              Last check: {new Date(serviceData.timestamp).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <tr key={user.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {(user.first_name || user.email || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}` 
                                : 'Name not set'}
                            </div>
                            <div className="text-sm text-gray-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>Views: {user.profile_views || 0}</div>
                        <div>Matches: {user.matches_created || 0}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-6">
            {Object.entries(
              configs.reduce((groups, config) => {
                const category = config.category || 'other';
                if (!groups[category]) groups[category] = [];
                groups[category].push(config);
                return groups;
              }, {} as Record<string, SystemConfiguration[]>)
            ).map(([category, categoryConfigs]) => (
              <div key={category} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900 capitalize">
                    {category} Configuration
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {categoryConfigs.map((config) => (
                      <div key={config.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{config.key}</div>
                          <div className="text-sm text-gray-500">{config.description}</div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                            {config.value}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            config.is_editable 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {config.is_editable ? 'Editable' : 'Read-only'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Recent Audit Logs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map((log, index) => (
                    <tr key={log.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.admin_username || `Admin ${log.admin_id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.resource}
                        {log.resource_id && (
                          <span className="text-gray-500"> #{log.resource_id}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ip_address || 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
