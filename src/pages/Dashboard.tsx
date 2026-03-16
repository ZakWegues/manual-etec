import { useAuth } from '@/contexts/AuthContext';
import { useActivities } from '@/hooks/useActivities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Calendar, CheckCircle2, GraduationCap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardActivities } from '@/components/dashboard/DashboardActivities';
import { MiniAIAssistant } from '@/components/dashboard/MiniAIAssistant';

export default function Dashboard() {
  const { profile, isAdmin } = useAuth();
  const { data: activities = [] } = useActivities();

  const completedActivities = activities.filter((a) => a.is_completed);
  const pendingActivities = activities.filter((a) => !a.is_completed);

  const completionRate = activities.length > 0
    ? Math.round((completedActivities.length / activities.length) * 100)
    : 0;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Olá, {profile?.full_name?.split(' ')[0] || 'Estudante'}! 👋
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {isAdmin ? 'Bem-vindo ao painel administrativo' : 'Acompanhe seu progresso e atividades'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-3">
        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Atividades</CardTitle>
            <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 text-secondary" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold">{activities.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {pendingActivities.length} pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold">{completedActivities.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">atividades finalizadas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Progresso</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2 h-1.5 sm:h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
        {/* Activities - takes 3/5 of space */}
        <div className="lg:col-span-3">
          <DashboardActivities activities={activities} />
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          {/* Mini AI Assistant */}
          <MiniAIAssistant />

          {/* Quick Actions for Admin */}
          {isAdmin && (
            <Card>
              <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-base sm:text-lg">Ações Rápidas</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Gerencie o conteúdo da plataforma</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 sm:gap-3 px-3 sm:px-6 pb-3 sm:pb-6">
                <Button asChild variant="outline" className="justify-start text-xs sm:text-sm">
                  <Link to="/admin/subjects">
                    <BookOpen className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Gerenciar Matérias
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start text-xs sm:text-sm">
                  <Link to="/admin/activities">
                    <GraduationCap className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Gerenciar Atividades
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start text-xs sm:text-sm">
                  <Link to="/schedule">
                    <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Editar Cronograma
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
