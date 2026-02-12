import { useState } from 'react';
import { useSharedMaterials, useCreateMaterial, useDeleteMaterial } from '@/hooks/useSharedMaterials';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Loader2, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';

interface SharedMaterialsProps {
  subjectId: string;
}

export function SharedMaterials({ subjectId }: SharedMaterialsProps) {
  const { user, isAdmin } = useAuth();
  const { data: materials = [], isLoading } = useSharedMaterials(subjectId);
  const createMaterial = useCreateMaterial();
  const deleteMaterial = useDeleteMaterial();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    createMaterial.mutate(
      { subjectId, title: title.trim(), content: content.trim() },
      {
        onSuccess: () => {
          setTitle('');
          setContent('');
          setOpen(false);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Materiais dos Alunos
        </h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Compartilhar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Compartilhar Material</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Título do material"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Conteúdo (suporta Markdown)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px]"
              />
              <Button type="submit" className="w-full" disabled={!title.trim() || !content.trim() || createMaterial.isPending}>
                {createMaterial.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Compartilhar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : materials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <BookOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Nenhum material compartilhado ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {materials.map((material) => {
            const initials = (material.profile?.full_name || 'U').slice(0, 2).toUpperCase();
            const canDelete = user?.id === material.user_id || isAdmin;

            return (
              <Card key={material.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={material.profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{material.profile?.full_name || 'Usuário'}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(material.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => deleteMaterial.mutate({ materialId: material.id, subjectId })}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <CardTitle className="text-base">{material.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-muted-foreground">
                    <ReactMarkdown>{material.content}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
