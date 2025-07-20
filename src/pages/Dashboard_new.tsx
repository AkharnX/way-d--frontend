import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/api';
import { 
  Heart, 
  MessageCircle, 
  User, 
  Settings, 
  Search, 
  Bell, 
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  LogOut
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    likes: 0,
    matches: 0,
    messages: 0,
    views: 0
  });

  // Check if user has a complete profile
  useEffect(() => {
    const checkProfile = async () => {
      // Skip profile check if we're already on create-profile page
      if (location.pathname === '/create-profile') {
        return;
      }

      try {
        await profileService.getProfile();
        // Load user stats
        loadStats();
      } catch (error: any) {
        if (error.response?.status === 404) {
          // User doesn't have a profile, redirect to create-profile
          navigate('/create-profile');
        }
      }
    };

    checkProfile();
  }, [navigate, location.pathname]);

  const loadStats = async () => {
    // Placeholder for stats loading
    setStats({
      likes: Math.floor(Math.random() * 50),
      matches: Math.floor(Math.random() * 15),
      messages: Math.floor(Math.random() * 30),
      views: Math.floor(Math.random() * 100)
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Découverte', path: '/app', icon: Search, color: 'bg-purple-500' },
    { name: 'Messages', path: '/app/messages', icon: MessageCircle, color: 'bg-blue-500' },
    { name: 'Profil', path: '/app/profile', icon: User, color: 'bg-green-500' },
    { name: 'Paramètres', path: '/app/settings', icon: Settings, color: 'bg-gray-500' },
  ];

  const quickStats = [
    { label: 'Likes reçus', value: stats.likes, icon: Heart, color: 'text-red-500' },
    { label: 'Matches', value: stats.matches, icon: Sparkles, color: 'text-purple-500' },
    { label: 'Messages', value: stats.messages, icon: MessageCircle, color: 'text-blue-500' },
    { label: 'Vues profil', value: stats.views, icon: TrendingUp, color: 'text-green-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/logo-name-blue.png"
                alt="Way-d" 
                className="h-8 w-auto"
              />
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-gray-800">
                  Bonjour, {user?.first_name || 'Utilisateur'} !
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-800">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-gray-500">En ligne</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="card-modern p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Navigation
              </h2>
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-50 text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                        }
                      `}
                    >
                      <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="card-modern p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Statistiques
              </h2>
              <div className="space-y-4">
                {quickStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                        <span className="text-sm text-gray-600">{stat.label}</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-800">{stat.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-modern p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions rapides</h2>
              <div className="space-y-3">
                <Link 
                  to="/app" 
                  className="block w-full btn-primary text-center text-sm py-2"
                >
                  Découvrir des profils
                </Link>
                <Link 
                  to="/app/messages" 
                  className="block w-full btn-secondary text-center text-sm py-2"
                >
                  Voir mes messages
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Welcome Message */}
            {location.pathname === '/app' && (
              <div className="card-modern p-8 mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">
                      Bienvenue sur Way-d, {user?.first_name} ! 🚀
                    </h1>
                    <p className="text-blue-100 mb-4">
                      Découvrez de nouvelles personnes et créez des connexions authentiques
                    </p>
                    <div className="flex items-center gap-4 text-sm text-blue-100">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>+500 nouveaux profils cette semaine</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Actif depuis {new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                      <Heart className="w-16 h-16 text-white/70" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Page Content */}
            <div className="card-modern min-h-[600px]">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
