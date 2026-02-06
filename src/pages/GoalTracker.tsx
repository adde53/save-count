import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Undo2 } from 'lucide-react';
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
  const [homeTeamName, setHomeTeamName] = useState(searchParams.get('home') || 'Hemmalag');
  const [awayTeamName, setAwayTeamName] = useState(searchParams.get('away') || 'Bortalag');

  const { shotEvents, addShot, undoLastShot, getShotCounts } = useShotEvents();
  const config = getSportConfig(sport);

  const handleTapGoal = useCallback((x: number, y: number) => {
    addShot(selectedTeam, currentPeriod, selectedOutcome, x, y);
  }, [addShot, selectedTeam, currentPeriod, selectedOutcome]);

  const homeCounts = getShotCounts('home');
  const awayCounts = getShotCounts('away');

  const teamShots = shotEvents.filter(s => s.team === selectedTeam);

  return (
    <div className="flex flex-col min-h-screen min-h-[100dvh] p-4 gap-3">
      {/* Header */}
      <header className="flex items-center gap-3 py-1">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 tap-scale rounded-lg hover:bg-secondary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-muted-foreground tracking-wide uppercase flex-1">
          Skottkarta
        </h1>
      </header>

      {/* Sport selector */}
      <div className="flex gap-2">
        {SPORTS.map(s => (
          <button
            key={s.id}
            onClick={() => setSport(s.id)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all tap-scale ${
              sport === s.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Team selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedTeam('home')}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all tap-scale border-2 ${
            selectedTeam === 'home'
              ? 'border-home bg-home/20 text-home'
              : 'border-transparent bg-secondary text-muted-foreground'
          }`}
        >
          {homeTeamName} ({homeCounts.total})
        </button>
        <button
          onClick={() => setSelectedTeam('away')}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all tap-scale border-2 ${
            selectedTeam === 'away'
              ? 'border-away bg-away/20 text-away'
              : 'border-transparent bg-secondary text-muted-foreground'
          }`}
        >
          {awayTeamName} ({awayCounts.total})
        </button>
      </div>

      {/* Period tabs */}
      <div className="flex gap-1.5">
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

      {/* Shot outcome selector */}
      <ShotOutcomeSelector selected={selectedOutcome} onChange={setSelectedOutcome} />

      {/* Goal visualization */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <GoalView
          sport={sport}
          shots={teamShots}
          onTapGoal={handleTapGoal}
          className="max-w-lg"
        />
      </div>

      {/* Shot summary */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {(['save', 'goal', 'on_target', 'off_target'] as ShotOutcome[]).map(outcome => {
          const counts = selectedTeam === 'home' ? homeCounts : awayCounts;
          const count = outcome === 'save' ? counts.saves
            : outcome === 'goal' ? counts.goals
            : outcome === 'on_target' ? counts.onTarget
            : counts.offTarget;
          const cfg = OUTCOME_CONFIG[outcome];
          return (
            <div key={outcome} className="bg-secondary rounded-xl py-2 px-1">
              <div className="text-lg font-bold" style={{ color: cfg.color }}>{count}</div>
              <div className="text-[10px] text-muted-foreground">{cfg.label}</div>
            </div>
          );
        })}
      </div>

      {/* Undo */}
      <div className="flex gap-3 pb-safe">
        <button
          onClick={undoLastShot}
          disabled={shotEvents.length === 0}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-undo font-semibold text-lg tap-scale disabled:opacity-30 transition-opacity"
        >
          <Undo2 className="w-5 h-5" />
          Ångra
        </button>
      </div>
    </div>
  );
}
