import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Schedule } from '@/types/database';
import { toast } from 'sonner';

export function useSchedule() {
  return useQuery({
    queryKey: ['schedule'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedule')
        .select(`
          *,
          subject:subjects(*)
        `)
        .order('day_of_week')
        .order('period');

      if (error) throw error;
      return data as Schedule[];
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, subject_id, custom_text }: { id: string; subject_id: string | null; custom_text: string | null }) => {
      const { data, error } = await supabase
        .from('schedule')
        .update({ subject_id, custom_text })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      toast.success('Cronograma atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar cronograma: ' + error.message);
    },
  });
}