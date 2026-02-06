import { useAuth } from '@/contexts/AuthContext';
import { useActivities } from '@/hooks/useActivities';
import { useSubjects } from '@/hooks/useSubjects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Calendar, CheckCircle2, Clock, GraduationCap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const { profile, isAdmin } = useAuth();
  const { data: activities = [] } = useActivities();
  const { data: subjects = [] } = useSubjects();

  const today = new Date();
  const completedActivities = activities.filter((a) => a.is_completed);
  const pendingActivities = activities.filter((a) => !a.is_completed);
  const upcomingActivities = pendingActivities
    .filter((a) => isAfter(new Date(a.due_date), today))
    .slice(0, 5);
  const overdueActivities = pendingActivities.filter((a) => 
    isBefore(new Date(a.due_date), today)
  );
  const dueSoonActivities = pendingActivities.filter((a) => {
    const dueDate = new Date(a.due_date);
    return isAfter(dueDate, today) && isBefore(dueDate, addDays(today, 3));
  });

  const completionRate = activities.length > 0 
    ? Math.round((completedActivities.length / activities.length) * 100) 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Olá, {profile?.full_name?.split(' ')[0] || 'Estudante'}! 👋
        </h1>
        <p className="text-muted-foreground">
          {isAdmin ? 'Bem-vindo ao painel administrativo' : 'Acompanhe seu progresso e atividades'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Matérias</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground">matérias cadastradas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividades</CardTitle>
            <GraduationCap className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingActivities.length} pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedActivities.length}</div>
            <p className="text-xs text-muted-foreground">atividades finalizadas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximas Atividades
            </CardTitle>
            <CardDescription>Atividades com entrega em breve</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingActivities.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma atividade pendente! 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingActivities.map((activity) => {
                  const isDueSoon = dueSoonActivities.some((a) => a.id === activity.id);
                  return (
                    <Link
                      key={activity.id}
                      to={`/subjects/${activity.subject_id}/activities/${activity.id}`}
                      className="block"
                    >
                      <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-muted/50 ${isDueSoon ? 'border-warning/50 bg-warning/5' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: activity.subject?.color || '#3B82F6' }}
                          />
                          <div>
                            <p className="font-medium text-sm">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {activity.subject?.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isDueSoon && (
                            <Badge variant="outline" className="text-warning border-warning">
                              Em breve
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(activity.due_date), "dd 'de' MMM", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            {activities.length > 0 && (
              <Button variant="ghost" className="w-full mt-4" asChild>
                <Link to="/calendar">Ver todas no calendário</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Overdue Activities */}
        {overdueActivities.length > 0 && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Clock className="h-5 w-5" />
                Atividades Atrasadas
              </CardTitle>
              <CardDescription>Atividades que passaram da data de entrega</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overdueActivities.slice(0, 5).map((activity) => (
                  <Link
                    key={activity.id}
                    to={`/subjects/${activity.subject_id}/activities/${activity.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/30 bg-destructive/5 transition-colors hover:bg-destructive/10">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: activity.subject?.color || '#3B82F6' }}
                        />
                        <div>
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.subject?.name}
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive">
                        {format(new Date(activity.due_date), "dd/MM", { locale: ptBR })}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions for Admin */}
        {isAdmin && overdueActivities.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Gerencie o conteúdo da plataforma</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild variant="outline" className="justify-start">
                <Link to="/admin/subjects">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Gerenciar Matérias
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link to="/admin/activities">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Gerenciar Atividades
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link to="/schedule">
                  <Calendar className="mr-2 h-4 w-4" />
                  Editar Cronograma
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}