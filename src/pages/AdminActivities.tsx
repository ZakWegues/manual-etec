import { useState } from 'react';
import { useSubjects } from '@/hooks/useSubjects';
import { useActivities, useCreateActivity, useUpdateActivity, useDeleteActivity } from '@/hooks/useActivities';
import { useBulkUpdateActivityVideos } from '@/hooks/useActivityVideos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Edit2, GraduationCap, Loader2, Plus, Trash2, Youtube } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Activity } from '@/types/database';
import { ActivityVideoManager } from '@/components/admin/ActivityVideoManager';

export default function AdminActivities() {
  const { data: subjects = [] } = useSubjects();
  const { data: activities = [], isLoading } = useActivities();
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();
  const bulkUpdateVideos = useBulkUpdateActivityVideos();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Form state
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [videos, setVideos] = useState<Array<{ youtube_url: string; title: string }>>([]);

  const resetForm = () => {
    setSubjectId('');
    setTitle('');
    setDescription('');
    setDueDate('');
    setVideos([]);
  };

  const openEditDialog = (activity: Activity) => {
    setEditingActivity(activity);
    setSubjectId(activity.subject_id);
    setTitle(activity.title);
    setDescription(activity.description || '');
    setDueDate(activity.due_date);
    setVideos(
      activity.videos?.map(v => ({ youtube_url: v.youtube_url, title: v.title || '' })) || []
    );
  };

  const handleCreate = () => {
    if (!title.trim() || !subjectId || !dueDate) return;
    
    const validVideos = videos.filter(v => v.youtube_url.trim());
    
    createActivity.mutate({
      subject_id: subjectId,
      title,
      description: description || null,
      due_date: dueDate,
      youtube_url: validVideos[0]?.youtube_url || null, // Keep legacy field for compatibility
    }, {
      onSuccess: (data) => {
        // Add videos to the new activity
        if (validVideos.length > 0) {
          bulkUpdateVideos.mutate({
            activityId: data.id,
            videos: validVideos,
          });
        }
        setIsCreateOpen(false);
        resetForm();
      },
    });
  };

  const handleUpdate = () => {
    if (!editingActivity || !title.trim() || !subjectId || !dueDate) return;
    
    const validVideos = videos.filter(v => v.youtube_url.trim());
    
    updateActivity.mutate({
      id: editingActivity.id,
      subject_id: subjectId,
      title,
      description: description || null,
      due_date: dueDate,
      youtube_url: validVideos[0]?.youtube_url || null, // Keep legacy field for compatibility
    }, {
      onSuccess: () => {
        // Update videos for this activity
        bulkUpdateVideos.mutate({
          activityId: editingActivity.id,
          videos: validVideos,
        });
        setEditingActivity(null);
        resetForm();
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteActivity.mutate(id);
  };

  // Group activities by subject
  const activitiesBySubject = activities.reduce((acc, activity) => {
    const subjectName = activity.subject?.name || 'Sem Matéria';
    if (!acc[subjectName]) {
      acc[subjectName] = [];
    }
    acc[subjectName].push(activity);
    return acc;
  }, {} as Record<string, typeof activities>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const FormContent = () => (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label>Matéria *</Label>
        <Select value={subjectId} onValueChange={setSubjectId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma matéria" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Lista de exercícios 1"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição detalhada da atividade"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dueDate">Data de Entrega *</Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <ActivityVideoManager videos={videos} onChange={setVideos} />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            Gerenciar Atividades
          </h1>
          <p className="text-muted-foreground mt-1">
            Adicione, edite ou remova atividades das matérias
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button disabled={subjects.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Atividade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Atividade</DialogTitle>
            </DialogHeader>
            <FormContent />
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!title.trim() || !subjectId || !dueDate || createActivity.isPending}
              >
                {createActivity.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Atividade
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {subjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Nenhuma matéria cadastrada</p>
            <p className="text-sm text-muted-foreground/70">
              Primeiro adicione matérias antes de criar atividades
            </p>
          </CardContent>
        </Card>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Nenhuma atividade cadastrada</p>
            <p className="text-sm text-muted-foreground/70 mb-4">
              Comece adicionando a primeira atividade
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Atividade
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(activitiesBySubject).map(([subjectName, subjectActivities]) => (
            <Card key={subjectName}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: subjectActivities[0]?.subject?.color || '#3B82F6' }}
                  />
                  {subjectName}
                </CardTitle>
                <CardDescription>{subjectActivities.length} atividades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subjectActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 rounded-lg border group hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{activity.title}</span>
                          {(activity.videos?.length || activity.youtube_url) && (
                            <Badge variant="secondary" className="text-xs">
                              <Youtube className="h-3 w-3 mr-1" />
                              {activity.videos?.length || 1} vídeo(s)
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(activity.due_date), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(activity)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover atividade?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Isso removerá a atividade "{activity.title}" e todo o progresso dos alunos. Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(activity.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingActivity} onOpenChange={(open) => {
        if (!open) {
          setEditingActivity(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Atividade</DialogTitle>
          </DialogHeader>
          <FormContent />
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setEditingActivity(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!title.trim() || !subjectId || !dueDate || updateActivity.isPending}
            >
              {updateActivity.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}