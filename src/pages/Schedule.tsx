import { useState } from 'react';
import { useSchedule, useUpdateSchedule } from '@/hooks/useSchedule';
import { useSubjects } from '@/hooks/useSubjects';
import { useActivities } from '@/hooks/useActivities';
import { parseLocalDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Edit2, Loader2, ClipboardList, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isToday, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Schedule } from '@/types/database';

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
const PERIODS = ['1ª Aula', '2ª Aula', '3ª Aula', '4ª Aula', '5ª Aula', '6ª Aula'];

export default function SchedulePage() {
  const { isAdmin } = useAuth();
  const { data: schedule = [], isLoading } = useSchedule();
  const { data: subjects = [] } = useSubjects();
  const { data: activities = [] } = useActivities();
  const updateSchedule = useUpdateSchedule();
  
  const [editingCell, setEditingCell] = useState<Schedule | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [customText, setCustomText] = useState('');

  // Calculate current week dates
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekDates = DAYS.map((_, idx) => addDays(weekStart, idx));

  const getScheduleCell = (day: number, period: number) => {
    return schedule.find((s) => s.day_of_week === day && s.period === period);
  };

  // Get activities for a specific day
  const getActivitiesForDay = (dayDate: Date) => {
    return activities.filter((activity) => {
      const activityDate = parseLocalDate(activity.due_date);
      return isSameDay(activityDate, dayDate);
    });
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
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 sm:gap-3">
          <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          Cronograma Semanal
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {isAdmin ? 'Clique em uma célula para editar' : 'Visualize o horário de aulas da semana'}
        </p>
      </div>

      {/* Activities for this week - Mobile friendly cards */}
      {activities.length > 0 && (
        <Card>
          <CardHeader className="pb-3 px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Atividades da Semana
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
              {DAYS.map((day, idx) => {
                const dayDate = weekDates[idx];
                const dayActivities = getActivitiesForDay(dayDate);
                const isDayToday = isToday(dayDate);
                
                return (
                  <div 
                    key={day} 
                    className={`p-2 sm:p-3 rounded-lg border ${isDayToday ? 'border-primary bg-primary/5' : 'bg-muted/30'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs sm:text-sm font-medium ${isDayToday ? 'text-primary' : 'text-muted-foreground'}`}>
                        {day}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(dayDate, 'dd/MM', { locale: ptBR })}
                      </span>
                    </div>
                    {dayActivities.length === 0 ? (
                      <p className="text-xs text-muted-foreground/60 text-center py-2">Sem atividades</p>
                    ) : (
                      <div className="space-y-1.5">
                        {dayActivities.slice(0, 3).map((activity) => (
                          <Link
                            key={activity.id}
                            to={`/subjects/${activity.subject_id}/activities/${activity.id}`}
                            className="block"
                          >
                            <div 
                              className="text-xs p-1.5 sm:p-2 rounded bg-background border hover:border-primary/50 transition-colors"
                              style={{ borderLeftWidth: '3px', borderLeftColor: activity.subject?.color || '#3B82F6' }}
                            >
                              <div className="flex items-center gap-1">
                                {activity.is_completed && (
                                  <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0" />
                                )}
                                <span className={`truncate ${activity.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {activity.title}
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground truncate block">
                                {activity.subject?.name}
                              </span>
                            </div>
                          </Link>
                        ))}
                        {dayActivities.length > 3 && (
                          <Badge variant="outline" className="text-[10px] w-full justify-center">
                            +{dayActivities.length - 3} mais
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-2 sm:p-4 overflow-x-auto">
          <div className="min-w-[600px] sm:min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-6 gap-1 sm:gap-2 mb-2">
              <div className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-muted-foreground">Horário</div>
              {DAYS.map((day, idx) => {
                const dayDate = weekDates[idx];
                const isDayToday = isToday(dayDate);
                return (
                  <div 
                    key={day} 
                    className={`p-2 sm:p-3 text-center font-semibold rounded-lg ${isDayToday ? 'bg-primary text-primary-foreground' : 'bg-primary/10'}`}
                  >
                    <span className="text-xs sm:text-base">{day}</span>
                    <span className="block text-[10px] sm:text-xs opacity-70">
                      {format(dayDate, 'dd/MM', { locale: ptBR })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Body */}
            {PERIODS.map((period, periodIdx) => (
              <div key={period} className="grid grid-cols-6 gap-1 sm:gap-2 mb-1 sm:mb-2">
                <div className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-center">
                  {period}
                </div>
                {DAYS.map((_, dayIdx) => {
                  const cell = getScheduleCell(dayIdx + 1, periodIdx + 1);
                  const subject = cell?.subject;
                  const dayDate = weekDates[dayIdx];
                  const isDayToday = isToday(dayDate);
                  
                  return (
                    <div
                      key={`${dayIdx}-${periodIdx}`}
                      className={`schedule-cell relative group p-1.5 sm:p-2 min-h-[60px] sm:min-h-[70px] rounded-md border ${
                        subject ? 'bg-primary/5' : 'bg-muted/30'
                      } ${isDayToday ? 'ring-1 ring-primary/30' : ''}`}
                      style={{
                        borderLeftColor: subject?.color || undefined,
                        borderLeftWidth: subject ? '4px' : undefined,
                      }}
                    >
                      {subject ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link 
                              to={`/subjects/${subject.id}`}
                              className="block cursor-pointer hover:opacity-80 transition-opacity"
                            >
                              <p className="font-medium text-xs sm:text-sm truncate hover:underline">{subject.name}</p>
                              {cell?.custom_text && (
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{cell.custom_text}</p>
                              )}
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{subject.name}</p>
                            {cell?.custom_text && <p className="text-xs text-muted-foreground">{cell.custom_text}</p>}
                            <p className="text-xs text-primary mt-1">Clique para ver atividades</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : cell?.custom_text ? (
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{cell.custom_text}</p>
                      ) : (
                        <p className="text-xs sm:text-sm text-muted-foreground/50">-</p>
                      )}
                      
                      {isAdmin && cell && (
                        <Dialog open={editingCell?.id === cell.id} onOpenChange={(open) => !open && setEditingCell(null)}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 h-5 w-5 sm:h-7 sm:w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleEdit(cell)}
                            >
                              <Edit2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle className="text-base sm:text-lg">
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
                              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditingCell(null)} className="w-full sm:w-auto">
                                  Cancelar
                                </Button>
                                <Button onClick={handleSave} disabled={updateSchedule.isPending} className="w-full sm:w-auto">
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
          <CardHeader className="pb-3 px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Legenda</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {subjects.map((subject) => (
                <div key={subject.id} className="flex items-center gap-1.5 sm:gap-2">
                  <div
                    className="h-3 w-3 sm:h-4 sm:w-4 rounded"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="text-xs sm:text-sm">{subject.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}