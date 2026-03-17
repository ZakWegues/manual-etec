import { useState } from 'react';
import { useSubjects } from '@/hooks/useSubjects';
import { useActivities, useCreateActivity, useUpdateActivity, useDeleteActivity } from '@/hooks/useActivities';
import { useAuth } from '@/contexts/AuthContext';
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
import { Calendar, Copy, Edit2, GraduationCap, Loader2, Plus, Trash2, Youtube, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseLocalDate } from '@/lib/utils';
import type { Activity } from '@/types/database';
import { ACTIVITY_TYPES } from '@/types/database';
import { ActivityVideoManager, type ResourceItem } from '@/components/admin/ActivityVideoManager';

export default function AdminActivities() {
  const { user } = useAuth();
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
  const [activityType, setActivityType] = useState('other');
  const [resources, setResources] = useState<ResourceItem[]>([]);

  const resetForm = () => {
    setSubjectId('');
    setTitle('');
    setDescription('');
    setDueDate('');
    setActivityType('other');
    setResources([]);
  };

  const openEditDialog = (activity: Activity) => {
    setEditingActivity(activity);
    setSubjectId(activity.subject_id);
    setTitle(activity.title);
    setDescription(activity.description || '');
    setDueDate(activity.due_date);
    setActivityType(activity.activity_type || 'other');
    setResources(
      activity.videos?.map(v => ({
        youtube_url: v.youtube_url,
        title: v.title || '',
        type: ((v as any).type || 'video') as 'video' | 'pdf',
        file_url: (v as any).file_url || '',
      })) || []
    );
  };

  const duplicateActivity = (activity: Activity) => {
    setSubjectId(activity.subject_id);
    setTitle(activity.title + ' (cópia)');
    setDescription(activity.description || '');
    setDueDate(activity.due_date);
    setActivityType(activity.activity_type || 'other');
    setResources(
      activity.videos?.map(v => ({
        youtube_url: v.youtube_url,
        title: v.title || '',
        type: ((v as any).type || 'video') as 'video' | 'pdf',
        file_url: (v as any).file_url || '',
      })) || []
    );
    setIsCreateOpen(true);
  };

  const handleCreate = () => {
    if (!title.trim() || !subjectId || !dueDate) return;
    
    const validResources = resources.filter(v => v.type === 'pdf' ? v.file_url?.trim() : v.youtube_url.trim());
    
    createActivity.mutate({
      subject_id: subjectId,
      title,
      description: description || null,
      due_date: dueDate,
      activity_type: activityType,
      youtube_url: validResources.find(v => v.type === 'video')?.youtube_url || null,
    }, {
      onSuccess: (data) => {
        if (validResources.length > 0) {
          bulkUpdateVideos.mutate({
            activityId: data.id,
            videos: validResources,
          });
        }
        setIsCreateOpen(false);
        resetForm();
      },
    });
  };

  const handleUpdate = () => {
    if (!editingActivity || !title.trim() || !subjectId || !dueDate) return;
    
    const validResources = resources.filter(v => v.type === 'pdf' ? v.file_url?.trim() : v.youtube_url.trim());
    
    updateActivity.mutate({
      id: editingActivity.id,
      subject_id: subjectId,
      title,
      description: description || null,
      due_date: dueDate,
      activity_type: activityType,
      youtube_url: validResources.find(v => v.type === 'video')?.youtube_url || null,
    }, {
      onSuccess: () => {
        bulkUpdateVideos.mutate({
          activityId: editingActivity.id,
          videos: validResources,
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

  const getResourceCount = (activity: typeof activities[0]) => {
    const videoCount = activity.videos?.filter((v: any) => !v.type || v.type === 'video').length || (activity.youtube_url ? 1 : 0);
    const pdfCount = activity.videos?.filter((v: any) => v.type === 'pdf').length || 0;
    return { videoCount, pdfCount };
  };

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
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Atividade</DialogTitle>
            </DialogHeader>
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
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                          {s.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Atividade *</Label>
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-title">Título *</Label>
                <Input id="create-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Lista de exercícios 1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">Descrição</Label>
                <Textarea id="create-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição detalhada da atividade" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-dueDate">Data de Entrega *</Label>
                <Input id="create-dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <ActivityVideoManager videos={resources} onChange={setResources} />
            </div>
            <DialogFooter className="mt-6 sticky bottom-0 bg-background pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={!title.trim() || !subjectId || !dueDate || createActivity.isPending}>
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
            <p className="text-sm text-muted-foreground/70">Primeiro adicione matérias antes de criar atividades</p>
          </CardContent>
        </Card>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Nenhuma atividade cadastrada</p>
            <p className="text-sm text-muted-foreground/70 mb-4">Comece adicionando a primeira atividade</p>
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
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: subjectActivities[0]?.subject?.color || '#3B82F6' }} />
                  {subjectName}
                </CardTitle>
                <CardDescription>{subjectActivities.length} atividades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subjectActivities.map((activity) => {
                    const { videoCount, pdfCount } = getResourceCount(activity);
                    return (
                      <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border group hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{activity.title}</span>
                            {activity.activity_type && activity.activity_type !== 'other' && (
                              <Badge variant="outline" className="text-xs">
                                {ACTIVITY_TYPES.find(t => t.value === activity.activity_type)?.label || activity.activity_type}
                              </Badge>
                            )}
                            {videoCount > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                <Youtube className="h-3 w-3 mr-1" />
                                {videoCount}
                              </Badge>
                            )}
                            {pdfCount > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                {pdfCount}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(parseLocalDate(activity.due_date), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateActivity(activity)} title="Duplicar">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(activity)}>
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
                                <AlertDialogAction onClick={() => handleDelete(activity.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    );
                  })}
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Atividade</DialogTitle>
          </DialogHeader>
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
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Atividade *</Label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título *</Label>
              <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Lista de exercícios 1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição detalhada da atividade" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">Data de Entrega *</Label>
              <Input id="edit-dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <ActivityVideoManager videos={resources} onChange={setResources} />
          </div>
          <DialogFooter className="mt-6 sticky bottom-0 bg-background pt-4 border-t">
            <Button variant="outline" onClick={() => setEditingActivity(null)}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={!title.trim() || !subjectId || !dueDate || updateActivity.isPending}>
              {updateActivity.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
