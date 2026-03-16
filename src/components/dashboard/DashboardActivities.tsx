import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, AlertTriangle, Clock, ListTodo } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSubjects } from '@/hooks/useSubjects';
import { ACTIVITY_TYPES } from '@/types/database';

type Activity = {
  id: string;
  title: string;
  due_date: string;
  is_completed: boolean;
  subject_id: string;
  activity_type?: string;
  subject?: { name: string; color: string | null } | null;
};

interface DashboardActivitiesProps {
  activities: Activity[];
}

export function DashboardActivities({ activities }: DashboardActivitiesProps) {
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const { data: subjects = [] } = useSubjects();

  const today = new Date();
  const pending = activities.filter((a) => !a.is_completed);

  const filtered = useMemo(() => {
    if (subjectFilter === 'all') return pending;
    return pending.filter((a) => a.subject_id === subjectFilter);
  }, [pending, subjectFilter]);

  const overdue = filtered.filter((a) => isBefore(new Date(a.due_date), today));
  const dueSoon = filtered.filter((a) => {
    const d = new Date(a.due_date);
    return isAfter(d, today) && isBefore(d, addDays(today, 3));
  });
  const allPending = filtered;

  const renderList = (items: Activity[], emptyMsg: string) => {
    if (items.length === 0) {
      return (
        <p className="text-center text-muted-foreground py-6 text-sm">{emptyMsg}</p>
      );
    }
    return (
      <div className="space-y-2">
        {items.map((activity) => {
          const isOverdue = isBefore(new Date(activity.due_date), today);
          return (
            <Link
              key={activity.id}
              to={`/subjects/${activity.subject_id}/activities/${activity.id}`}
              className="block"
            >
              <div
                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                  isOverdue ? 'border-destructive/30 bg-destructive/5' : ''
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div
                    className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: activity.subject?.color || '#3B82F6' }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs sm:text-sm truncate">{activity.title}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {activity.subject?.name}
                      {activity.activity_type && activity.activity_type !== 'other' && (
                        <span className="ml-1">• {ACTIVITY_TYPES.find(t => t.value === activity.activity_type)?.label}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isOverdue && (
                    <Badge variant="destructive" className="text-[10px] sm:text-xs">
                      Atrasada
                    </Badge>
                  )}
                  <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(activity.due_date), "dd 'de' MMM", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Atividades Pendentes
          </CardTitle>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[160px] sm:w-[200px] h-8 text-xs sm:text-sm">
              <SelectValue placeholder="Filtrar matéria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as matérias</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 flex-1">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-3">
            <TabsTrigger value="overdue" className="text-xs sm:text-sm gap-1">
              <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Atrasadas
              {overdue.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 px-1 text-[10px]">
                  {overdue.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="soon" className="text-xs sm:text-sm gap-1">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Em breve
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm gap-1">
              <ListTodo className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Todas
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overdue" className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {renderList(overdue, 'Nenhuma atividade atrasada! 🎉')}
          </TabsContent>
          <TabsContent value="soon" className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {renderList(dueSoon, 'Nenhuma atividade para os próximos 3 dias')}
          </TabsContent>
          <TabsContent value="all" className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {renderList(allPending, 'Nenhuma atividade pendente! 🎉')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
