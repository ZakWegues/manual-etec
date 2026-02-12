import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Comment {
  id: string;
  activity_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useComments(activityId: string | undefined) {
  return useQuery({
    queryKey: ['comments', activityId],
    queryFn: async () => {
      if (!activityId) return [];

      const { data, error } = await supabase
        .from('activity_comments')
        .select('*')
        .eq('activity_id', activityId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles for comment authors
      const userIds = [...new Set((data || []).map(c => c.user_id))];
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return (data || []).map(comment => ({
        ...comment,
        profile: profileMap.get(comment.user_id) || null,
      })) as Comment[];
    },
    enabled: !!activityId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ activityId, content }: { activityId: string; content: string }) => {
      if (!user) throw new Error('Não autenticado');

      const { data, error } = await supabase
        .from('activity_comments')
        .insert({ activity_id: activityId, user_id: user.id, content })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { activityId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', activityId] });
    },
    onError: (error) => {
      toast.error('Erro ao enviar comentário: ' + error.message);
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, activityId }: { commentId: string; activityId: string }) => {
      const { error } = await supabase
        .from('activity_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      return activityId;
    },
    onSuccess: (activityId) => {
      queryClient.invalidateQueries({ queryKey: ['comments', activityId] });
      toast.success('Comentário removido');
    },
    onError: (error) => {
      toast.error('Erro ao remover comentário: ' + error.message);
    },
  });
}
