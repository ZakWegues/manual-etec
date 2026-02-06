import { useSubjects } from '@/hooks/useSubjects';
import { useActivities } from '@/hooks/useActivities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronRight, GraduationCap, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Subjects() {
  const { data: subjects = [], isLoading } = useSubjects();
  const { data: activities = [] } = useActivities();

  const getSubjectStats = (subjectId: string) => {
    const subjectActivities = activities.filter((a) => a.subject_id === subjectId);
    const completed = subjectActivities.filter((a) => a.is_completed).length;
    return { total: subjectActivities.length, completed };
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
          <BookOpen className="h-8 w-8 text-primary" />
          Matérias
        </h1>
        <p className="text-muted-foreground">
          Explore as matérias e suas atividades
        </p>
      </div>

      {subjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Nenhuma matéria cadastrada</p>
            <p className="text-sm text-muted-foreground/70">
              Aguarde o administrador adicionar as matérias
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const stats = getSubjectStats(subject.id);
            const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

            return (
              <Link key={subject.id} to={`/subjects/${subject.id}`}>
                <Card className="h-full activity-card cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${subject.color}20` }}
                      >
                        <GraduationCap
                          className="h-6 w-6"
                          style={{ color: subject.color }}
                        />
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="mt-3">{subject.name}</CardTitle>
                    {subject.description && (
                      <CardDescription className="line-clamp-2">
                        {subject.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {stats.total} atividades
                        </Badge>
                        {stats.completed > 0 && (
                          <Badge variant="outline" className="text-success border-success">
                            {stats.completed} concluídas
                          </Badge>
                        )}
                      </div>
                    </div>
                    {stats.total > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Progresso</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: subject.color,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}