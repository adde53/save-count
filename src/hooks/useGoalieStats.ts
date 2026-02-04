import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PeriodCounts } from '@/lib/matchTypes';

interface GoalieStats {
  id: string;
  name: string;
  team_name: string | null;
  total_saves: number;
  matches_played: number;
  avg_saves_per_match: number;
  matches: {
    id: string;
    date: string;
    sport: string;
    saves: number;
    opponent: string;
    is_home: boolean;
  }[];
}

export function useGoalieStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<GoalieStats[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadStats();
    } else {
      setStats([]);
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get all goalies with their teams
      const { data: goalies, error: goaliesError } = await supabase
        .from('goalies')
        .select('*, teams(name)')
        .order('name');

      if (goaliesError) throw goaliesError;

      // Get all saved matches
      const { data: matches, error: matchesError } = await supabase
        .from('saved_matches')
        .select('*')
        .order('match_date', { ascending: false });

      if (matchesError) throw matchesError;

      // Calculate stats for each goalie
      const goalieStats: GoalieStats[] = (goalies || []).map((goalie: any) => {
        const goalieMatches = (matches || []).filter(
          (m: any) => m.home_goalie_id === goalie.id || m.away_goalie_id === goalie.id
        );

        const matchDetails = goalieMatches.map((m: any) => {
          const isHome = m.home_goalie_id === goalie.id;
          const periods = m.periods as unknown as PeriodCounts[];
          const saves = periods.reduce(
            (sum, p) => sum + (isHome ? p.home : p.away),
            0
          );

          return {
            id: m.id,
            date: m.match_date,
            sport: m.sport,
            saves,
            opponent: isHome ? m.away_team_name : m.home_team_name,
            is_home: isHome,
          };
        });

        const totalSaves = matchDetails.reduce((sum, m) => sum + m.saves, 0);

        return {
          id: goalie.id,
          name: goalie.name,
          team_name: goalie.teams?.name || null,
          total_saves: totalSaves,
          matches_played: matchDetails.length,
          avg_saves_per_match: matchDetails.length > 0 
            ? Math.round((totalSaves / matchDetails.length) * 10) / 10 
            : 0,
          matches: matchDetails,
        };
      });

      // Sort by total saves
      goalieStats.sort((a, b) => b.total_saves - a.total_saves);

      setStats(goalieStats);
    } catch (error) {
      console.error('Failed to load goalie stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refresh: loadStats };
}
