import { 
  Shield, 
  Clock, 
  AlertCircle,
  ShieldCheck,
  Star
} from 'lucide-react';
import type { VerificationStatus } from './ProfileVerification';

interface VerificationBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  variant?: 'default' | 'profile' | 'compact';
}

export default function VerificationBadge({ 
  status,
  size = 'md',
  showText = true,
  className = '',
  variant = 'default'
}: VerificationBadgeProps) {
  const getStatusConfig = (status: VerificationStatus) => {
    switch (status) {
      case 'approved':
        return {
          icon: ShieldCheck,
          text: 'Vérifié',
          shortText: 'Vérifié',
          colors: {
            default: 'bg-green-100 text-green-800 border-green-200',
            profile: 'bg-green-500 text-white',
            compact: 'text-green-600'
          },
          description: 'Profil vérifié par notre équipe'
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'En cours de vérification',
          shortText: 'En cours',
          colors: {
            default: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            profile: 'bg-yellow-500 text-white',
            compact: 'text-yellow-600'
          },
          description: 'Vérification en cours (24-48h)'
        };
      case 'rejected':
        return {
          icon: AlertCircle,
          text: 'Vérification refusée',
          shortText: 'Refusée',
          colors: {
            default: 'bg-red-100 text-red-800 border-red-200',
            profile: 'bg-red-500 text-white',
            compact: 'text-red-600'
          },
          description: 'Documents non conformes aux exigences'
        };
      case 'expired':
        return {
          icon: Shield,
          text: 'Vérification expirée',
          shortText: 'Expirée',
          colors: {
            default: 'bg-gray-100 text-gray-800 border-gray-200',
            profile: 'bg-gray-500 text-white',
            compact: 'text-gray-600'
          },
          description: 'Vérification à renouveler'
        };
      default:
        return {
          icon: Shield,
          text: 'Non vérifié',
          shortText: 'Non vérifié',
          colors: {
            default: 'bg-gray-100 text-gray-600 border-gray-200',
            profile: 'bg-gray-400 text-white',
            compact: 'text-gray-400'
          },
          description: 'Profil non vérifié'
        };
    }
  };

  const getSizeClasses = (size: string, variant: string) => {
    if (variant === 'compact') {
      return size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
    }
    
    if (variant === 'profile') {
      return size === 'sm' ? 'w-5 h-5 p-1' : size === 'lg' ? 'w-8 h-8 p-1.5' : 'w-6 h-6 p-1';
    }
    
    return size === 'sm' ? 'px-2 py-1 text-xs' : size === 'lg' ? 'px-4 py-2 text-base' : 'px-3 py-1.5 text-sm';
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size, variant);
  const IconComponent = config.icon;

  // Compact variant - just icon
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center ${className}`} title={config.description}>
        <IconComponent className={`${sizeClasses} ${config.colors.compact}`} />
      </div>
    );
  }

  // Profile variant - circular badge
  if (variant === 'profile') {
    return (
      <div 
        className={`inline-flex items-center justify-center rounded-full ${sizeClasses} ${config.colors.profile} ${className}`}
        title={config.description}
      >
        <IconComponent className="w-full h-full" />
      </div>
    );
  }

  // Default variant - full badge with text
  return (
    <div className={`inline-flex items-center rounded-full border ${sizeClasses} ${config.colors.default} ${className}`}>
      <IconComponent className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} ${showText ? 'mr-1.5' : ''}`} />
      {showText && (
        <span className="font-medium">
          {size === 'sm' ? config.shortText : config.text}
        </span>
      )}
    </div>
  );
}

// Enhanced verification badge with premium features
export function PremiumVerificationBadge({ 
  status,
  isPremium = false,
  verificationDate,
  className = ''
}: {
  status: VerificationStatus;
  isPremium?: boolean;
  verificationDate?: Date;
  className?: string;
}) {
  if (status !== 'approved') {
    return <VerificationBadge status={status} className={className} />;
  }

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div className="flex items-center">
        <VerificationBadge status={status} size="sm" showText={false} variant="profile" />
        {isPremium && (
          <div className="ml-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full p-1">
            <Star className="w-3 h-3" />
          </div>
        )}
      </div>
      <div className="text-xs text-gray-600">
        <span className="font-medium text-green-600">Vérifié</span>
        {isPremium && <span className="text-orange-600 ml-1">Premium</span>}
        {verificationDate && (
          <div className="text-gray-500">
            {verificationDate.toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}

// Verification progress indicator
export function VerificationProgress({ 
  currentStep, 
  totalSteps,
  className = ''
}: {
  currentStep: number;
  totalSteps: number;
  className?: string;
}) {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>Progression de la vérification</span>
        <span>{currentStep}/{totalSteps}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {currentStep === totalSteps 
          ? 'Vérification terminée - En attente de révision'
          : `Étape ${currentStep} sur ${totalSteps} complétée`
        }
      </p>
    </div>
  );
}