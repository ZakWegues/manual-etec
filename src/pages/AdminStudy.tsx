import { useState } from 'react';
import { useSubjects } from '@/hooks/useSubjects';
import { useStudyVideos } from '@/hooks/useStudyVideos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Plus, Pencil, GripVertical, Youtube, BookOpen, FileText, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast as sonnerToast } from 'sonner';

interface ContentFormItem {
  id?: string;
  title: string;
  youtube_url: string;
  description: string;
  type: 'video' | 'pdf';
  file_url?: string;
}

export default function AdminStudy() {
  const { data: subjects = [] } = useSubjects();
  const { videos, isLoading } = useStudyVideos();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contentItems, setContentItems] = useState<ContentFormItem[]>([]);
  const [filterSubject, setFilterSubject] = useState('all');
  const [uploading, setUploading] = useState<number | null>(null);

  const openSubjectDialog = (subjectId: string) => {
    const subjectVideos = videos.filter((v) => v.subject_id === subjectId);
    setSelectedSubject(subjectId);
    setContentItems(
      subjectVideos.length > 0
        ? subjectVideos.map((v) => ({
            id: v.id,
            title: v.title,
            youtube_url: v.youtube_url,
            description: (v as any).description || '',
            type: ((v as any).type || 'video') as 'video' | 'pdf',
            file_url: (v as any).file_url || '',
          }))
        : [{ title: '', youtube_url: '', description: '', type: 'video' as const }]
    );
    setDialogOpen(true);
  };

  const addItem = (type: 'video' | 'pdf') => {
    setContentItems([...contentItems, { title: '', youtube_url: '', description: '', type, file_url: '' }]);
  };

  const removeItem = (index: number) => {
    setContentItems(contentItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ContentFormItem, value: string) => {
    setContentItems(contentItems.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= contentItems.length) return;
    const updated = [...contentItems];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setContentItems(updated);
  };

  const handlePdfUpload = async (index: number, file: File) => {
    if (!file || file.type !== 'application/pdf') {
      sonnerToast.error('Selecione um arquivo PDF válido');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      sonnerToast.error('O arquivo deve ter no máximo 20MB');
      return;
    }
    setUploading(index);
    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error } = await supabase.storage.from('pdfs').upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('pdfs').getPublicUrl(fileName);
      setContentItems(contentItems.map((v, i) =>
        i === index ? { ...v, file_url: urlData.publicUrl, title: v.title || file.name.replace('.pdf', '') } : v
      ));
      sonnerToast.success('PDF enviado!');
    } catch {
      sonnerToast.error('Erro ao enviar PDF');
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    const valid = contentItems.filter((v) => {
      if (v.type === 'pdf') return v.title && v.file_url;
      return v.title && v.youtube_url;
    });
    if (valid.length === 0) {
      toast({ title: 'Adicione pelo menos um conteúdo com título', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const existingIds = videos.filter((v) => v.subject_id === selectedSubject).map((v) => v.id);
      if (existingIds.length > 0) {
        const { error: delError } = await supabase.from('study_videos').delete().in('id', existingIds);
        if (delError) throw delError;
      }

      const inserts = valid.map((v, i) => ({
        subject_id: selectedSubject,
        title: v.title,
        youtube_url: v.youtube_url || '',
        description: v.description || null,
        position: i,
        type: v.type,
        file_url: v.file_url || null,
      }));

      const { error: insError } = await supabase.from('study_videos').insert(inserts);
      if (insError) throw insError;

      queryClient.invalidateQueries({ queryKey: ['study-videos'] });
      toast({ title: 'Conteúdos salvos com sucesso!' });
      setDialogOpen(false);
    } catch {
      toast({ title: 'Erro ao salvar conteúdos', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const getContentCount = (subjectId: string) => videos.filter((v) => v.subject_id === subjectId).length;

  const filtered = filterSubject === 'all' ? videos : videos.filter((v) => v.subject_id === filterSubject);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gerenciar Estudo</h1>

      <div>
        <h2 className="text-lg font-semibold mb-3">Matérias</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const count = getContentCount(subject.id);
            return (
              <Card key={subject.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openSubjectDialog(subject.id)}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: subject.color }} />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{subject.name}</p>
                      <p className="text-xs text-muted-foreground">{count} {count === 1 ? 'conteúdo' : 'conteúdos'}</p>
                    </div>
                  </div>
                  <Pencil className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Todos os conteúdos</h2>
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
          <p className="text-muted-foreground">Nenhum conteúdo encontrado.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((video) => {
              const subject = subjects.find((s) => s.id === video.subject_id);
              const isPdf = (video as any).type === 'pdf';
              return (
                <div key={video.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    {isPdf ? <FileText className="h-4 w-4 text-primary shrink-0" /> : <Youtube className="h-4 w-4 text-destructive shrink-0" />}
                    <div className="min-w-0">
                      <p className="font-medium">{video.title}</p>
                      <p className="text-xs text-muted-foreground">{subject?.name}</p>
                    </div>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Conteúdos — {subjects.find((s) => s.id === selectedSubject)?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {contentItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
                Nenhum conteúdo. Adicione vídeos ou PDFs para começar.
              </p>
            ) : (
              contentItems.map((item, index) => (
                <div key={index} className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
                  <div className="flex flex-col gap-1 pt-2">
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItem(index, index - 1)} disabled={index === 0}>
                      <GripVertical className="h-4 w-4 rotate-180" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItem(index, index + 1)} disabled={index === contentItems.length - 1}>
                      <GripVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {item.type === 'pdf' ? <FileText className="h-3 w-3" /> : <Youtube className="h-3 w-3" />}
                      {item.type === 'pdf' ? 'PDF' : 'YouTube'}
                    </div>
                    <Input placeholder="Título *" value={item.title} onChange={(e) => updateItem(index, 'title', e.target.value)} />
                    {item.type === 'video' ? (
                      <Input placeholder="https://youtube.com/watch?v=..." value={item.youtube_url} onChange={(e) => updateItem(index, 'youtube_url', e.target.value)} />
                    ) : (
                      <div>
                        {item.file_url ? (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="truncate flex-1">PDF enviado</span>
                            <label className="cursor-pointer text-xs text-primary hover:underline">
                              Trocar
                              <input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handlePdfUpload(index, e.target.files[0])} />
                            </label>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed rounded-md p-3 hover:border-primary transition-colors">
                            {uploading === index ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 text-muted-foreground" />}
                            <span className="text-sm text-muted-foreground">{uploading === index ? 'Enviando...' : 'Selecionar PDF'}</span>
                            <input type="file" accept=".pdf" className="hidden" disabled={uploading === index} onChange={(e) => e.target.files?.[0] && handlePdfUpload(index, e.target.files[0])} />
                          </label>
                        )}
                      </div>
                    )}
                    <Textarea placeholder="Descrição (opcional)" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} className="min-h-[60px]" />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t sticky bottom-0 bg-background">
            <div className="flex gap-1">
              <Button type="button" variant="outline" size="sm" onClick={() => addItem('video')}>
                <Youtube className="h-4 w-4 mr-1" /> Vídeo
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => addItem('pdf')}>
                <FileText className="h-4 w-4 mr-1" /> PDF
              </Button>
            </div>
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
