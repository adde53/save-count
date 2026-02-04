import GoalieSelector from './GoalieSelector';

interface TeamCounterProps {
  team: 'home' | 'away';
  label: string;
  count: number;
  totalCount: number;
  isAnimating: boolean;
  onClick: () => void;
  selectedGoalieId?: string | null;
  onGoalieChange?: (goalieId: string | null) => void;
  showGoalieSelector?: boolean;
}

export default function TeamCounter({
  team,
  label,
  count,
  totalCount,
  isAnimating,
  onClick,
  selectedGoalieId,
  onGoalieChange,
  showGoalieSelector = false,
}: TeamCounterProps) {
  const isHome = team === 'home';
  
  return (
    <div className="flex-1 flex flex-col gap-1">
      {showGoalieSelector && onGoalieChange && (
        <GoalieSelector
          label="Välj målvakt"
          value={selectedGoalieId || null}
          onChange={onGoalieChange}
        />
      )}
      <button
        onClick={onClick}
        className={`flex-1 rounded-2xl bg-card flex flex-col items-center justify-center gap-1 tap-scale border-2 transition-all ${
          isHome 
            ? 'btn-glow-home border-home/30 active:border-home/60' 
            : 'btn-glow-away border-away/30 active:border-away/60'
        }`}
        aria-label={`Lägg till räddning för ${label}`}
      >
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
          {label}
        </span>
        <span
          className={`text-7xl sm:text-8xl font-bold counter-number ${
            isHome ? 'text-home' : 'text-away'
          } ${isAnimating ? 'animate-count' : ''}`}
        >
          {count}
        </span>
        {totalCount !== count && (
          <span className={`text-lg ${isHome ? 'text-home/60' : 'text-away/60'}`}>
            (totalt: {totalCount})
          </span>
        )}
        <span className={`text-3xl ${isHome ? 'text-home/60' : 'text-away/60'}`}>➕</span>
      </button>
    </div>
  );
}
