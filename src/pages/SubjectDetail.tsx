import { useParams, Link } from 'react-router-dom';
import { useSubject } from '@/hooks/useSubjects';
import { useActivities, useToggleActivityProgress } from '@/hooks/useActivities';
import { SharedMaterials } from '@/components/SharedMaterials';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Calendar, CheckCircle2, Clock, GraduationCap, Loader2, Play, Youtube } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const { isAdmin } = useAuth();
  const { data: subject, isLoading: subjectLoading } = useSubject(subjectId);
  const { data: activities = [], isLoading: activitiesLoading } = useActivities(subjectId);
  const toggleProgress = useToggleActivityProgress();

  const isLoading = subjectLoading || activitiesLoading;

  const handleToggle = (activityId: string, isCompleted: boolean) => {
    toggleProgress.mutate({ activityId, isCompleted });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-lg text-muted-foreground">Matéria não encontrada</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link to="/subjects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Matérias
          </Link>
        </Button>
      </div>
    );
  }

  const completedCount = activities.filter((a) => a.is_completed).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button asChild variant="ghost" className="mb-2 -ml-4">
            <Link to="/subjects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div
              className="h-14 w-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${subject.color}20` }}
            >
              <GraduationCap
                className="h-8 w-8"
                style={{ color: subject.color }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{subject.name}</h1>
              {subject.description && (
                <p className="text-muted-foreground mt-1">{subject.description}</p>
              )}
            </div>
          </div>
        </div>
        <Badge variant="secondary" className="text-base px-3 py-1">
          {completedCount}/{activities.length} concluídas
        </Badge>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Atividades</h2>

        {activities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Nenhuma atividade</p>
              <p className="text-sm text-muted-foreground/70">
                Ainda não há atividades para esta matéria
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const dueDate = new Date(activity.due_date);
              const isOverdue = isPast(dueDate) && !isToday(dueDate) && !activity.is_completed;
              const isDueToday = isToday(dueDate);

              return (
                <Card
                  key={activity.id}
                  className={`transition-all ${activity.is_completed ? 'activity-completed' : ''} ${isOverdue ? 'border-destructive/50' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={activity.is_completed}
                        onCheckedChange={() => handleToggle(activity.id, activity.is_completed)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <Link
                              to={`/subjects/${subjectId}/activities/${activity.id}`}
                              className="hover:underline"
                            >
                              <h3 className={`font-medium ${activity.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                {activity.title}
                              </h3>
                            </Link>
                            {activity.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {activity.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {activity.youtube_url && (
                              <Badge variant="outline" className="gap-1">
                                <Youtube className="h-3 w-3" />
                                Vídeo
                              </Badge>
                            )}
                            {activity.is_completed ? (
                              <Badge className="bg-success text-success-foreground gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Concluída
                              </Badge>
                            ) : isOverdue ? (
                              <Badge variant="destructive" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Atrasada
                              </Badge>
                            ) : isDueToday ? (
                              <Badge className="bg-warning text-warning-foreground gap-1">
                                <Calendar className="h-3 w-3" />
                                Hoje
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Entrega: {format(dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Shared Materials */}
      {subjectId && <SharedMaterials subjectId={subjectId} />}
    </div>
  );
}