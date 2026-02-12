import { useState, useMemo } from 'react';
import { useGrades, useCreateGrade, useDeleteGrade } from '@/hooks/useGrades';
import { useSubjects } from '@/hooks/useSubjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Loader2, Plus, Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/lib/utils';

// Concept system: I (1), R (2), B (3), MB (4)
const CONCEPTS = [
  { value: 1, label: 'I', full: 'Insuficiente', color: 'bg-destructive text-destructive-foreground' },
  { value: 2, label: 'R', full: 'Regular', color: 'bg-warning text-warning-foreground' },
  { value: 3, label: 'B', full: 'Bom', color: 'bg-secondary text-secondary-foreground' },
  { value: 4, label: 'MB', full: 'Muito Bom', color: 'bg-success text-success-foreground' },
] as const;

function getConceptFromValue(value: number) {
  return CONCEPTS.find(c => c.value === value) || CONCEPTS[0];
}

function getMostFrequentConcept(grades: number[]): typeof CONCEPTS[number] {
  if (grades.length === 0) return CONCEPTS[0];
  const counts = new Map<number, number>();
  grades.forEach(g => counts.set(g, (counts.get(g) || 0) + 1));
  let maxCount = 0;
  let maxValue = 1;
  counts.forEach((count, value) => {
    if (count > maxCount || (count === maxCount && value > maxValue)) {
      maxCount = count;
      maxValue = value;
    }
  });
  return getConceptFromValue(maxValue);
}

export default function Grades() {
  const { data: grades = [], isLoading } = useGrades();
  const { data: subjects = [] } = useSubjects();
  const createGrade = useCreateGrade();
  const deleteGrade = useDeleteGrade();

  const [isOpen, setIsOpen] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [gradeValue, setGradeValue] = useState('');

  const resetForm = () => {
    setSubjectId('');
    setTitle('');
    setGradeValue('');
  };

  const handleCreate = () => {
    if (!subjectId || !title.trim() || !gradeValue) return;
    createGrade.mutate(
      { subject_id: subjectId, title, grade: parseInt(gradeValue), max_grade: 4 },
      { onSuccess: () => { setIsOpen(false); resetForm(); } }
    );
  };

  // Group grades by subject
  const subjectStats = useMemo(() => {
    const map = new Map<string, { name: string; color: string; grades: number[]; dominant: typeof CONCEPTS[number] }>();
    grades.forEach(g => {
      const name = g.subject?.name || 'Sem matéria';
      const color = g.subject?.color || '#94a3b8';
      if (!map.has(name)) map.set(name, { name, color, grades: [], dominant: CONCEPTS[0] });
      map.get(name)!.grades.push(g.grade);
    });
    map.forEach(v => {
      v.dominant = getMostFrequentConcept(v.grades);
    });
    return Array.from(map.values());
  }, [grades]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 sm:gap-3">
            <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Minhas Notas
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Registre e acompanhe suas notas por matéria</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" />Nova Nota</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-lg">
            <DialogHeader><DialogTitle>Registrar Nota</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Matéria *</Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma matéria" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => (
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
                <Label>Título *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: P1, Trabalho 1" />
              </div>
              <div className="space-y-2">
                <Label>Nota *</Label>
                <div className="grid grid-cols-4 gap-2">
                  {CONCEPTS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setGradeValue(String(c.value))}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg border-2 transition-all',
                        gradeValue === String(c.value)
                          ? 'border-foreground scale-105 shadow-md'
                          : 'border-border hover:border-muted-foreground/50'
                      )}
                    >
                      <span className={cn('text-base sm:text-lg font-bold px-2 py-0.5 rounded', c.color)}>{c.label}</span>
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground">{c.full}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={!subjectId || !title.trim() || !gradeValue || createGrade.isPending}>
                {createGrade.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {grades.length === 0 ? (
        <EmptyState
          variant="grades"
          title="Nenhuma nota registrada"
          description="Comece registrando suas notas para acompanhar seu desempenho"
          action={<Button onClick={() => setIsOpen(true)}><Plus className="mr-2 h-4 w-4" />Registrar Nota</Button>}
        />
      ) : (
        <>
          {/* Subject summary cards */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {subjectStats.map(s => (
              <Card key={s.name}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-xs sm:text-sm font-medium truncate">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-lg sm:text-xl font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded', s.dominant.color)}>
                      {s.dominant.label}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">{s.dominant.full}</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2">{s.grades.length} nota(s)</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Concept distribution per subject */}
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="text-sm sm:text-base">Distribuição de Notas</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="space-y-4">
                {subjectStats.map(s => {
                  const total = s.grades.length;
                  return (
                    <div key={s.name} className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-xs sm:text-sm font-medium">{s.name}</span>
                      </div>
                      <div className="flex h-5 sm:h-6 rounded-full overflow-hidden bg-muted">
                        {CONCEPTS.map(c => {
                          const count = s.grades.filter(g => g === c.value).length;
                          if (count === 0) return null;
                          const pct = (count / total) * 100;
                          return (
                            <div
                              key={c.value}
                              className={cn('flex items-center justify-center text-[9px] sm:text-[10px] font-bold', c.color)}
                              style={{ width: `${pct}%` }}
                              title={`${c.label}: ${count}`}
                            >
                              {pct >= 15 && c.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 justify-center">
                {CONCEPTS.map(c => (
                  <div key={c.value} className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
                    <span className={cn('px-1 sm:px-1.5 py-0.5 rounded font-bold', c.color)}>{c.label}</span>
                    <span className="text-muted-foreground hidden sm:inline">{c.full}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Grade list */}
          <Card>
            <CardHeader className="px-3 sm:px-6">
              <CardTitle className="text-sm sm:text-base">Todas as Notas</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="space-y-2">
                {grades.map(g => {
                  const concept = getConceptFromValue(g.grade);
                  return (
                    <div key={g.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg border group hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full flex-shrink-0" style={{ backgroundColor: g.subject?.color || '#94a3b8' }} />
                        <div className="min-w-0">
                          <p className="font-medium text-xs sm:text-sm">{g.title}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">{g.subject?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Badge className={cn('text-xs sm:text-sm font-bold', concept.color)}>{concept.label}</Badge>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 opacity-0 group-hover:opacity-100 text-destructive">
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover nota?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteGrade.mutate(g.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remover</AlertDialogAction>
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
        </>
      )}
    </div>
  );
}
