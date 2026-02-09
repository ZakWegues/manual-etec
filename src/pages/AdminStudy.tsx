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
import { Trash2, Plus, Pencil, GripVertical, Youtube, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import type { StudyVideo } from '@/types/database';

interface VideoFormItem {
  id?: string;
  title: string;
  youtube_url: string;
  description: string;
}

export default function AdminStudy() {
  const { data: subjects = [] } = useSubjects();
  const { videos, isLoading } = useStudyVideos();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [videoItems, setVideoItems] = useState<VideoFormItem[]>([]);
  const [filterSubject, setFilterSubject] = useState('all');

  const openSubjectDialog = (subjectId: string) => {
    const subjectVideos = videos.filter((v) => v.subject_id === subjectId);
    setSelectedSubject(subjectId);
    setVideoItems(
      subjectVideos.length > 0
        ? subjectVideos.map((v) => ({ id: v.id, title: v.title, youtube_url: v.youtube_url, description: v.description || '' }))
        : [{ title: '', youtube_url: '', description: '' }]
    );
    setDialogOpen(true);
  };

  const addVideoItem = () => {
    setVideoItems([...videoItems, { title: '', youtube_url: '', description: '' }]);
  };

  const removeVideoItem = (index: number) => {
    setVideoItems(videoItems.filter((_, i) => i !== index));
  };

  const updateVideoItem = (index: number, field: keyof VideoFormItem, value: string) => {
    setVideoItems(videoItems.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const moveVideo = (from: number, to: number) => {
    if (to < 0 || to >= videoItems.length) return;
    const updated = [...videoItems];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setVideoItems(updated);
  };

  const handleSave = async () => {
    const valid = videoItems.filter((v) => v.title && v.youtube_url);
    if (valid.length === 0) {
      toast({ title: 'Adicione pelo menos um vídeo com título e URL', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      // Delete existing videos for this subject
      const existingIds = videos.filter((v) => v.subject_id === selectedSubject).map((v) => v.id);
      if (existingIds.length > 0) {
        const { error: delError } = await supabase.from('study_videos').delete().in('id', existingIds);
        if (delError) throw delError;
      }

      // Insert all videos with position
      const inserts = valid.map((v, i) => ({
        subject_id: selectedSubject,
        title: v.title,
        youtube_url: v.youtube_url,
        description: v.description || null,
        position: i,
      }));

      const { error: insError } = await supabase.from('study_videos').insert(inserts);
      if (insError) throw insError;

      queryClient.invalidateQueries({ queryKey: ['study-videos'] });
      toast({ title: 'Vídeos salvos com sucesso!' });
      setDialogOpen(false);
    } catch {
      toast({ title: 'Erro ao salvar vídeos', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const getVideoCount = (subjectId: string) => videos.filter((v) => v.subject_id === subjectId).length;

  const filtered = filterSubject === 'all' ? videos : videos.filter((v) => v.subject_id === filterSubject);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gerenciar Estudo</h1>

      {/* Subject cards grid */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Matérias</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const count = getVideoCount(subject.id);
            return (
              <Card
                key={subject.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openSubjectDialog(subject.id)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: subject.color }} />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{subject.name}</p>
                      <p className="text-xs text-muted-foreground">{count} {count === 1 ? 'vídeo' : 'vídeos'}</p>
                    </div>
                  </div>
                  <Pencil className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* All videos list */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Todos os vídeos</h2>
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
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openSubjectDialog(video.subject_id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Multi-video dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Vídeos — {subjects.find((s) => s.id === selectedSubject)?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {videoItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
                Nenhum vídeo. Clique em "Adicionar Vídeo" para começar.
              </p>
            ) : (
              videoItems.map((video, index) => (
                <div key={index} className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
                  <div className="flex flex-col gap-1 pt-2">
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveVideo(index, index - 1)} disabled={index === 0}>
                      <GripVertical className="h-4 w-4 rotate-180" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveVideo(index, index + 1)} disabled={index === videoItems.length - 1}>
                      <GripVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input placeholder="Título do vídeo *" value={video.title} onChange={(e) => updateVideoItem(index, 'title', e.target.value)} />
                    <Input placeholder="https://youtube.com/watch?v=..." value={video.youtube_url} onChange={(e) => updateVideoItem(index, 'youtube_url', e.target.value)} />
                    <Textarea placeholder="Descrição (opcional)" value={video.description} onChange={(e) => updateVideoItem(index, 'description', e.target.value)} className="min-h-[60px]" />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeVideoItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t sticky bottom-0 bg-background">
            <Button type="button" variant="outline" size="sm" onClick={addVideoItem}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar Vídeo
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
