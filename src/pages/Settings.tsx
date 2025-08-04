import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSecurity } from '../components/SecurityProvider';
import SecurityDashboard from '../components/SecurityDashboard';
import PageHeader from '../components/PageHeader';
import type { NotificationSettings, PrivacySettings } from '../types';
import { logError } from '../utils/errorUtils';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  // Use auth for logout functionality and security for everything else
  const { logout: authLogout } = useAuth();
  const { user, securityLevel, checkSecurity } = useSecurity();
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'privacy' | 'account'>('general');
  const [notifications, setNotifications] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    messageNotifications: true,
    matchNotifications: true,
  });
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    showDistance: true,
    showAge: true,
    showOnline: true,
    discoverableProfile: true,
  });
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Load user settings on mount
    loadUserSettings();
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;
    
    try {
      // Load settings from profile or create default settings
      // For now, use defaults but in real app would fetch from backend
      setNotifications({
        pushNotifications: true,
        emailNotifications: true,
        messageNotifications: true,
        matchNotifications: true,
      });
      setPrivacy({
        showDistance: true,
        showAge: true,
        showOnline: true,
        discoverableProfile: true,
      });
    } catch (error) {
      logError('Error loading user settings:', error);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyChange = (key: keyof PrivacySettings) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setSaveStatus('saving');
    
    try {
      // Save notification settings to backend
      const settingsData = {
        notifications,
        privacy,
        user_preferences: {
          ...notifications,
          ...privacy
        }
      };
      
      // Simulate API call - in real app, would be:
      // await profileService.updateSettings(settingsData);
      console.log('Saving settings:', settingsData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('success');
      
      // Perform security check after saving settings
      if (securityLevel !== 'none') {
        await checkSecurity();
      }
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      logError('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.')) {
      if (window.confirm('🚨 DERNIÈRE CHANCE : Voulez-vous vraiment supprimer votre compte Way-d ? Toutes vos données seront perdues.')) {
        try {
          setLoading(true);
          // TODO: Implement account deletion
          console.log('Account deletion requested');
          alert('Fonctionnalité de suppression de compte à venir. Contactez le support pour le moment.');
        } catch (error) {
          logError('Error deleting account:', error);
          alert('Erreur lors de la suppression du compte. Veuillez réessayer.');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      await authLogout();
      navigate('/login');
    }
  };

  const tabs = [
    { id: 'general' as const, name: 'General', icon: '⚙️' },
    { id: 'security' as const, name: 'Security', icon: '🔒' },
    { id: 'privacy' as const, name: 'Privacy', icon: '👁️' },
    { id: 'account' as const, name: 'Account', icon: '👤' },
  ];

  const getStatusMessage = () => {
    switch (saveStatus) {
      case 'saving':
        return { text: 'Saving settings...', color: 'text-yellow-400' };
      case 'success':
        return { text: 'Settings saved successfully!', color: 'text-green-400' };
      case 'error':
        return { text: 'Failed to save settings. Please try again.', color: 'text-red-400' };
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <PageHeader 
        title="Paramètres"
        showBack={true}
        customBackAction={() => navigate('/app')}
      />
      
      <div className="max-w-6xl mx-auto p-6 pt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account preferences and security</p>
        </div>

        {/* Status Message */}
        {saveStatus !== 'idle' && (
          <div className={`mb-6 p-4 rounded-lg bg-gray-800 border-l-4 ${
            saveStatus === 'success' ? 'border-green-400' : 
            saveStatus === 'error' ? 'border-red-400' : 'border-yellow-400'
          }`}>
            <p className={getStatusMessage()?.color}>{getStatusMessage()?.text}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-primary-light text-cyan-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span>🔔</span>
                    Notifications
                  </h2>
                  <div className="space-y-4">
                    {Object.entries({
                      pushNotifications: 'Push Notifications',
                      emailNotifications: 'Email Notifications',
                      messageNotifications: 'Message Notifications',
                      matchNotifications: 'Match Notifications',
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{label}</span>
                          <p className="text-sm text-gray-400">
                            {key === 'pushNotifications' && 'Receive notifications on your device'}
                            {key === 'emailNotifications' && 'Get updates via email'}
                            {key === 'messageNotifications' && 'New message alerts'}
                            {key === 'matchNotifications' && 'New match notifications'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={notifications[key as keyof NotificationSettings]}
                            onChange={() => handleNotificationChange(key as keyof NotificationSettings)}
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-400"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span>🔒</span>
                    Security Status
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="font-medium mb-2">Current Security Level</h3>
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          securityLevel === 'none' ? 'bg-gray-500' :
                          securityLevel === 'basic' ? 'bg-yellow-500' :
                          securityLevel === 'enhanced' ? 'bg-blue-500' : 'bg-green-500'
                        }`}></div>
                        <span className="font-medium capitalize">{securityLevel}</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        {securityLevel === 'none' && 'No additional security measures are active'}
                        {securityLevel === 'basic' && 'Basic authentication and session management are active'}
                        {securityLevel === 'enhanced' && 'Enhanced monitoring and security checks are active'}
                        {securityLevel === 'maximum' && 'Maximum security with comprehensive protection is active'}
                      </p>
                    </div>
                    
                    <div className="text-sm text-gray-300">
                      <p className="mb-2"><strong>Note:</strong> Your security level is automatically determined based on:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-400">
                        <li>Account verification status</li>
                        <li>Login patterns and activity</li>
                        <li>Device and location history</li>
                        <li>Administrative privileges</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <SecurityDashboard />
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span>👁️</span>
                    Privacy Controls
                  </h2>
                  <div className="space-y-4">
                    {Object.entries({
                      showDistance: 'Show Distance',
                      showAge: 'Show Age',
                      showOnline: 'Show Online Status',
                      discoverableProfile: 'Discoverable Profile',
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{label}</span>
                          <p className="text-sm text-gray-400">
                            {key === 'showDistance' && 'Allow others to see your distance'}
                            {key === 'showAge' && 'Display your age on your profile'}
                            {key === 'showOnline' && 'Show when you\'re active'}
                            {key === 'discoverableProfile' && 'Allow your profile to be discovered'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={privacy[key as keyof PrivacySettings]}
                            onChange={() => handlePrivacyChange(key as keyof PrivacySettings)}
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-400"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Account Settings */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span>👤</span>
                    Account Management
                  </h2>
                  <div className="space-y-4">
                    {user && (
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h3 className="font-medium mb-2">Account Information</h3>
                        <div className="space-y-2 text-sm text-gray-300">
                          <p><span className="font-medium">Email:</span> {user.email}</p>
                          <p><span className="font-medium">Member since:</span> {new Date().getFullYear()}</p>
                          <p><span className="font-medium">Security Level:</span> <span className="capitalize">{securityLevel}</span></p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <button
                        onClick={handleSaveSettings}
                        disabled={loading}
                        className="w-full bg-cyan-400 text-slate-900 py-3 px-4 rounded-lg font-semibold hover:bg-opacity-80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-dark border-t-transparent"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <span>💾</span>
                            Save All Settings
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <span>🚪</span>
                        Logout
                      </button>

                      <button
                        onClick={handleDeleteAccount}
                        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <span>⚠️</span>
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Security Level</span>
                  <span className="capitalize font-medium">{securityLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profile Visibility</span>
                  <span className="font-medium">{privacy.discoverableProfile ? 'Public' : 'Private'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Notifications</span>
                  <span className="font-medium">
                    {Object.values(notifications).filter(Boolean).length}/4 Enabled
                  </span>
                </div>
              </div>
            </div>

            {/* App Info */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">About Way-d</h3>
              <div className="space-y-2 text-gray-300 text-sm">
                <p><span className="font-medium">Version:</span> 2.0.0</p>
                <p><span className="font-medium">Build:</span> {new Date().getFullYear()}.{String(new Date().getMonth() + 1).padStart(2, '0')}</p>
                <p><span className="font-medium">Security:</span> Enhanced</p>
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-400">© 2024 Way-d. All rights reserved.</p>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Help & Support</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-2 rounded hover:bg-gray-700 transition-colors text-sm">
                  📚 Help Center
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-700 transition-colors text-sm">
                  💬 Contact Support
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-700 transition-colors text-sm">
                  🐛 Report Bug
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-700 transition-colors text-sm">
                  📋 Privacy Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
