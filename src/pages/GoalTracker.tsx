import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Undo2, RotateCcw } from 'lucide-react';
import { SportType, getSportConfig, SPORTS } from '@/lib/sportConfig';
import { ShotOutcome, OUTCOME_CONFIG } from '@/lib/shotTypes';
import { useShotEvents } from '@/hooks/useShotEvents';
import GoalView from '@/components/goal/GoalView';
import ShotOutcomeSelector from '@/components/goal/ShotOutcomeSelector';

export default function GoalTracker() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSport = (searchParams.get('sport') as SportType) || 'innebandy';
  
  const [sport, setSport] = useState<SportType>(initialSport);
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [selectedOutcome, setSelectedOutcome] = useState<ShotOutcome>('save');
  const [currentPeriod, setCurrentPeriod] = useState(0);
  const homeTeamName = searchParams.get('home') || 'Hemmalag';
  const awayTeamName = searchParams.get('away') || 'Bortalag';

  const { shotEvents, addShot, undoLastShot, clearShots, getShotCounts } = useShotEvents();
  const config = getSportConfig(sport);

  const handleTapGoal = useCallback((x: number, y: number) => {
    addShot(selectedTeam, currentPeriod, selectedOutcome, x, y);
  }, [addShot, selectedTeam, currentPeriod, selectedOutcome]);

  const homeCounts = getShotCounts('home');
  const awayCounts = getShotCounts('away');

  const teamShots = shotEvents.filter(s => s.team === selectedTeam);
  const currentCounts = selectedTeam === 'home' ? homeCounts : awayCounts;

  return (
    <div className="flex flex-col min-h-screen min-h-[100dvh] p-3 sm:p-4 gap-2.5">
      {/* Header */}
      <header className="flex items-center gap-2 py-1">
        <button onClick={() => navigate('/')} className="p-2.5 -ml-2 tap-scale rounded-xl hover:bg-secondary active:bg-secondary/80 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-muted-foreground tracking-wide uppercase flex-1">
          Skottkarta
        </h1>
        <button
          onClick={undoLastShot}
          disabled={shotEvents.length === 0}
          className="p-2.5 tap-scale rounded-xl hover:bg-secondary disabled:opacity-30 transition-all"
          aria-label="Ångra"
        >
          <Undo2 className="w-5 h-5 text-amber-400" />
        </button>
        <button
          onClick={clearShots}
          disabled={shotEvents.length === 0}
          className="p-2.5 tap-scale rounded-xl hover:bg-secondary disabled:opacity-30 transition-all"
          aria-label="Rensa alla"
        >
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
        </button>
      </header>

      {/* Team selector - large, obvious toggle */}
      <div className="grid grid-cols-2 gap-2">
        {(['home', 'away'] as const).map(t => {
          const name = t === 'home' ? homeTeamName : awayTeamName;
          const counts = t === 'home' ? homeCounts : awayCounts;
          const isSelected = selectedTeam === t;
          return (
            <button
              key={t}
              onClick={() => setSelectedTeam(t)}
              className={`py-3 px-3 rounded-2xl font-bold text-sm transition-all tap-scale border-2 ${
                isSelected
                  ? t === 'home'
                    ? 'border-home bg-home/20 text-home shadow-lg shadow-home/20'
                    : 'border-away bg-away/20 text-away shadow-lg shadow-away/20'
                  : 'border-transparent bg-secondary text-muted-foreground'
              }`}
            >
              <div className="truncate">{name}</div>
              <div className="text-xs font-normal opacity-70 mt-0.5">{counts.total} skott</div>
            </button>
          );
        })}
      </div>

      {/* Period tabs - compact */}
      <div className="flex gap-1">
        {Array.from({ length: config.periodCount }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPeriod(i)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentPeriod === i ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {config.periodName} {i + 1}
          </button>
        ))}
      </div>

      {/* Instruction banner */}
      <div className="text-center text-xs text-muted-foreground/70 py-0.5">
        Välj typ nedan, tryck sedan på målet
      </div>

      {/* Shot outcome selector */}
      <ShotOutcomeSelector selected={selectedOutcome} onChange={setSelectedOutcome} />

      {/* Goal visualization - takes remaining space */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <GoalView
          sport={sport}
          shots={teamShots}
          onTapGoal={handleTapGoal}
          className="max-w-lg w-full"
        />
      </div>

      {/* Shot summary - compact stats bar */}
      <div className="grid grid-cols-4 gap-1.5 text-center">
        {(['save', 'goal', 'on_target', 'off_target'] as ShotOutcome[]).map(outcome => {
          const count = outcome === 'save' ? currentCounts.saves
            : outcome === 'goal' ? currentCounts.goals
            : outcome === 'on_target' ? currentCounts.onTarget
            : currentCounts.offTarget;
          const cfg = OUTCOME_CONFIG[outcome];
          return (
            <div key={outcome} className="bg-secondary rounded-xl py-1.5 px-1">
              <div className="text-base font-bold" style={{ color: cfg.color }}>{count}</div>
              <div className="text-[9px] text-muted-foreground leading-tight">{cfg.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
