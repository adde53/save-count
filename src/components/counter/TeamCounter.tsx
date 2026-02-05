import { useState, useRef } from 'react';
import GoalieSelector from './GoalieSelector';

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
    <div className="flex-1 flex flex-col gap-1">
      {/* Editable team name */}
      <div className="flex items-center justify-center gap-2 px-2">
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
            className="text-center text-sm font-semibold bg-transparent border-b-2 border-primary/50 outline-none w-full max-w-[160px] py-0.5"
          />
        ) : (
          <button
            onClick={startEditing}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors truncate max-w-[160px]"
            title="Klicka för att ändra lagnamn"
          >
            ✏️ {label}
          </button>
        )}
      </div>

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
