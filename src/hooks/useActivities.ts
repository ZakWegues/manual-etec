import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Activity, ActivityWithProgress } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useActivities(subjectId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['activities', subjectId],
    queryFn: async () => {
      let query = supabase
        .from('activities')
        .select(`
          *,
          subject:subjects(*),
          videos:activity_videos(*)
        `)
        .order('due_date', { ascending: true });

      if (subjectId) {
        query = query.eq('subject_id', subjectId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch user's progress if logged in
      if (user) {
        const { data: progressData } = await supabase
          .from('activity_progress')
          .select('activity_id')
          .eq('user_id', user.id);

        const completedIds = new Set(progressData?.map(p => p.activity_id) || []);

        return (data as Activity[]).map(activity => ({
          ...activity,
          is_completed: completedIds.has(activity.id),
        })) as ActivityWithProgress[];
      }

      return (data as Activity[]).map(activity => ({
        ...activity,
        is_completed: false,
      })) as ActivityWithProgress[];
    },
  });
}

export function useActivity(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['activities', 'detail', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          subject:subjects(*),
          videos:activity_videos(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Check if completed
      let isCompleted = false;
      if (user) {
        const { data: progressData } = await supabase
          .from('activity_progress')
          .select('id')
          .eq('user_id', user.id)
          .eq('activity_id', id)
          .maybeSingle();

        isCompleted = !!progressData;
      }

      return {
        ...data,
        is_completed: isCompleted,
      } as ActivityWithProgress;
    },
    enabled: !!id,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activity: Omit<Activity, 'id' | 'created_at' | 'updated_at' | 'subject'>) => {
      const { data, error } = await supabase
        .from('activities')
        .insert(activity)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Atividade criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar atividade: ' + error.message);
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Activity> & { id: string }) => {
      const { data, error } = await supabase
        .from('activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Atividade atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar atividade: ' + error.message);
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Atividade removida com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover atividade: ' + error.message);
    },
  });
}

export function useToggleActivityProgress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ activityId, isCompleted }: { activityId: string; isCompleted: boolean }) => {
      if (!user) throw new Error('Usuário não autenticado');

      if (isCompleted) {
        // Remove progress
        const { error } = await supabase
          .from('activity_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('activity_id', activityId);

        if (error) throw error;
      } else {
        // Add progress
        const { error } = await supabase
          .from('activity_progress')
          .insert({
            user_id: user.id,
            activity_id: activityId,
          });

        if (error) throw error;
      }
    },
    onSuccess: (_, { isCompleted }) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success(isCompleted ? 'Atividade desmarcada' : 'Atividade concluída!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar progresso: ' + error.message);
    },
  });
}