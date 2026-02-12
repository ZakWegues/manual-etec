import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SharedMaterial {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  content: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useSharedMaterials(subjectId: string | undefined) {
  return useQuery({
    queryKey: ['shared-materials', subjectId],
    queryFn: async () => {
      if (!subjectId) return [];

      const { data, error } = await supabase
        .from('shared_materials')
        .select('*')
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = [...new Set((data || []).map(m => m.user_id))];
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return (data || []).map(material => ({
        ...material,
        profile: profileMap.get(material.user_id) || null,
      })) as SharedMaterial[];
    },
    enabled: !!subjectId,
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ subjectId, title, content }: { subjectId: string; title: string; content: string }) => {
      if (!user) throw new Error('Não autenticado');

      const { data, error } = await supabase
        .from('shared_materials')
        .insert({ subject_id: subjectId, user_id: user.id, title, content })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { subjectId }) => {
      queryClient.invalidateQueries({ queryKey: ['shared-materials', subjectId] });
      toast.success('Material compartilhado!');
    },
    onError: (error) => {
      toast.error('Erro ao compartilhar material: ' + error.message);
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ materialId, subjectId }: { materialId: string; subjectId: string }) => {
      const { error } = await supabase
        .from('shared_materials')
        .delete()
        .eq('id', materialId);

      if (error) throw error;
      return subjectId;
    },
    onSuccess: (subjectId) => {
      queryClient.invalidateQueries({ queryKey: ['shared-materials', subjectId] });
      toast.success('Material removido');
    },
    onError: (error) => {
      toast.error('Erro ao remover material: ' + error.message);
    },
  });
}
