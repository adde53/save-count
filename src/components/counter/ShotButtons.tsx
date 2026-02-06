import { ShotOutcome, OUTCOME_CONFIG } from '@/lib/shotTypes';

interface ShotButtonsProps {
  team: 'home' | 'away';
  onShot: (team: 'home' | 'away', outcome: ShotOutcome) => void;
}

const outcomes: ShotOutcome[] = ['save', 'goal', 'on_target'];

export default function ShotButtons({ team, onShot }: ShotButtonsProps) {
  return (
    <div className="flex gap-1.5">
      {outcomes.map(outcome => {
        const cfg = OUTCOME_CONFIG[outcome];
        return (
          <button
            key={outcome}
            onClick={(e) => {
              e.stopPropagation();
              onShot(team, outcome);
            }}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium tap-scale transition-all bg-secondary/80 hover:bg-secondary"
            style={{ color: cfg.color }}
          >
            <span>{cfg.emoji}</span>
            <span className="hidden sm:inline">{cfg.label}</span>
          </button>
        );
      })}
    </div>
  );
}
