import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface Team {
  id: string;
  name: string;
  created_at: string;
}

export interface Goalie {
  id: string;
  name: string;
  team_id: string | null;
  team_name?: string;
  created_at: string;
}

export function useTeamsAndGoalies() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [goalies, setGoalies] = useState<Goalie[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) {
      setTeams([]);
      setGoalies([]);
      return;
    }

    setLoading(true);
    try {
      const [teamsRes, goaliesRes] = await Promise.all([
        supabase.from('teams').select('*').order('name'),
        supabase.from('goalies').select('*, teams(name)').order('name'),
      ]);

      if (teamsRes.error) throw teamsRes.error;
      if (goaliesRes.error) throw goaliesRes.error;

      setTeams(teamsRes.data || []);
      setGoalies(
        (goaliesRes.data || []).map((g: any) => ({
          id: g.id,
          name: g.name,
          team_id: g.team_id,
          team_name: g.teams?.name,
          created_at: g.created_at,
        }))
      );
    } catch (error) {
      console.error('Failed to load teams/goalies:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addTeam = async (name: string) => {
    if (!user) return;
    
    const { error } = await supabase.from('teams').insert({
      user_id: user.id,
      name,
    });
    
    if (error) throw error;
    await loadData();
  };

  const updateTeam = async (id: string, name: string) => {
    const { error } = await supabase
      .from('teams')
      .update({ name })
      .eq('id', id);
    
    if (error) throw error;
    await loadData();
  };

  const deleteTeam = async (id: string) => {
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) throw error;
    await loadData();
  };

  const addGoalie = async (name: string, teamId: string | null) => {
    if (!user) return;
    
    const { error } = await supabase.from('goalies').insert({
      user_id: user.id,
      name,
      team_id: teamId,
    });
    
    if (error) throw error;
    await loadData();
  };

  const updateGoalie = async (id: string, name: string, teamId: string | null) => {
    const { error } = await supabase
      .from('goalies')
      .update({ name, team_id: teamId })
      .eq('id', id);
    
    if (error) throw error;
    await loadData();
  };

  const deleteGoalie = async (id: string) => {
    const { error } = await supabase.from('goalies').delete().eq('id', id);
    if (error) throw error;
    await loadData();
  };

  return {
    teams,
    goalies,
    loading,
    addTeam,
    updateTeam,
    deleteTeam,
    addGoalie,
    updateGoalie,
    deleteGoalie,
    refresh: loadData,
  };
}
