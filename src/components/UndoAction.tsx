import React from 'react';
import { Undo } from 'lucide-react';

interface UndoActionProps {
  lastAction: {
    type: 'like' | 'dislike';
    profileId: string;
    profileName: string;
  } | null;
  onUndo: () => void;
  loading?: boolean;
}

const UndoAction: React.FC<UndoActionProps> = ({ lastAction, onUndo, loading = false }) => {
  if (!lastAction) return null;

  const actionText = lastAction.type === 'like' ? 'aimé' : 'passé';
  const actionColor = lastAction.type === 'like' ? 'text-green-600' : 'text-red-600';

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-full shadow-lg border border-gray-200 px-4 py-2 flex items-center space-x-3 max-w-sm">
        <span className={`text-sm ${actionColor}`}>
          Vous avez {actionText} {lastAction.profileName}
        </span>
        <button
          onClick={onUndo}
          disabled={loading}
          className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm transition-colors disabled:opacity-50"
        >
          <Undo className="w-3 h-3" />
          <span>Annuler</span>
        </button>
      </div>
    </div>
  );
};

export default UndoAction;
