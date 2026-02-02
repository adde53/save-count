interface TeamCounterProps {
  team: 'home' | 'away';
  label: string;
  count: number;
  totalCount: number;
  isAnimating: boolean;
  onClick: () => void;
}

export default function TeamCounter({
  team,
  label,
  count,
  totalCount,
  isAnimating,
  onClick,
}: TeamCounterProps) {
  const isHome = team === 'home';
  
  return (
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
  );
}
