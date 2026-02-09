import { useState } from 'react';
import { useSubjects } from '@/hooks/useSubjects';
import { useStudyVideos } from '@/hooks/useStudyVideos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2, Plus, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { StudyVideo } from '@/types/database';

export default function AdminStudy() {
  const { data: subjects = [] } = useSubjects();
  const { videos, isLoading, addVideo, updateVideo, deleteVideo } = useStudyVideos();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [description, setDescription] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');

  const [editingVideo, setEditingVideo] = useState<StudyVideo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editYoutubeUrl, setEditYoutubeUrl] = useState('');
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleAdd = async () => {
    if (!title || !youtubeUrl || !subjectId) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }
    try {
      await addVideo.mutateAsync({ title, youtube_url: youtubeUrl, subject_id: subjectId, description: description || undefined });
      toast({ title: 'Vídeo adicionado com sucesso!' });
      setTitle('');
      setYoutubeUrl('');
      setDescription('');
    } catch {
      toast({ title: 'Erro ao adicionar vídeo', variant: 'destructive' });
    }
  };

  const openEdit = (video: StudyVideo) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditYoutubeUrl(video.youtube_url);
    setEditSubjectId(video.subject_id);
    setEditDescription(video.description || '');
  };

  const handleUpdate = async () => {
    if (!editingVideo || !editTitle || !editYoutubeUrl || !editSubjectId) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }
    try {
      await updateVideo.mutateAsync({
        id: editingVideo.id,
        title: editTitle,
        youtube_url: editYoutubeUrl,
        subject_id: editSubjectId,
        description: editDescription || null,
      });
      toast({ title: 'Vídeo atualizado com sucesso!' });
      setEditingVideo(null);
    } catch {
      toast({ title: 'Erro ao atualizar vídeo', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVideo.mutateAsync(id);
      toast({ title: 'Vídeo removido!' });
    } catch {
      toast({ title: 'Erro ao remover vídeo', variant: 'destructive' });
    }
  };

  const filtered = filterSubject === 'all' ? videos : videos.filter((v) => v.subject_id === filterSubject);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gerenciar Estudo</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Adicionar Vídeo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do vídeo" />
            </div>
            <div className="space-y-2">
              <Label>Matéria *</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>URL do YouTube *</Label>
            <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição opcional" />
          </div>
          <Button onClick={handleAdd} disabled={addVideo.isPending}>
            {addVideo.isPending ? 'Adicionando...' : 'Adicionar Vídeo'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Vídeos cadastrados</h2>
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as matérias</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground">Nenhum vídeo encontrado.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((video) => {
              const subject = subjects.find((s) => s.id === video.subject_id);
              return (
                <div key={video.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{subject?.name}</p>
                    {video.description && <p className="text-xs text-muted-foreground truncate">{video.description}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(video)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(video.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!editingVideo} onOpenChange={(open) => !open && setEditingVideo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Vídeo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Matéria *</Label>
              <Select value={editSubjectId} onValueChange={setEditSubjectId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>URL do YouTube *</Label>
              <Input value={editYoutubeUrl} onChange={(e) => setEditYoutubeUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVideo(null)}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={updateVideo.isPending}>
              {updateVideo.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
