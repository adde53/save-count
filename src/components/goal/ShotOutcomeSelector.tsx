import { ShotOutcome, OUTCOME_CONFIG } from '@/lib/shotTypes';

interface ShotOutcomeSelectorProps {
  selected: ShotOutcome;
  onChange: (outcome: ShotOutcome) => void;
}

const outcomes: ShotOutcome[] = ['save', 'goal', 'on_target', 'off_target'];

export default function ShotOutcomeSelector({ selected, onChange }: ShotOutcomeSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {outcomes.map((outcome) => {
        const config = OUTCOME_CONFIG[outcome];
        const isActive = selected === outcome;
        return (
          <button
            key={outcome}
            onClick={() => onChange(outcome)}
            className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl font-medium text-xs transition-all tap-scale ${
              isActive
                ? 'ring-2 ring-offset-2 ring-offset-background scale-105'
                : 'bg-secondary opacity-70'
            }`}
            style={{
              backgroundColor: isActive ? config.color : undefined,
              color: isActive ? 'white' : undefined,
              boxShadow: isActive ? `0 0 20px ${config.color}40` : undefined,
              // @ts-ignore
              '--tw-ring-color': config.color,
            }}
          >
            <span className="text-lg">{config.emoji}</span>
            <span>{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
