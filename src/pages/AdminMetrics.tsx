import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, Loader2, Users, CheckCircle2, BookOpen } from 'lucide-react';

function useAdminMetrics() {
  return useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const [profilesRes, activitiesRes, progressRes, subjectsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('activities').select('id, subject_id, title, subject:subjects(name, color)'),
        supabase.from('activity_progress').select('activity_id'),
        supabase.from('subjects').select('id, name, color'),
      ]);

      const totalUsers = profilesRes.count || 0;
      const activities = activitiesRes.data || [];
      const progress = progressRes.data || [];
      const subjects = subjectsRes.data || [];

      // Completion rate per subject
      const subjectStats = subjects.map(s => {
        const subjectActivities = activities.filter(a => a.subject_id === s.id);
        const completedCount = progress.filter(p =>
          subjectActivities.some(a => a.id === p.activity_id)
        ).length;
        const total = subjectActivities.length * Math.max(totalUsers, 1);
        return {
          name: s.name,
          color: s.color || '#94a3b8',
          taxa: total > 0 ? Math.round((completedCount / total) * 100) : 0,
          atividades: subjectActivities.length,
        };
      });

      // Most accessed activities
      const activityCounts = new Map<string, number>();
      progress.forEach(p => {
        activityCounts.set(p.activity_id, (activityCounts.get(p.activity_id) || 0) + 1);
      });
      const topActivities = activities
        .map(a => ({ title: a.title, subject: (a.subject as any)?.name || '', count: activityCounts.get(a.id) || 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const overallRate = activities.length > 0 && totalUsers > 0
        ? Math.round((progress.length / (activities.length * totalUsers)) * 100)
        : 0;

      return { totalUsers, totalActivities: activities.length, overallRate, subjectStats, topActivities };
    },
  });
}

export default function AdminMetrics() {
  const { data, isLoading } = useAdminMetrics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          Métricas
        </h1>
        <p className="text-muted-foreground mt-1">Estatísticas de uso da plataforma</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividades</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalActivities}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Geral</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overallRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Completion by Subject */}
      {data.subjectStats.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Taxa de Conclusão por Matéria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.subjectStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--card-foreground))' }} />
                <Bar dataKey="taxa" name="Taxa (%)" radius={[4, 4, 0, 0]}>
                  {data.subjectStats.map((entry, i) => (
                    <rect key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Activities */}
      {data.topActivities.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Atividades Mais Acessadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topActivities.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.subject}</p>
                  </div>
                  <span className="text-sm font-medium">{a.count} conclusões</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
