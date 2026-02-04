import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MatchState, SavedMatch, createEmptyMatch, HistoryEntry, PeriodCounts, getTotals } from '@/lib/matchTypes';
import { SportType, getSportConfig } from '@/lib/sportConfig';
import { Json } from '@/integrations/supabase/types';

const STORAGE_KEY = 'raddningsraknare_v2';

export function useMatch() {
  const { user } = useAuth();
  const [match, setMatch] = useState<MatchState>(() => createEmptyMatch('innebandy', 3));
  const [savedMatches, setSavedMatches] = useState<SavedMatch[]>([]);
  const [animatingTeam, setAnimatingTeam] = useState<'home' | 'away' | null>(null);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Load current match from localStorage on mount
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
  }, []);

  // Load saved matches from database when user logs in
  useEffect(() => {
    if (user) {
      loadSavedMatches();
    } else {
      // Load from localStorage if not logged in
      const localMatches = localStorage.getItem('raddningsraknare_saved');
      if (localMatches) {
        try {
          setSavedMatches(JSON.parse(localMatches));
        } catch {
          // Invalid data
        }
      }
    }
  }, [user]);

  const loadSavedMatches = async () => {
    if (!user) return;
    
    setLoadingMatches(true);
    try {
      const { data, error } = await supabase
        .from('saved_matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const matches: SavedMatch[] = (data || []).map((m) => ({
        id: m.id,
        sport: m.sport as SportType,
        currentPeriod: 0,
        periods: m.periods as unknown as PeriodCounts[],
        history: [],
        homeTeamName: m.home_team_name,
        awayTeamName: m.away_team_name,
        createdAt: m.match_date,
        savedAt: m.created_at,
      }));

      setSavedMatches(matches);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoadingMatches(false);
    }
  };

  // Save current match to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
  }, [match]);

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

  const saveMatch = useCallback(async () => {
    const totals = getTotals(match.periods);
    
    if (user) {
      // Save to database
      try {
        const { error } = await supabase.from('saved_matches').insert({
          user_id: user.id,
          sport: match.sport,
          home_team_name: match.homeTeamName,
          away_team_name: match.awayTeamName,
          periods: match.periods as unknown as Json,
          total_home_saves: totals.home,
          total_away_saves: totals.away,
          match_date: match.createdAt,
        });

        if (error) throw error;
        
        await loadSavedMatches();
      } catch (error) {
        console.error('Failed to save match:', error);
        throw error;
      }
    } else {
      // Save to localStorage
      const newSavedMatch: SavedMatch = {
        ...match,
        id: Date.now().toString(),
        savedAt: new Date().toISOString(),
      };
      
      const updated = [newSavedMatch, ...savedMatches];
      setSavedMatches(updated);
      localStorage.setItem('raddningsraknare_saved', JSON.stringify(updated));
    }

    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  }, [match, user, savedMatches]);

  const loadMatch = useCallback((savedMatch: SavedMatch) => {
    const { id, savedAt, ...matchState } = savedMatch;
    setMatch(matchState);
  }, []);

  const deleteMatch = useCallback(async (id: string) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('saved_matches')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        setSavedMatches(prev => prev.filter(m => m.id !== id));
      } catch (error) {
        console.error('Failed to delete match:', error);
      }
    } else {
      const updated = savedMatches.filter(m => m.id !== id);
      setSavedMatches(updated);
      localStorage.setItem('raddningsraknare_saved', JSON.stringify(updated));
    }
  }, [user, savedMatches]);

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
    loadingMatches,
    isLoggedIn: !!user,
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
