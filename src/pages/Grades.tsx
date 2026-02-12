import { useState, useMemo } from 'react';
import { useGrades, useCreateGrade, useDeleteGrade } from '@/hooks/useGrades';
import { useSubjects } from '@/hooks/useSubjects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GraduationCap, Loader2, Plus, Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';

export default function Grades() {
  const { data: grades = [], isLoading } = useGrades();
  const { data: subjects = [] } = useSubjects();
  const createGrade = useCreateGrade();
  const deleteGrade = useDeleteGrade();

  const [isOpen, setIsOpen] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState('');
  const [maxGrade, setMaxGrade] = useState('10');

  const resetForm = () => {
    setSubjectId('');
    setTitle('');
    setGrade('');
    setMaxGrade('10');
  };

  const handleCreate = () => {
    if (!subjectId || !title.trim() || !grade) return;
    createGrade.mutate(
      { subject_id: subjectId, title, grade: parseFloat(grade), max_grade: parseFloat(maxGrade) || 10 },
      { onSuccess: () => { setIsOpen(false); resetForm(); } }
    );
  };

  // Group grades by subject and compute averages
  const subjectStats = useMemo(() => {
    const map = new Map<string, { name: string; color: string; grades: { title: string; grade: number; max_grade: number }[]; avg: number }>();
    grades.forEach(g => {
      const name = g.subject?.name || 'Sem matéria';
      const color = g.subject?.color || '#94a3b8';
      if (!map.has(name)) map.set(name, { name, color, grades: [], avg: 0 });
      map.get(name)!.grades.push({ title: g.title, grade: g.grade, max_grade: g.max_grade });
    });
    map.forEach(v => {
      const total = v.grades.reduce((s, g) => s + (g.grade / g.max_grade) * 10, 0);
      v.avg = v.grades.length > 0 ? total / v.grades.length : 0;
    });
    return Array.from(map.values());
  }, [grades]);

  // Chart data: grades over time per subject
  const chartData = useMemo(() => {
    const subjectNames = [...new Set(grades.map(g => g.subject?.name || 'Sem matéria'))];
    return grades
      .slice()
      .reverse()
      .map((g, i) => {
        const entry: Record<string, any> = { name: g.title };
        if (g.subject?.name) entry[g.subject.name] = (g.grade / g.max_grade) * 10;
        return entry;
      });
  }, [grades]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            Minhas Notas
          </h1>
          <p className="text-muted-foreground mt-1">Registre e acompanhe suas notas por matéria</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Nova Nota</Button>
          </DialogTrigger>
          <DialogContent>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nota *</Label>
                  <Input type="number" step="0.1" min="0" value={grade} onChange={e => setGrade(e.target.value)} placeholder="8.5" />
                </div>
                <div className="space-y-2">
                  <Label>Nota Máxima</Label>
                  <Input type="number" step="0.1" min="0" value={maxGrade} onChange={e => setMaxGrade(e.target.value)} placeholder="10" />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={!subjectId || !title.trim() || !grade || createGrade.isPending}>
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
          {/* Averages */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {subjectStats.map(s => (
              <Card key={s.name}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-sm font-medium truncate">{s.name}</span>
                  </div>
                  <div className="text-2xl font-bold">{s.avg.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">{s.grades.length} nota(s)</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart */}
          {grades.length > 1 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Desempenho ao Longo do Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--card-foreground))' }} />
                    {subjectStats.map(s => (
                      <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.color} strokeWidth={2} dot={{ r: 4 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Grade list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Todas as Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {grades.map(g => (
                  <div key={g.id} className="flex items-center justify-between p-3 rounded-lg border group hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: g.subject?.color || '#94a3b8' }} />
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{g.title}</p>
                        <p className="text-xs text-muted-foreground">{g.subject?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-sm">{g.grade}/{g.max_grade}</Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
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
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
