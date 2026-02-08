import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, GripVertical, Youtube } from 'lucide-react';
interface VideoItem {
  youtube_url: string;
  title: string;
}

interface ActivityVideoManagerProps {
  videos: VideoItem[];
  onChange: (videos: VideoItem[]) => void;
}

export function ActivityVideoManager({ videos, onChange }: ActivityVideoManagerProps) {
  const addVideo = () => {
    onChange([...videos, { youtube_url: '', title: '' }]);
  };

  const removeVideo = (index: number) => {
    onChange(videos.filter((_, i) => i !== index));
  };

  const updateVideo = (index: number, field: keyof VideoItem, value: string) => {
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Youtube className="h-4 w-4" />
          Vídeos do YouTube
        </Label>
        <Button type="button" variant="outline" size="sm" onClick={addVideo}>
          <Plus className="h-4 w-4 mr-1" />
          Adicionar Vídeo
        </Button>
      </div>

      {videos.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
          Nenhum vídeo adicionado. Clique em "Adicionar Vídeo" para começar.
        </p>
      ) : (
        <div 
          className="space-y-2 overflow-y-auto pr-2" 
          style={{ maxHeight: '200px' }}
        >
          {videos.map((video, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30"
            >
              <div className="flex flex-col gap-1 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveVideo(index, index - 1)}
                  disabled={index === 0}
                >
                  <GripVertical className="h-4 w-4 rotate-180" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveVideo(index, index + 1)}
                  disabled={index === videos.length - 1}
                >
                  <GripVertical className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 space-y-2">
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={video.youtube_url}
                  onChange={(e) => updateVideo(index, 'youtube_url', e.target.value)}
                />
                <Input
                  placeholder="Título do vídeo (opcional)"
                  value={video.title}
                  onChange={(e) => updateVideo(index, 'title', e.target.value)}
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => removeVideo(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
