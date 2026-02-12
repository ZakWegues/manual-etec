import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Grade {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  grade: number;
  max_grade: number;
  created_at: string;
  subject?: { id: string; name: string; color: string | null };
}

export function useGrades() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['grades', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('grades')
        .select('*, subject:subjects(id, name, color)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Grade[];
    },
    enabled: !!user,
  });
}

export function useCreateGrade() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (grade: { subject_id: string; title: string; grade: number; max_grade: number }) => {
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('grades')
        .insert({ ...grade, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast.success('Nota registrada!');
    },
    onError: (e) => toast.error('Erro ao registrar nota: ' + e.message),
  });
}

export function useDeleteGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('grades').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast.success('Nota removida!');
    },
    onError: (e) => toast.error('Erro ao remover nota: ' + e.message),
  });
}
