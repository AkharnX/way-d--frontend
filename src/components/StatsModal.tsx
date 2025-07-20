import React from 'react';
import { X, Heart, Users, Eye, TrendingUp } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    totalLikes: number;
    totalDislikes: number;
    totalMatches: number;
    likesReceived: number;
    profileViews: number;
  };
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  const statItems = [
    {
      icon: Heart,
      label: "J'aime donnés",
      value: stats.totalLikes,
      color: "text-green-500",
      bgColor: "bg-green-100"
    },
    {
      icon: X,
      label: "Profils passés",
      value: stats.totalDislikes,
      color: "text-red-500",
      bgColor: "bg-red-100"
    },
    {
      icon: Users,
      label: "Matches",
      value: stats.totalMatches,
      color: "text-blue-500",
      bgColor: "bg-blue-100"
    },
    {
      icon: TrendingUp,
      label: "J'aime reçus",
      value: stats.likesReceived,
      color: "text-purple-500",
      bgColor: "bg-purple-100"
    },
    {
      icon: Eye,
      label: "Vues de profil",
      value: stats.profileViews,
      color: "text-orange-500",
      bgColor: "bg-orange-100"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Vos statistiques</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {statItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border">
                <div className={`p-2 rounded-full ${item.bgColor}`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="text-xl font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
            );
          })}
          
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">
              💡 Conseil: Plus vous likez de profils, plus vous avez de chances de créer des matches !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
