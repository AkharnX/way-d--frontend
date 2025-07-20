import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Heart, MessageCircle, User, Compass } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { 
      path: '/app/discovery', 
      icon: Heart, 
      label: 'Découvrir',
      color: 'text-pink-500'
    },
    { 
      path: '/app/messages', 
      icon: MessageCircle, 
      label: 'Messages',
      color: 'text-blue-500'
    },
    { 
      path: '/app/profile', 
      icon: User, 
      label: 'Profil',
      color: 'text-green-500'
    },
    { 
      path: '/app', 
      icon: Compass, 
      label: 'Accueil',
      color: 'text-purple-500'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
