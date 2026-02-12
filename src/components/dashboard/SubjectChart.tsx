import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ActivityWithProgress } from '@/types/database';

interface SubjectChartProps {
  activities: ActivityWithProgress[];
}

export function SubjectChart({ activities }: SubjectChartProps) {
  const data = useMemo(() => {
    const subjectMap = new Map<string, { name: string; count: number; color: string }>();

    activities.forEach(a => {
      const name = a.subject?.name || 'Sem matéria';
      const color = a.subject?.color || '#94a3b8';
      const existing = subjectMap.get(name);
      if (existing) {
        existing.count++;
      } else {
        subjectMap.set(name, { name, count: 1, color });
      }
    });

    return Array.from(subjectMap.values());
  }, [activities]);

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Atividades por Matéria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--card-foreground))',
              }}
            />
            <Legend
              formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
