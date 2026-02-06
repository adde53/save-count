import { useState, useCallback } from 'react';
import { ShotEvent, ShotOutcome } from '@/lib/shotTypes';
import { supabase } from '@/integrations/supabase/client';

export function useShotEvents() {
  const [shotEvents, setShotEvents] = useState<ShotEvent[]>([]);

  const addShot = useCallback((
    team: 'home' | 'away',
    period: number,
    outcome: ShotOutcome,
    positionX?: number,
    positionY?: number,
  ) => {
    const event: ShotEvent = {
      id: crypto.randomUUID(),
      team,
      period,
      outcome,
      positionX,
      positionY,
      timestamp: new Date().toISOString(),
    };
    setShotEvents(prev => [...prev, event]);
    
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    return event;
  }, []);

  const undoLastShot = useCallback(() => {
    setShotEvents(prev => prev.slice(0, -1));
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }
  }, []);

  const clearShots = useCallback(() => {
    setShotEvents([]);
  }, []);

  const saveShotsToDb = useCallback(async (matchId: string, userId: string) => {
    if (shotEvents.length === 0) return;

    const rows = shotEvents.map(e => ({
      match_id: matchId,
      user_id: userId,
      team: e.team,
      period: e.period,
      outcome: e.outcome,
      position_x: e.positionX ?? null,
      position_y: e.positionY ?? null,
    }));

    const { error } = await supabase.from('shot_events').insert(rows);
    if (error) throw error;
  }, [shotEvents]);

  const loadShotsForMatch = useCallback(async (matchId: string): Promise<ShotEvent[]> => {
    const { data, error } = await supabase
      .from('shot_events')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(d => ({
      id: d.id,
      team: d.team as 'home' | 'away',
      period: d.period,
      outcome: d.outcome as ShotOutcome,
      positionX: d.position_x ?? undefined,
      positionY: d.position_y ?? undefined,
      timestamp: d.created_at,
    }));
  }, []);

  // Get counts per team
  const getShotCounts = useCallback((team: 'home' | 'away', period?: number) => {
    const filtered = shotEvents.filter(e => 
      e.team === team && (period == null || e.period === period)
    );
    return {
      saves: filtered.filter(e => e.outcome === 'save').length,
      goals: filtered.filter(e => e.outcome === 'goal').length,
      onTarget: filtered.filter(e => e.outcome === 'on_target').length,
      offTarget: filtered.filter(e => e.outcome === 'off_target').length,
      total: filtered.length,
    };
  }, [shotEvents]);

  return {
    shotEvents,
    addShot,
    undoLastShot,
    clearShots,
    saveShotsToDb,
    loadShotsForMatch,
    getShotCounts,
  };
}
