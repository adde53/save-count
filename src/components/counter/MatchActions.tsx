import { Share2, Save, History, Users, BarChart3, Target } from 'lucide-react';

interface MatchActionsProps {
  onShare: () => void;
  onSave: () => void;
  onShowHistory: () => void;
  onShowTeams: () => void;
  onShowStats: () => void;
  onGoalTracker: () => void;
  hasSavedMatches: boolean;
  isLoggedIn: boolean;
}

export default function MatchActions({
  onShare,
  onSave,
  onShowHistory,
  onShowTeams,
  onShowStats,
  onGoalTracker,
  hasSavedMatches,
  isLoggedIn,
}: MatchActionsProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Primary action - Goal Tracker */}
      <button
        onClick={onGoalTracker}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-base tap-scale shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.97]"
        aria-label="Öppna skottkarta"
      >
        <Target className="w-5 h-5" />
        Skottkarta
      </button>

      {/* Secondary actions */}
      <div className="flex gap-2">
        <button
          onClick={onShare}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-secondary text-foreground font-medium tap-scale text-sm"
          aria-label="Dela match"
        >
          <Share2 className="w-4 h-4" />
          Dela
        </button>
        <button
          onClick={onSave}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-secondary text-foreground font-medium tap-scale text-sm"
          aria-label="Spara match"
        >
          <Save className="w-4 h-4" />
          Spara
        </button>
        {hasSavedMatches && (
          <button
            onClick={onShowHistory}
            className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-secondary text-foreground font-medium tap-scale"
            aria-label="Visa sparade matcher"
          >
            <History className="w-4 h-4" />
          </button>
        )}
        {isLoggedIn && (
          <>
            <button
              onClick={onShowTeams}
              className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-secondary text-foreground font-medium tap-scale"
              aria-label="Hantera lag och målvakter"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={onShowStats}
              className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-secondary text-foreground font-medium tap-scale"
              aria-label="Visa statistik"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
