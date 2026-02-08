import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ActivityVideo } from '@/types/database';
import { toast } from 'sonner';

export function useCreateActivityVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (video: Omit<ActivityVideo, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('activity_videos')
        .insert(video)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
    onError: (error) => {
      toast.error('Erro ao adicionar vídeo: ' + error.message);
    },
  });
}

export function useUpdateActivityVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ActivityVideo> & { id: string }) => {
      const { data, error } = await supabase
        .from('activity_videos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar vídeo: ' + error.message);
    },
  });
}

export function useDeleteActivityVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('activity_videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
    onError: (error) => {
      toast.error('Erro ao remover vídeo: ' + error.message);
    },
  });
}

export function useBulkUpdateActivityVideos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      activityId, 
      videos 
    }: { 
      activityId: string; 
      videos: Array<{ youtube_url: string; title?: string }>;
    }) => {
      // Delete existing videos for this activity
      const { error: deleteError } = await supabase
        .from('activity_videos')
        .delete()
        .eq('activity_id', activityId);

      if (deleteError) throw deleteError;

      // Insert new videos if any
      if (videos.length > 0) {
        const videosToInsert = videos.map((video, index) => ({
          activity_id: activityId,
          youtube_url: video.youtube_url,
          title: video.title || null,
          position: index,
        }));

        const { error: insertError } = await supabase
          .from('activity_videos')
          .insert(videosToInsert);

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar vídeos: ' + error.message);
    },
  });
}
