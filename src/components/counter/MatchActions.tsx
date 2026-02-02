import { Share2, Save, History } from 'lucide-react';

interface MatchActionsProps {
  onShare: () => void;
  onSave: () => void;
  onShowHistory: () => void;
  hasSavedMatches: boolean;
}

export default function MatchActions({
  onShare,
  onSave,
  onShowHistory,
  hasSavedMatches,
}: MatchActionsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onShare}
        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-foreground font-medium tap-scale"
        aria-label="Dela match"
      >
        <Share2 className="w-4 h-4" />
        Dela
      </button>
      <button
        onClick={onSave}
        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-foreground font-medium tap-scale"
        aria-label="Spara match"
      >
        <Save className="w-4 h-4" />
        Spara
      </button>
      {hasSavedMatches && (
        <button
          onClick={onShowHistory}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-secondary text-foreground font-medium tap-scale"
          aria-label="Visa sparade matcher"
        >
          <History className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
