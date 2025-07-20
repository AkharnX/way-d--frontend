import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, X } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  showHome?: boolean;
  showClose?: boolean;
  customBackAction?: () => void;
  rightActions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showBack = true,
  showHome = false,
  showClose = false,
  customBackAction,
  rightActions
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (customBackAction) {
      customBackAction();
    } else {
      // Smart back navigation
      if (location.key !== 'default') {
        navigate(-1);
      } else {
        // If no history, go to dashboard
        navigate('/app');
      }
    }
  };

  const handleHome = () => {
    navigate('/app');
  };

  const handleClose = () => {
    // For modal-like pages, close and go back
    navigate(-1);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-3">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              title="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          
          {showHome && (
            <button
              onClick={handleHome}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              title="Accueil"
            >
              <Home className="w-5 h-5" />
            </button>
          )}

          {showClose && (
            <button
              onClick={handleClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h1>
        </div>

        {rightActions && (
          <div className="flex items-center space-x-2">
            {rightActions}
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
