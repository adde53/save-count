import { useState, useEffect, useCallback } from 'react';

interface CounterState {
  home: number;
  away: number;
}

interface HistoryEntry {
  team: 'home' | 'away';
  action: 'add';
}

const STORAGE_KEY = 'raddningsraknare';

export default function SaveCounter() {
  const [counts, setCounts] = useState<CounterState>({ home: 0, away: 0 });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [animatingTeam, setAnimatingTeam] = useState<'home' | 'away' | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCounts(parsed.counts || { home: 0, away: 0 });
        setHistory(parsed.history || []);
      } catch {
        // Invalid data, use defaults
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ counts, history }));
  }, [counts, history]);

  const addSave = useCallback((team: 'home' | 'away') => {
    setCounts(prev => ({ ...prev, [team]: prev[team] + 1 }));
    setHistory(prev => [...prev, { team, action: 'add' }]);
    setAnimatingTeam(team);
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    setTimeout(() => setAnimatingTeam(null), 200);
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    
    const lastEntry = history[history.length - 1];
    setCounts(prev => ({
      ...prev,
      [lastEntry.team]: Math.max(0, prev[lastEntry.team] - 1)
    }));
    setHistory(prev => prev.slice(0, -1));
    
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }
  }, [history]);

  const reset = useCallback(() => {
    setCounts({ home: 0, away: 0 });
    setHistory([]);
    
    if (navigator.vibrate) {
      navigator.vibrate([20, 30, 20]);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen min-h-[100dvh] p-4 gap-4">
      {/* Header */}
      <header className="text-center py-2">
        <h1 className="text-lg font-semibold text-muted-foreground tracking-wide uppercase">
          Räddningar
        </h1>
      </header>

      {/* Counters */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Home Team */}
        <button
          onClick={() => addSave('home')}
          className="flex-1 rounded-2xl bg-card flex flex-col items-center justify-center gap-2 tap-scale btn-glow-home border-2 border-home/30 active:border-home/60 transition-all"
          aria-label="Lägg till räddning för hemmalaget"
        >
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
            Hemmalag
          </span>
          <span 
            className={`text-8xl sm:text-9xl font-bold text-home counter-number ${
              animatingTeam === 'home' ? 'animate-count' : ''
            }`}
          >
            {counts.home}
          </span>
          <span className="text-4xl text-home/60">➕</span>
        </button>

        {/* Away Team */}
        <button
          onClick={() => addSave('away')}
          className="flex-1 rounded-2xl bg-card flex flex-col items-center justify-center gap-2 tap-scale btn-glow-away border-2 border-away/30 active:border-away/60 transition-all"
          aria-label="Lägg till räddning för bortalaget"
        >
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
            Bortalag
          </span>
          <span 
            className={`text-8xl sm:text-9xl font-bold text-away counter-number ${
              animatingTeam === 'away' ? 'animate-count' : ''
            }`}
          >
            {counts.away}
          </span>
          <span className="text-4xl text-away/60">➕</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex gap-3 pb-safe">
        <button
          onClick={undo}
          disabled={history.length === 0}
          className="flex-1 py-4 rounded-xl bg-secondary text-undo font-semibold text-lg tap-scale disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          aria-label="Ångra senaste"
        >
          ↩ Ångra
        </button>
        <button
          onClick={reset}
          disabled={counts.home === 0 && counts.away === 0}
          className="flex-1 py-4 rounded-xl bg-secondary text-reset font-semibold text-lg tap-scale disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          aria-label="Nollställ match"
        >
          ⟳ Nollställ
        </button>
      </div>
    </div>
  );
}
