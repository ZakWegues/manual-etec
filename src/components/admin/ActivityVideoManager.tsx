import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical, Youtube, FileText, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ResourceItem {
  youtube_url: string;
  title: string;
  type: 'video' | 'pdf';
  file_url?: string;
}

interface ActivityVideoManagerProps {
  videos: ResourceItem[];
  onChange: (videos: ResourceItem[]) => void;
}

export function ActivityVideoManager({ videos, onChange }: ActivityVideoManagerProps) {
  const [uploading, setUploading] = useState<number | null>(null);

  const addVideo = () => {
    onChange([...videos, { youtube_url: '', title: '', type: 'video' }]);
  };

  const addPdf = () => {
    onChange([...videos, { youtube_url: '', title: '', type: 'pdf', file_url: '' }]);
  };

  const removeVideo = (index: number) => {
    onChange(videos.filter((_, i) => i !== index));
  };

  const updateVideo = (index: number, field: keyof ResourceItem, value: string) => {
    const updated = videos.map((video, i) =>
      i === index ? { ...video, [field]: value } : video
    );
    onChange(updated);
  };

  const moveVideo = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= videos.length) return;
    const updated = [...videos];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated);
  };

  const handlePdfUpload = async (index: number, file: File) => {
    if (!file || file.type !== 'application/pdf') {
      toast.error('Selecione um arquivo PDF válido');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 20MB');
      return;
    }

    setUploading(index);
    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error } = await supabase.storage.from('pdfs').upload(fileName, file);
      if (error) throw error;

      const { data: urlData } = supabase.storage.from('pdfs').getPublicUrl(fileName);

      const updated = videos.map((video, i) =>
        i === index ? { ...video, file_url: urlData.publicUrl, title: video.title || file.name.replace('.pdf', '') } : video
      );
      onChange(updated);
      toast.success('PDF enviado com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao enviar PDF: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Conteúdos</Label>
        <div className="flex gap-1">
          <Button type="button" variant="outline" size="sm" onClick={addVideo}>
            <Youtube className="h-4 w-4 mr-1" />
            Vídeo
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={addPdf}>
            <FileText className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </div>
      </div>

      {videos.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
          Nenhum conteúdo adicionado. Adicione vídeos ou PDFs.
        </p>
      ) : (
        <div className="space-y-2 overflow-y-auto pr-2" style={{ maxHeight: '250px' }}>
          {videos.map((video, index) => (
            <div key={index} className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
              <div className="flex flex-col gap-1 pt-2">
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveVideo(index, index - 1)} disabled={index === 0}>
                  <GripVertical className="h-4 w-4 rotate-180" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveVideo(index, index + 1)} disabled={index === videos.length - 1}>
                  <GripVertical className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {video.type === 'pdf' ? <FileText className="h-3 w-3" /> : <Youtube className="h-3 w-3" />}
                  {video.type === 'pdf' ? 'PDF' : 'YouTube'}
                </div>
                <Input
                  placeholder="Título (opcional)"
                  value={video.title}
                  onChange={(e) => updateVideo(index, 'title', e.target.value)}
                />
                {video.type === 'video' ? (
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    value={video.youtube_url}
                    onChange={(e) => updateVideo(index, 'youtube_url', e.target.value)}
                  />
                ) : (
                  <div className="space-y-1">
                    {video.file_url ? (
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
                        {uploading === index ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {uploading === index ? 'Enviando...' : 'Selecionar PDF'}
                        </span>
                        <input type="file" accept=".pdf" className="hidden" disabled={uploading === index} onChange={(e) => e.target.files?.[0] && handlePdfUpload(index, e.target.files[0])} />
                      </label>
                    )}
                  </div>
                )}
              </div>

              <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeVideo(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
