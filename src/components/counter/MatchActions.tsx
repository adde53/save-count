import { Share2, Save, History, Users, BarChart3 } from 'lucide-react';

interface MatchActionsProps {
  onShare: () => void;
  onSave: () => void;
  onShowHistory: () => void;
  onShowTeams: () => void;
  onShowStats: () => void;
  hasSavedMatches: boolean;
  isLoggedIn: boolean;
}

export default function MatchActions({
  onShare,
  onSave,
  onShowHistory,
  onShowTeams,
  onShowStats,
  hasSavedMatches,
  isLoggedIn,
}: MatchActionsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onShare}
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-card border border-border text-foreground font-medium tap-scale text-sm hover:bg-secondary transition-colors"
        aria-label="Dela match"
      >
        <Share2 className="w-4 h-4 text-muted-foreground" />
        Dela
      </button>
      <button
        onClick={onSave}
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-card border border-border text-foreground font-medium tap-scale text-sm hover:bg-secondary transition-colors"
        aria-label="Spara match"
      >
        <Save className="w-4 h-4 text-muted-foreground" />
        Spara
      </button>
      {hasSavedMatches && (
        <button
          onClick={onShowHistory}
          className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-card border border-border text-muted-foreground font-medium tap-scale hover:bg-secondary hover:text-foreground transition-colors"
          aria-label="Visa sparade matcher"
        >
          <History className="w-4 h-4" />
        </button>
      )}
      {isLoggedIn && (
        <>
          <button
            onClick={onShowTeams}
            className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-card border border-border text-muted-foreground font-medium tap-scale hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Hantera lag och målvakter"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={onShowStats}
            className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-card border border-border text-muted-foreground font-medium tap-scale hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Visa statistik"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}
