import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RankingEntry {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_score: number;
  activities_completed: number;
  on_time_count: number;
  avg_grade: number;
  rank_position: number;
}

export function useRanking(subjectId?: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ranking', subjectId || 'global'],
    queryFn: async () => {
      const params: Record<string, unknown> = {};
      if (subjectId) params.p_subject_id = subjectId;

      const { data, error } = await supabase.rpc('get_user_rankings', params as any);
      if (error) throw error;
      return (data || []) as RankingEntry[];
    },
    enabled: !!user,
  });
}
