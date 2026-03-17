import { useState, useMemo } from 'react';
import { useActivities, useToggleActivityProgress } from '@/hooks/useActivities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Clock, Download, Loader2, Youtube, AlertTriangle, Circle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import type { ActivityWithProgress } from '@/types/database';
import { generateIcsFile, downloadIcsFile } from '@/lib/icsGenerator';
import { toast } from 'sonner';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type ActivityStatus = 'completed' | 'pending' | 'overdue';

const getActivityStatus = (activity: ActivityWithProgress): ActivityStatus => {
  if (activity.is_completed) return 'completed';
  const dueDate = parseLocalDate(activity.due_date);
  if (isPast(dueDate) && !isToday(dueDate)) return 'overdue';
  return 'pending';
};

const statusConfig = {
  completed: {
    label: 'Concluída',
    icon: CheckCircle2,
    badgeClass: 'bg-success text-success-foreground border-success',
    dotClass: 'bg-success',
    bgClass: 'bg-success/10 border-success/30',
  },
  pending: {
    label: 'Pendente',
    icon: Circle,
    badgeClass: 'bg-warning text-warning-foreground border-warning',
    dotClass: 'bg-warning',
    bgClass: 'bg-warning/10 border-warning/30',
  },
  overdue: {
    label: 'Atrasada',
    icon: AlertTriangle,
    badgeClass: 'bg-destructive text-destructive-foreground border-destructive',
    dotClass: 'bg-destructive',
    bgClass: 'bg-destructive/10 border-destructive/30',
  },
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { data: activities = [], isLoading } = useActivities();
  const toggleProgress = useToggleActivityProgress();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week of the first day (0 = Sunday)
  const startDayOfWeek = monthStart.getDay();
  
  // Add empty cells for days before the first of the month
  const calendarDays = [
    ...Array(startDayOfWeek).fill(null),
    ...daysInMonth,
  ];

  const activitiesByDate = useMemo(() => {
    const map = new Map<string, ActivityWithProgress[]>();
    activities.forEach((activity) => {
      const dateKey = format(parseLocalDate(activity.due_date), 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(activity);
    });
    return map;
  }, [activities]);

  const getActivitiesForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return activitiesByDate.get(dateKey) || [];
  };

  const selectedDateActivities = selectedDate ? getActivitiesForDate(selectedDate) : [];

  const handleToggle = (activity: ActivityWithProgress) => {
    toggleProgress.mutate({ activityId: activity.id, isCompleted: activity.is_completed });
  };

  // Calculate summary stats
  const stats = useMemo(() => {
    const completed = activities.filter(a => a.is_completed).length;
    const overdue = activities.filter(a => getActivityStatus(a) === 'overdue').length;
    const pending = activities.filter(a => getActivityStatus(a) === 'pending').length;
    return { completed, overdue, pending };
  }, [activities]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleExportIcs = () => {
    const pendingActivities = activities.filter(a => !a.is_completed);
    if (pendingActivities.length === 0) {
      toast.info('Nenhuma atividade pendente para exportar');
      return;
    }
    const events = pendingActivities.map(a => ({
      title: `${a.subject?.name ? a.subject.name + ' - ' : ''}${a.title}`,
      description: a.description || undefined,
      date: a.due_date,
    }));
    const ics = generateIcsFile(events);
    downloadIcsFile(ics);
    toast.success(`${events.length} atividades exportadas!`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex flex-col gap-1 sm:gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 sm:gap-3">
            <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Calendário de Atividades
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Visualize todas as atividades por data de entrega
          </p>
        </div>
        <Button variant="outline" onClick={handleExportIcs}>
          <Download className="mr-2 h-4 w-4" />
          Exportar .ics
        </Button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-2 sm:p-4">
            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-1 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold leading-tight">{stats.completed}</p>
                <p className="text-[10px] sm:text-sm text-muted-foreground leading-tight truncate">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-2 sm:p-4">
            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-1 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold leading-tight">{stats.pending}</p>
                <p className="text-[10px] sm:text-sm text-muted-foreground leading-tight truncate">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-2 sm:p-4">
            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-1 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold leading-tight">{stats.overdue}</p>
                <p className="text-[10px] sm:text-sm text-muted-foreground leading-tight truncate">Atrasadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl">
              {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
            </CardTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayActivities = getActivitiesForDate(day);
              const hasActivities = dayActivities.length > 0;
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              
              // Get dominant status for the day
              const hasOverdue = dayActivities.some(a => getActivityStatus(a) === 'overdue');
              const hasPending = dayActivities.some(a => getActivityStatus(a) === 'pending');
              const allCompleted = hasActivities && dayActivities.every(a => a.is_completed);

              return (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    aspect-square p-1 rounded-lg border transition-all relative
                    ${isToday(day) ? 'border-primary bg-primary/5' : 'border-transparent'}
                    ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                    ${hasActivities ? 'hover:bg-muted cursor-pointer' : 'hover:bg-muted/50 cursor-default'}
                    ${!isSameMonth(day, currentMonth) ? 'opacity-50' : ''}
                  `}
                >
                  <span className={`
                    text-sm font-medium
                    ${isToday(day) ? 'text-primary' : ''}
                  `}>
                    {format(day, 'd')}
                  </span>
                  {hasActivities && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayActivities.slice(0, 3).map((activity, i) => {
                        const status = getActivityStatus(activity);
                        return (
                          <div
                            key={i}
                            className={`h-2 w-2 rounded-full ${statusConfig[status].dotClass}`}
                          />
                        );
                      })}
                      {dayActivities.length > 3 && (
                        <span className="text-[8px] text-muted-foreground">+{dayActivities.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Activities */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Atividades - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</span>
              {selectedDateActivities.length > 0 && (
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-success border-success">
                    {selectedDateActivities.filter(a => a.is_completed).length} concluídas
                  </Badge>
                  <Badge variant="outline" className="text-warning border-warning">
                    {selectedDateActivities.filter(a => getActivityStatus(a) === 'pending').length} pendentes
                  </Badge>
                  <Badge variant="outline" className="text-destructive border-destructive">
                    {selectedDateActivities.filter(a => getActivityStatus(a) === 'overdue').length} atrasadas
                  </Badge>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateActivities.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma atividade para esta data
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDateActivities.map((activity) => {
                  const status = getActivityStatus(activity);
                  const config = statusConfig[status];
                  const StatusIcon = config.icon;

                  return (
                    <div
                      key={activity.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${config.bgClass}`}
                    >
                      <Checkbox
                        checked={activity.is_completed}
                        onCheckedChange={() => handleToggle(activity)}
                        className="h-5 w-5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {activity.subject && (
                            <div
                              className="h-3 w-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: activity.subject.color }}
                            />
                          )}
                          <Link
                            to={`/subjects/${activity.subject_id}/activities/${activity.id}`}
                            className={`font-medium hover:underline truncate ${activity.is_completed ? 'line-through opacity-60' : ''}`}
                          >
                            {activity.title}
                          </Link>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.subject?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {activity.youtube_url && (
                          <Youtube className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Badge className={config.badgeClass}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-success" />
              <span className="font-medium">Concluída</span>
              <span className="text-muted-foreground">- Atividade finalizada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-warning" />
              <span className="font-medium">Pendente</span>
              <span className="text-muted-foreground">- Aguardando entrega</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-destructive" />
              <span className="font-medium">Atrasada</span>
              <span className="text-muted-foreground">- Prazo expirado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
