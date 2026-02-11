import { useState, useRef } from 'react';
import GoalieSelector from './GoalieSelector';
import ShotButtons from './ShotButtons';
import { ShotOutcome, OUTCOME_CONFIG } from '@/lib/shotTypes';

interface ShotCounts {
  saves: number;
  goals: number;
  onTarget: number;
}

interface TeamCounterProps {
  team: 'home' | 'away';
  label: string;
  count: number;
  totalCount: number;
  isAnimating: boolean;
  onClick: () => void;
  onLabelChange?: (name: string) => void;
  selectedGoalieId?: string | null;
  onGoalieChange?: (goalieId: string | null) => void;
  showGoalieSelector?: boolean;
  onShot?: (team: 'home' | 'away', outcome: ShotOutcome) => void;
  shotCounts?: ShotCounts;
}

export default function TeamCounter({
  team,
  label,
  count,
  totalCount,
  isAnimating,
  onClick,
  onLabelChange,
  selectedGoalieId,
  onGoalieChange,
  showGoalieSelector = false,
  onShot,
  shotCounts,
}: TeamCounterProps) {
  const isHome = team === 'home';
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(label);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && onLabelChange) {
      onLabelChange(trimmed);
    }
    setEditing(false);
  };

  return (
    <div className="flex-1 flex flex-col gap-1.5">
      {/* Team name + goalie */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isHome ? 'bg-home' : 'bg-away'}`} />
          {editing ? (
            <input
              ref={inputRef}
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitEdit();
                if (e.key === 'Escape') setEditing(false);
              }}
              className="text-sm font-semibold bg-transparent border-b-2 border-primary/50 outline-none w-full max-w-[140px] py-0.5"
            />
          ) : (
            <button
              onClick={startEditing}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors truncate max-w-[140px]"
              title="Klicka för att ändra lagnamn"
            >
              {label}
            </button>
          )}
        </div>
        {totalCount !== count && (
          <span className="text-xs text-muted-foreground tabular-nums">
            Totalt: {totalCount}
          </span>
        )}
      </div>

      {showGoalieSelector && onGoalieChange && (
        <GoalieSelector
          label="Välj målvakt"
          value={selectedGoalieId || null}
          onChange={onGoalieChange}
        />
      )}

      {/* Big tap button */}
      <button
        onClick={onClick}
        className={`flex-1 rounded-2xl bg-card flex flex-col items-center justify-center gap-0.5 tap-scale border transition-all min-h-[120px] ${
          isHome
            ? 'btn-glow-home border-home/20 active:border-home/50'
            : 'btn-glow-away border-away/20 active:border-away/50'
        }`}
        aria-label={`Lägg till räddning för ${label}`}
      >
        <span
          className={`text-6xl sm:text-7xl font-bold counter-number leading-none ${
            isHome ? 'text-home' : 'text-away'
          } ${isAnimating ? 'animate-count' : ''}`}
        >
          {count}
        </span>
        <span className={`text-xs font-medium ${isHome ? 'text-home/40' : 'text-away/40'} uppercase tracking-widest`}>
          tryck för räddning
        </span>
      </button>

      {/* Shot type counts - always visible */}
      {shotCounts && (shotCounts.goals > 0 || shotCounts.onTarget > 0) && (
        <div className="flex gap-1.5">
          {shotCounts.goals > 0 && (
            <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-secondary/80">
              <span className="text-xs">{OUTCOME_CONFIG.goal.emoji}</span>
              <span className="text-sm font-bold" style={{ color: OUTCOME_CONFIG.goal.color }}>{shotCounts.goals}</span>
              <span className="text-[10px] text-muted-foreground">mål</span>
            </div>
          )}
          {shotCounts.onTarget > 0 && (
            <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-secondary/80">
              <span className="text-xs">{OUTCOME_CONFIG.on_target.emoji}</span>
              <span className="text-sm font-bold" style={{ color: OUTCOME_CONFIG.on_target.color }}>{shotCounts.onTarget}</span>
              <span className="text-[10px] text-muted-foreground">på mål</span>
            </div>
          )}
        </div>
      )}

      {onShot && (
        <ShotButtons team={team} onShot={onShot} />
      )}
    </div>
  );
}
