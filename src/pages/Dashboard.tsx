import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userStatsService, UserStats, ActivityItem } from '../services/userStatsService';
import { 
  Heart, 
  MessageCircle, 
  User, 
  Settings, 
  TrendingUp,
  Users,
  Star,
  Bell,
  Plus,
  Activity,
  Calendar,
  BarChart3
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats>({
    totalLikes: 0,
    totalMatches: 0,
    newMessages: 0,
    profileViews: 0,
    likesReceived: 0,
    profileCompleteness: 0,
    lastActive: new Date().toISOString()
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user stats and activities on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [userStats, userActivities] = await Promise.all([
        userStatsService.getUserStats(),
        userStatsService.getRecentActivities()
      ]);
      
      setStats(userStats);
      setActivities(userActivities);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: Heart,
      label: 'Découvrir',
      description: 'Trouvez de nouveaux profils',
      path: '/app/discovery',
      bgColor: 'bg-way-d-secondary/10',
      iconColor: 'way-d-secondary'
    },
    {
      icon: MessageCircle,
      label: 'Messages',
      description: stats.newMessages > 0 ? `${stats.newMessages} nouveau${stats.newMessages > 1 ? 'x' : ''} message${stats.newMessages > 1 ? 's' : ''}` : 'Aucun nouveau message',
      path: '/app/messages',
      bgColor: 'bg-way-d-primary/10',
      iconColor: 'way-d-primary'
    },
    {
      icon: User,
      label: 'Mon Profil',
      description: `Complet à ${stats.profileCompleteness}%`,
      path: '/app/profile',
      bgColor: 'bg-way-d-secondary/10',
      iconColor: 'way-d-secondary'
    },
    {
      icon: Settings,
      label: 'Paramètres',
      description: 'Gérer vos préférences',
      path: '/app/settings',
      bgColor: 'bg-way-d-primary/10',
      iconColor: 'way-d-primary'
    }
  ];

  const handleLogout = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src="/logo_blue.svg" 
                  alt="Way-d" 
                  className="h-12 w-auto"
                />
                <div className="h-8 w-px bg-gray-300"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold way-d-primary">
                  Bonjour, {user?.first_name || 'Utilisateur'} ! 👋
                </h1>
                <p className="text-gray-600 text-lg">Votre tableau de bord Way-d</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/app/settings')}
                className="p-3 text-gray-600 hover:text-way-d-primary hover:bg-way-d-primary/5 rounded-xl transition-all relative"
              >
                <Bell className="w-6 h-6" />
                {stats.newMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-way-d-secondary text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-semibold">
                    {stats.newMessages}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="btn-secondary text-base"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-way-d-primary"></div>
            <span className="ml-4 text-gray-600">Chargement de vos données...</span>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold way-d-primary">{stats.totalLikes}</p>
                    <p className="text-gray-600 font-medium">J'aime donnés</p>
                  </div>
                  <div className="w-14 h-14 bg-way-d-secondary/10 rounded-xl flex items-center justify-center">
                    <Heart className="w-7 h-7 way-d-secondary" />
                  </div>
                </div>
                {stats.totalLikes === 0 && (
                  <p className="text-xs text-gray-500 mt-2">Commencez à découvrir des profils</p>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold way-d-primary">{stats.totalMatches}</p>
                    <p className="text-gray-600 font-medium">Matches</p>
                  </div>
                  <div className="w-14 h-14 bg-way-d-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-7 h-7 way-d-primary" />
                  </div>
                </div>
                {stats.totalMatches === 0 && (
                  <p className="text-xs text-gray-500 mt-2">Aucun match pour le moment</p>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold way-d-primary">{stats.newMessages}</p>
                    <p className="text-gray-600 font-medium">Messages non lus</p>
                  </div>
                  <div className="w-14 h-14 bg-way-d-secondary/10 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-7 h-7 way-d-secondary" />
                  </div>
                </div>
                {stats.newMessages === 0 && (
                  <p className="text-xs text-gray-500 mt-2">Aucun nouveau message</p>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold way-d-primary">{stats.profileViews}</p>
                    <p className="text-gray-600 font-medium">Vues du profil</p>
                  </div>
                  <div className="w-14 h-14 bg-way-d-primary/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 way-d-primary" />
                  </div>
                </div>
                {stats.profileViews === 0 && (
                  <p className="text-xs text-gray-500 mt-2">Votre profil n'a pas encore été vu</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold way-d-primary">Actions rapides</h2>
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={index}
                      to={action.path}
                      className="group flex items-center p-6 rounded-2xl border border-gray-200 hover:border-way-d-secondary hover:shadow-lg transition-all duration-300"
                    >
                      <div className={`w-16 h-16 ${action.bgColor} rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-8 h-8 ${action.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold way-d-primary text-lg group-hover:text-way-d-secondary transition-colors">
                          {action.label}
                        </h3>
                        <p className="text-gray-600">{action.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold way-d-primary">Activité récente</h2>
                <Activity className="w-6 h-6 text-gray-400" />
              </div>
              
              {activities.length > 0 ? (
                <div className="space-y-6">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-5 bg-way-d-primary/5 rounded-2xl border border-way-d-primary/20">
                      <div className="w-12 h-12 bg-way-d-primary rounded-full flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{activity.title}</p>
                        <p className="text-gray-500">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune activité récente</h3>
                  <p className="text-gray-500 mb-6">Commencez à utiliser Way-d pour voir votre activité ici</p>
                  <Link
                    to="/app/discovery"
                    className="inline-flex items-center px-6 py-3 bg-way-d-primary text-white rounded-xl hover:bg-way-d-primary/90 transition-colors"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Découvrir des profils
                  </Link>
                </div>
              )}
            </div>

            {/* Profile Completion Tip */}
            {stats.profileCompleteness < 80 && (
              <div className="bg-way-d-primary rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <img 
                      src="/logo_white.svg" 
                      alt="Way-d" 
                      className="h-8 w-auto"
                    />
                    <Star className="w-8 h-8" />
                    <h2 className="text-2xl font-semibold">Conseil du jour</h2>
                  </div>
                  <Calendar className="w-6 h-6 opacity-80" />
                </div>
                <p className="text-white/90 mb-6 text-lg leading-relaxed">
                  Votre profil est complété à {stats.profileCompleteness}%. Complétez-le pour augmenter vos chances de match !
                </p>
                <Link
                  to="/app/profile"
                  className="inline-flex items-center px-6 py-4 bg-way-d-secondary hover:bg-way-d-secondary/90 rounded-xl font-semibold transition-colors way-d-primary text-lg"
                >
                  <User className="w-5 h-5 mr-3" />
                  Améliorer mon profil
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom spacing for mobile navigation */}
      <div className="pb-20"></div>
    </div>
  );
};

export default Dashboard;