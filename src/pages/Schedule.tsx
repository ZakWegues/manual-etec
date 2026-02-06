import { useState } from 'react';
import { useSchedule, useUpdateSchedule } from '@/hooks/useSchedule';
import { useSubjects } from '@/hooks/useSubjects';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Edit2, Loader2 } from 'lucide-react';
import type { Schedule } from '@/types/database';

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
const PERIODS = ['1ª Aula', '2ª Aula', '3ª Aula', '4ª Aula', '5ª Aula', '6ª Aula'];

export default function SchedulePage() {
  const { isAdmin } = useAuth();
  const { data: schedule = [], isLoading } = useSchedule();
  const { data: subjects = [] } = useSubjects();
  const updateSchedule = useUpdateSchedule();
  
  const [editingCell, setEditingCell] = useState<Schedule | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [customText, setCustomText] = useState('');

  const getScheduleCell = (day: number, period: number) => {
    return schedule.find((s) => s.day_of_week === day && s.period === period);
  };

  const handleEdit = (cell: Schedule) => {
    setEditingCell(cell);
    setSelectedSubject(cell.subject_id || 'none');
    setCustomText(cell.custom_text || '');
  };

  const handleSave = () => {
    if (!editingCell) return;

    updateSchedule.mutate({
      id: editingCell.id,
      subject_id: selectedSubject === 'none' ? null : selectedSubject,
      custom_text: customText || null,
    }, {
      onSuccess: () => setEditingCell(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          Cronograma Semanal
        </h1>
        <p className="text-muted-foreground">
          {isAdmin ? 'Clique em uma célula para editar' : 'Visualize o horário de aulas da semana'}
        </p>
      </div>

      <Card>
        <CardContent className="p-4 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-6 gap-2 mb-2">
              <div className="p-3 text-center font-medium text-muted-foreground">Horário</div>
              {DAYS.map((day, idx) => (
                <div key={day} className="p-3 text-center font-semibold bg-primary/10 rounded-lg">
                  {day}
                </div>
              ))}
            </div>

            {/* Body */}
            {PERIODS.map((period, periodIdx) => (
              <div key={period} className="grid grid-cols-6 gap-2 mb-2">
                <div className="p-3 text-center font-medium text-muted-foreground flex items-center justify-center">
                  {period}
                </div>
                {DAYS.map((_, dayIdx) => {
                  const cell = getScheduleCell(dayIdx + 1, periodIdx + 1);
                  const subject = cell?.subject;
                  
                  return (
                    <div
                      key={`${dayIdx}-${periodIdx}`}
                      className={`schedule-cell relative group ${
                        subject ? 'bg-primary/5' : 'bg-muted/30'
                      }`}
                      style={{
                        borderLeftColor: subject?.color || undefined,
                        borderLeftWidth: subject ? '4px' : undefined,
                      }}
                    >
                      {subject ? (
                        <div>
                          <p className="font-medium text-sm">{subject.name}</p>
                          {cell?.custom_text && (
                            <p className="text-xs text-muted-foreground mt-1">{cell.custom_text}</p>
                          )}
                        </div>
                      ) : cell?.custom_text ? (
                        <p className="text-sm text-muted-foreground">{cell.custom_text}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground/50">-</p>
                      )}
                      
                      {isAdmin && cell && (
                        <Dialog open={editingCell?.id === cell.id} onOpenChange={(open) => !open && setEditingCell(null)}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleEdit(cell)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Editar {DAYS[dayIdx]} - {period}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div className="space-y-2">
                                <Label>Matéria</Label>
                                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma matéria" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">Nenhuma</SelectItem>
                                    {subjects.map((s) => (
                                      <SelectItem key={s.id} value={s.id}>
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: s.color }}
                                          />
                                          {s.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Texto personalizado (opcional)</Label>
                                <Input
                                  value={customText}
                                  onChange={(e) => setCustomText(e.target.value)}
                                  placeholder="Ex: Sala 12, Laboratório..."
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditingCell(null)}>
                                  Cancelar
                                </Button>
                                <Button onClick={handleSave} disabled={updateSchedule.isPending}>
                                  {updateSchedule.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : null}
                                  Salvar
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      {subjects.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Legenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {subjects.map((subject) => (
                <div key={subject.id} className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="text-sm">{subject.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}