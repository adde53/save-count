import { SportConfig } from '@/lib/sportConfig';
import { PeriodCounts, getTotals } from '@/lib/matchTypes';

interface PeriodTabsProps {
  sportConfig: SportConfig;
  currentPeriod: number;
  periods: PeriodCounts[];
  onSelectPeriod: (period: number) => void;
}

export default function PeriodTabs({
  sportConfig,
  currentPeriod,
  periods,
  onSelectPeriod,
}: PeriodTabsProps) {
  const totals = getTotals(periods);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {periods.map((_, index) => {
        const periodData = periods[index];
        const isActive = currentPeriod === index;
        
        return (
          <button
            key={index}
            onClick={() => onSelectPeriod(index)}
            className={`flex flex-col items-center px-3 py-2 rounded-lg text-sm transition-all tap-scale min-w-[70px] ${
              isActive
                ? 'bg-card border-2 border-primary/50'
                : 'bg-secondary/50 border-2 border-transparent'
            }`}
          >
            <span className={`font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
              {sportConfig.periodName} {index + 1}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              <span className="text-home">{periodData.home}</span>
              {' - '}
              <span className="text-away">{periodData.away}</span>
            </span>
          </button>
        );
      })}
      
      {/* Totalt */}
      <div className="flex flex-col items-center px-3 py-2 rounded-lg text-sm bg-primary/10 border-2 border-primary/20 min-w-[70px]">
        <span className="font-semibold text-foreground">Totalt</span>
        <span className="text-xs mt-0.5">
          <span className="text-home font-bold">{totals.home}</span>
          {' - '}
          <span className="text-away font-bold">{totals.away}</span>
        </span>
      </div>
    </div>
  );
}
