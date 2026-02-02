import { useState, useEffect, useCallback } from 'react';
import { MatchState, SavedMatch, createEmptyMatch, HistoryEntry } from '@/lib/matchTypes';
import { SportType, getSportConfig } from '@/lib/sportConfig';

const STORAGE_KEY = 'raddningsraknare_v2';
const SAVED_MATCHES_KEY = 'raddningsraknare_saved';

export function useMatch() {
  const [match, setMatch] = useState<MatchState>(() => createEmptyMatch('innebandy', 3));
  const [savedMatches, setSavedMatches] = useState<SavedMatch[]>([]);
  const [animatingTeam, setAnimatingTeam] = useState<'home' | 'away' | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCurrent = localStorage.getItem(STORAGE_KEY);
    if (savedCurrent) {
      try {
        const parsed = JSON.parse(savedCurrent);
        setMatch(parsed);
      } catch {
        // Invalid data, use defaults
      }
    }

    const savedList = localStorage.getItem(SAVED_MATCHES_KEY);
    if (savedList) {
      try {
        setSavedMatches(JSON.parse(savedList));
      } catch {
        // Invalid data
      }
    }
  }, []);

  // Save current match to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
  }, [match]);

  // Save matches list to localStorage
  useEffect(() => {
    localStorage.setItem(SAVED_MATCHES_KEY, JSON.stringify(savedMatches));
  }, [savedMatches]);

  const changeSport = useCallback((sport: SportType) => {
    const config = getSportConfig(sport);
    setMatch(createEmptyMatch(sport, config.periodCount));
  }, []);

  const setCurrentPeriod = useCallback((period: number) => {
    setMatch(prev => ({ ...prev, currentPeriod: period }));
  }, []);

  const addSave = useCallback((team: 'home' | 'away') => {
    setMatch(prev => {
      const newPeriods = [...prev.periods];
      newPeriods[prev.currentPeriod] = {
        ...newPeriods[prev.currentPeriod],
        [team]: newPeriods[prev.currentPeriod][team] + 1,
      };

      const newEntry: HistoryEntry = {
        team,
        action: 'add',
        period: prev.currentPeriod,
      };

      return {
        ...prev,
        periods: newPeriods,
        history: [...prev.history, newEntry],
      };
    });

    setAnimatingTeam(team);
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    setTimeout(() => setAnimatingTeam(null), 200);
  }, []);

  const undo = useCallback(() => {
    setMatch(prev => {
      if (prev.history.length === 0) return prev;

      const lastEntry = prev.history[prev.history.length - 1];
      const newPeriods = [...prev.periods];
      newPeriods[lastEntry.period] = {
        ...newPeriods[lastEntry.period],
        [lastEntry.team]: Math.max(0, newPeriods[lastEntry.period][lastEntry.team] - 1),
      };

      return {
        ...prev,
        periods: newPeriods,
        history: prev.history.slice(0, -1),
      };
    });

    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }
  }, []);

  const reset = useCallback(() => {
    const config = getSportConfig(match.sport);
    setMatch(createEmptyMatch(match.sport, config.periodCount));

    if (navigator.vibrate) {
      navigator.vibrate([20, 30, 20]);
    }
  }, [match.sport]);

  const saveMatch = useCallback(() => {
    const newSavedMatch: SavedMatch = {
      ...match,
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
    };

    setSavedMatches(prev => [newSavedMatch, ...prev]);

    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  }, [match]);

  const loadMatch = useCallback((savedMatch: SavedMatch) => {
    const { id, savedAt, ...matchState } = savedMatch;
    setMatch(matchState);
  }, []);

  const deleteMatch = useCallback((id: string) => {
    setSavedMatches(prev => prev.filter(m => m.id !== id));
  }, []);

  const getShareUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set('sport', match.sport);
    params.set('home', match.homeTeamName);
    params.set('away', match.awayTeamName);
    params.set('data', btoa(JSON.stringify(match.periods)));
    
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [match]);

  // Load from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sport = params.get('sport') as SportType | null;
    const data = params.get('data');
    
    if (sport && data) {
      try {
        const periods = JSON.parse(atob(data));
        const config = getSportConfig(sport);
        setMatch({
          sport,
          currentPeriod: 0,
          periods,
          history: [],
          homeTeamName: params.get('home') || 'Hemmalag',
          awayTeamName: params.get('away') || 'Bortalag',
          createdAt: new Date().toISOString(),
        });
        
        // Clear URL params after loading
        window.history.replaceState({}, '', window.location.pathname);
      } catch {
        // Invalid URL data
      }
    }
  }, []);

  return {
    match,
    savedMatches,
    animatingTeam,
    changeSport,
    setCurrentPeriod,
    addSave,
    undo,
    reset,
    saveMatch,
    loadMatch,
    deleteMatch,
    getShareUrl,
  };
}
