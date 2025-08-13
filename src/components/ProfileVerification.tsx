import React, { useState, useCallback } from 'react';
import { 
  Shield, 
  Camera, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  X,
  Loader2,
  Info
} from 'lucide-react';
import { validateImageFile, stripExifData } from '../utils/imageUtils';

export type VerificationStatus = 'not_started' | 'pending' | 'approved' | 'rejected' | 'expired';
export type VerificationType = 'document' | 'selfie' | 'video';

export interface VerificationDocument {
  id: string;
  type: VerificationType;
  file: File | null;
  url: string;
  status: VerificationStatus;
  uploadedAt?: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
}

interface ProfileVerificationProps {
  currentStatus: VerificationStatus;
  onVerificationSubmit: (documents: VerificationDocument[]) => void;
  className?: string;
}

const VERIFICATION_STEPS = [
  {
    type: 'document' as VerificationType,
    title: 'Document d\'identité',
    description: 'Carte d\'identité, passeport ou permis de conduire',
    icon: FileText,
    requirements: [
      'Document en cours de validité',
      'Toutes les informations visibles',
      'Bonne qualité photo',
      'Pas de reflets ou d\'ombres'
    ]
  },
  {
    type: 'selfie' as VerificationType,
    title: 'Selfie de vérification',
    description: 'Photo de vous tenant votre document',
    icon: Camera,
    requirements: [
      'Visage clairement visible',
      'Document tenu à côté du visage',
      'Éclairage suffisant',
      'Regarder directement la caméra'
    ]
  }
];

export default function ProfileVerification({ 
  currentStatus, 
  onVerificationSubmit, 
  className = '' 
}: ProfileVerificationProps) {
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState('');

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'expired': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5" />;
      case 'pending': return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'rejected': return <AlertCircle className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: VerificationStatus) => {
    switch (status) {
      case 'approved': return 'Profil vérifié';
      case 'pending': return 'Vérification en cours';
      case 'rejected': return 'Vérification refusée';
      case 'expired': return 'Vérification expirée';
      default: return 'Non vérifié';
    }
  };

  const handleFileUpload = useCallback(async (file: File, type: VerificationType) => {
    setError('');
    setLoading(true);

    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Strip EXIF data for privacy
      const cleanFile = await stripExifData(file);
      const url = URL.createObjectURL(cleanFile);

      const newDocument: VerificationDocument = {
        id: `${type}_${Date.now()}`,
        type,
        file: cleanFile,
        url,
        status: 'not_started',
        uploadedAt: new Date()
      };

      setDocuments(prev => {
        const filtered = prev.filter(doc => doc.type !== type);
        return [...filtered, newDocument];
      });

      // Move to next step if available
      if (currentStep < VERIFICATION_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
    } finally {
      setLoading(false);
    }
  }, [currentStep]);

  const handleDrag = useCallback((e: React.DragEvent, type: VerificationType) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(type);
    } else if (e.type === 'dragleave') {
      setDragActive('');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: VerificationType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive('');
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0], type);
    }
  }, [handleFileUpload]);

  const removeDocument = useCallback((docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  }, []);

  const submitVerification = useCallback(async () => {
    if (documents.length < 2) {
      setError('Veuillez fournir tous les documents requis');
      return;
    }

    setLoading(true);
    try {
      // Update status to pending for all documents
      const updatedDocs = documents.map(doc => ({
        ...doc,
        status: 'pending' as VerificationStatus
      }));
      
      setDocuments(updatedDocs);
      onVerificationSubmit(updatedDocs);
      
    } catch (error) {
      setError('Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  }, [documents, onVerificationSubmit]);

  const canSubmit = documents.length === VERIFICATION_STEPS.length && 
                   documents.every(doc => doc.file);

  return (
    <div className={className}>
      {/* Current status */}
      <div className={`flex items-center p-4 rounded-lg border ${getStatusColor(currentStatus)} mb-6`}>
        {getStatusIcon(currentStatus)}
        <div className="ml-3">
          <h3 className="font-medium">{getStatusText(currentStatus)}</h3>
          {currentStatus === 'pending' && (
            <p className="text-sm mt-1">
              Vos documents sont en cours de révision (24-48h)
            </p>
          )}
          {currentStatus === 'rejected' && (
            <p className="text-sm mt-1">
              Veuillez soumettre de nouveaux documents conformes aux exigences
            </p>
          )}
          {currentStatus === 'approved' && (
            <p className="text-sm mt-1">
              Votre profil est vérifié et bénéficie d'une meilleure visibilité
            </p>
          )}
        </div>
      </div>

      {/* Verification process */}
      {currentStatus !== 'approved' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
              <div>
                <h4 className="font-medium text-blue-800">Pourquoi vérifier mon profil ?</h4>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Augmente votre visibilité dans les résultats</li>
                  <li>• Inspire confiance aux autres utilisateurs</li>
                  <li>• Accès prioritaire aux nouvelles fonctionnalités</li>
                  <li>• Badge de vérification sur votre profil</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {VERIFICATION_STEPS.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = documents.some(doc => doc.type === step.type);
              const document = documents.find(doc => doc.type === step.type);

              return (
                <div key={step.type} className={`border rounded-lg p-6 ${
                  isActive ? 'border-blue-500 bg-blue-50' : 
                  isCompleted ? 'border-green-500 bg-green-50' : 
                  'border-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${
                        isCompleted ? 'bg-green-100 text-green-600' :
                        isActive ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {step.title}
                          {isCompleted && (
                            <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-500">
                      Étape {index + 1}
                    </span>
                  </div>

                  {/* Requirements */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Exigences:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {step.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Upload area or preview */}
                  {document ? (
                    <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
                      <div className="flex items-center">
                        <img
                          src={document.url}
                          alt={step.title}
                          className="w-16 h-16 object-cover rounded-lg mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Document téléchargé</p>
                          <p className="text-sm text-gray-600">
                            {document.uploadedAt?.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeDocument(document.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive === step.type 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragEnter={(e) => handleDrag(e, step.type)}
                      onDragLeave={(e) => handleDrag(e, step.type)}
                      onDragOver={(e) => handleDrag(e, step.type)}
                      onDrop={(e) => handleDrop(e, step.type)}
                    >
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, step.type);
                        }}
                        className="hidden"
                        id={`upload-${step.type}`}
                        disabled={loading}
                      />
                      <label htmlFor={`upload-${step.type}`} className="cursor-pointer">
                        {loading ? (
                          <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-spin" />
                        ) : (
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        )}
                        <p className="text-sm text-gray-600">
                          {loading ? 'Traitement...' : 'Cliquez ou glissez pour télécharger'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          JPEG, PNG, WebP - Max 10MB
                        </p>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit button */}
          <div className="flex justify-center pt-6">
            <button
              onClick={submitVerification}
              disabled={!canSubmit || loading}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                canSubmit && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Soumission...
                </div>
              ) : (
                'Soumettre pour vérification'
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-center justify-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}