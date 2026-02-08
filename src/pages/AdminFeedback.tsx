import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Star, 
  FileText,
  Mail,
  User,
  Clock,
  Check,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Feedback {
  id: string;
  name: string;
  email: string;
  type: 'bug' | 'suggestion' | 'compliment' | 'other';
  message: string;
  is_read: boolean;
  created_at: string;
}

const feedbackTypeConfig = {
  bug: { label: 'Bug / Problema', icon: Bug, color: 'bg-destructive text-destructive-foreground' },
  suggestion: { label: 'Sugestão', icon: Lightbulb, color: 'bg-yellow-500 text-white' },
  compliment: { label: 'Elogio', icon: Star, color: 'bg-green-500 text-white' },
  other: { label: 'Outro', icon: FileText, color: 'bg-muted text-muted-foreground' },
};

export default function AdminFeedback() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ['feedbacks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Feedback[];
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async ({ id, is_read }: { id: string; is_read: boolean }) => {
      const { error } = await supabase
        .from('feedback')
        .update({ is_read })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      toast.success('Feedback excluído com sucesso');
    },
    onError: () => {
      toast.error('Erro ao excluir feedback');
    },
  });

  const filteredFeedbacks = feedbacks?.filter((feedback) => {
    if (filter === 'unread') return !feedback.is_read;
    if (filter === 'read') return feedback.is_read;
    return true;
  });

  const unreadCount = feedbacks?.filter((f) => !f.is_read).length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Feedbacks</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} não lidos</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todos
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Não lidos
          </Button>
          <Button
            variant={filter === 'read' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('read')}
          >
            Lidos
          </Button>
        </div>
      </div>

      {filteredFeedbacks?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {filter === 'all' 
                ? 'Nenhum feedback recebido ainda.'
                : filter === 'unread'
                ? 'Nenhum feedback não lido.'
                : 'Nenhum feedback lido.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredFeedbacks?.map((feedback) => {
            const config = feedbackTypeConfig[feedback.type];
            const Icon = config.icon;

            return (
              <Card 
                key={feedback.id} 
                className={`transition-all ${!feedback.is_read ? 'border-primary/50 bg-primary/5' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Badge className={config.color}>
                        <Icon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                      {!feedback.is_read && (
                        <Badge variant="outline" className="text-primary border-primary">
                          Novo
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsReadMutation.mutate({ 
                          id: feedback.id, 
                          is_read: !feedback.is_read 
                        })}
                        title={feedback.is_read ? 'Marcar como não lido' : 'Marcar como lido'}
                      >
                        {feedback.is_read ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir feedback?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O feedback será permanentemente excluído.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(feedback.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{feedback.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <a 
                        href={`mailto:${feedback.email}`} 
                        className="text-primary hover:underline"
                      >
                        {feedback.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(feedback.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  <p className="text-foreground whitespace-pre-wrap">{feedback.message}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
