import { useState, useMemo } from 'react';
import { useActivities, useToggleActivityProgress } from '@/hooks/useActivities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Clock, Loader2, Youtube } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import type { ActivityWithProgress } from '@/types/database';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityWithProgress | null>(null);
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
      const dateKey = format(new Date(activity.due_date), 'yyyy-MM-dd');
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
          <CalendarIcon className="h-8 w-8 text-primary" />
          Calendário de Atividades
        </h1>
        <p className="text-muted-foreground">
          Visualize todas as atividades por data de entrega
        </p>
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
              const allCompleted = hasActivities && dayActivities.every((a) => a.is_completed);
              const someOverdue = hasActivities && dayActivities.some((a) => !a.is_completed && isPast(new Date(a.due_date)) && !isToday(new Date(a.due_date)));
              const isSelected = selectedDate && isSameDay(day, selectedDate);

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
                      {dayActivities.slice(0, 3).map((activity, i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-1.5 rounded-full ${
                            activity.is_completed
                              ? 'bg-success'
                              : someOverdue
                              ? 'bg-destructive'
                              : 'bg-primary'
                          }`}
                          style={activity.subject?.color && !activity.is_completed && !someOverdue ? { backgroundColor: activity.subject.color } : {}}
                        />
                      ))}
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
            <CardTitle>
              Atividades - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
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
                  const dueDate = new Date(activity.due_date);
                  const isOverdue = isPast(dueDate) && !isToday(dueDate) && !activity.is_completed;

                  return (
                    <div
                      key={activity.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                        activity.is_completed ? 'bg-success/5 border-success/30' : isOverdue ? 'bg-destructive/5 border-destructive/30' : ''
                      }`}
                    >
                      <Checkbox
                        checked={activity.is_completed}
                        onCheckedChange={() => handleToggle(activity)}
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
                            className="font-medium hover:underline truncate"
                          >
                            {activity.title}
                          </Link>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.subject?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {activity.youtube_url && (
                          <Youtube className="h-4 w-4 text-muted-foreground" />
                        )}
                        {activity.is_completed ? (
                          <Badge className="bg-success text-success-foreground">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Concluída
                          </Badge>
                        ) : isOverdue ? (
                          <Badge variant="destructive">
                            <Clock className="h-3 w-3 mr-1" />
                            Atrasada
                          </Badge>
                        ) : null}
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
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span>Pendente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success" />
              <span>Concluída</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive" />
              <span>Atrasada</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}