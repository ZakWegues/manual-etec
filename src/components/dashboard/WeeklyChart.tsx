import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ActivityWithProgress } from '@/types/database';
import { startOfWeek, subWeeks, isAfter, isBefore, addWeeks, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeeklyChartProps {
  activities: ActivityWithProgress[];
}

export function WeeklyChart({ activities }: WeeklyChartProps) {
  const data = useMemo(() => {
    const now = new Date();
    const weeks = [];

    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const weekEnd = addWeeks(weekStart, 1);

      const completed = activities.filter(a => {
        if (!a.is_completed) return false;
        const dueDate = new Date(a.due_date);
        return isAfter(dueDate, weekStart) && isBefore(dueDate, weekEnd);
      }).length;

      const total = activities.filter(a => {
        const dueDate = new Date(a.due_date);
        return isAfter(dueDate, weekStart) && isBefore(dueDate, weekEnd);
      }).length;

      weeks.push({
        name: format(weekStart, "dd/MM", { locale: ptBR }),
        concluídas: completed,
        total,
      });
    }

    return weeks;
  }, [activities]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Atividades por Semana</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--card-foreground))',
              }}
            />
            <Bar dataKey="total" fill="hsl(var(--muted-foreground) / 0.3)" radius={[4, 4, 0, 0]} name="Total" />
            <Bar dataKey="concluídas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Concluídas" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
