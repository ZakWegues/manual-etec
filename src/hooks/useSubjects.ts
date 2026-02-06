import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Subject } from '@/types/database';
import { toast } from 'sonner';

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Subject[];
    },
  });
}

export function useSubject(id: string | undefined) {
  return useQuery({
    queryKey: ['subjects', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Subject | null;
    },
    enabled: !!id,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subject: Omit<Subject, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('subjects')
        .insert(subject)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Matéria criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar matéria: ' + error.message);
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Subject> & { id: string }) => {
      const { data, error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Matéria atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar matéria: ' + error.message);
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      toast.success('Matéria removida com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover matéria: ' + error.message);
    },
  });
}