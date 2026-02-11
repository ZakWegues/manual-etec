import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, PlayCircle, Search } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  type: 'subject' | 'activity' | 'study';
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const doSearch = async (term: string) => {
    if (!term || term.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const likeTerm = `%${term}%`;
      const [subjects, activities, videos] = await Promise.all([
        supabase.from('subjects').select('id, name, description').ilike('name', likeTerm).limit(5),
        supabase.from('activities').select('id, title, subject_id').ilike('title', likeTerm).limit(5),
        supabase.from('study_videos').select('id, title, subject_id').ilike('title', likeTerm).limit(5),
      ]);

      const r: SearchResult[] = [];
      subjects.data?.forEach((s) =>
        r.push({ id: s.id, title: s.name, subtitle: s.description || undefined, url: `/subjects/${s.id}`, type: 'subject' })
      );
      activities.data?.forEach((a) =>
        r.push({ id: a.id, title: a.title, url: `/subjects/${a.subject_id}/activities/${a.id}`, type: 'activity' })
      );
      videos.data?.forEach((v) =>
        r.push({ id: v.id, title: v.title, url: `/study/${v.subject_id}`, type: 'study' })
      );
      setResults(r);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (url: string) => {
    setOpen(false);
    setQuery('');
    setResults([]);
    navigate(url);
  };

  const icons = {
    subject: BookOpen,
    activity: GraduationCap,
    study: PlayCircle,
  };

  const labels = {
    subject: 'Matérias',
    activity: 'Atividades',
    study: 'Conteúdos de Estudo',
  };

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.type] ??= []).push(r);
    return acc;
  }, {});

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-9 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex text-muted-foreground text-sm">Buscar...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 gap-0 max-w-lg">
          <div className="flex items-center border-b px-3 gap-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              placeholder="Buscar matérias, atividades, conteúdos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
              autoFocus
            />
            <Button
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() => doSearch(query)}
            >
              <Search className="h-3.5 w-3.5" />
              Buscar
            </Button>
          </div>

          <ScrollArea className="max-h-[300px]">
            {query.length >= 2 && results.length === 0 && !loading && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum resultado encontrado.
              </p>
            )}
            {query.length < 2 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Digite pelo menos 2 caracteres para buscar.
              </p>
            )}
            {Object.entries(grouped).map(([type, items]) => {
              const Icon = icons[type as keyof typeof icons];
              return (
                <div key={type} className="p-1">
                  <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {labels[type as keyof typeof labels]}
                  </p>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.url)}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{item.title}</span>
                      {item.subtitle && (
                        <span className="ml-1 text-xs text-muted-foreground truncate">{item.subtitle}</span>
                      )}
                    </button>
                  ))}
                </div>
              );
            })}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
