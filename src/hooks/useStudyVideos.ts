import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { StudyVideo } from '@/types/database';

export function useStudyVideos(subjectId?: string) {
  const queryClient = useQueryClient();

  const videosQuery = useQuery({
    queryKey: ['study-videos', subjectId],
    queryFn: async () => {
      let query = supabase
        .from('study_videos')
        .select('*')
        .order('position', { ascending: true });

      if (subjectId) {
        query = query.eq('subject_id', subjectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as StudyVideo[];
    },
  });

  const addVideo = useMutation({
    mutationFn: async (video: { title: string; youtube_url: string; subject_id: string; description?: string }) => {
      const { data, error } = await supabase
        .from('study_videos')
        .insert(video)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-videos'] });
    },
  });

  const updateVideo = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; title?: string; youtube_url?: string; subject_id?: string; description?: string | null }) => {
      const { data, error } = await supabase
        .from('study_videos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-videos'] });
    },
  });

  const deleteVideo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('study_videos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-videos'] });
    },
  });

  return { videos: videosQuery.data ?? [], isLoading: videosQuery.isLoading, addVideo, updateVideo, deleteVideo };
}
