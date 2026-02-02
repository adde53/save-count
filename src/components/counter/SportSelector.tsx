import { SPORTS, SportType } from '@/lib/sportConfig';

interface SportSelectorProps {
  selectedSport: SportType;
  onSelectSport: (sport: SportType) => void;
  disabled?: boolean;
}

export default function SportSelector({
  selectedSport,
  onSelectSport,
  disabled,
}: SportSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {SPORTS.map((sport) => (
        <button
          key={sport.id}
          onClick={() => onSelectSport(sport.id)}
          disabled={disabled}
          className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
            selectedSport === sport.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'tap-scale'}`}
        >
          {sport.name}
        </button>
      ))}
    </div>
  );
}
