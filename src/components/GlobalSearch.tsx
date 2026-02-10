import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, PlayCircle, Search } from 'lucide-react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

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

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      const term = `%${query}%`;
      const [subjects, activities, videos] = await Promise.all([
        supabase.from('subjects').select('id, name, description').ilike('name', term).limit(5),
        supabase.from('activities').select('id, title, subject_id').ilike('title', term).limit(5),
        supabase.from('study_videos').select('id, title, subject_id').ilike('title', term).limit(5),
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
    };

    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (url: string) => {
    setOpen(false);
    setQuery('');
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

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar matérias, atividades, conteúdos..." value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          {Object.entries(grouped).map(([type, items]) => {
            const Icon = icons[type as keyof typeof icons];
            return (
              <CommandGroup key={type} heading={labels[type as keyof typeof labels]}>
                {items.map((item) => (
                  <CommandItem key={item.id} onSelect={() => handleSelect(item.url)}>
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div>
                      <span>{item.title}</span>
                      {item.subtitle && (
                        <span className="ml-2 text-xs text-muted-foreground">{item.subtitle}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
