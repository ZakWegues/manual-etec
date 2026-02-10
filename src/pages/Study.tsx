import { useSubjects } from '@/hooks/useSubjects';
import { useStudyVideos } from '@/hooks/useStudyVideos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, ChevronRight, Loader2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Study() {
  const { data: subjects = [], isLoading: loadingSubjects } = useSubjects();
  const { videos, isLoading: loadingVideos } = useStudyVideos();

  const getContentCount = (subjectId: string) =>
    videos.filter((v) => v.subject_id === subjectId).length;

  if (loadingSubjects || loadingVideos) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const subjectsWithVideos = subjects.filter((s) => getContentCount(s.id) > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <PlayCircle className="h-8 w-8 text-primary" />
          Estudo
        </h1>
        <p className="text-muted-foreground">
          Selecione uma matéria para acessar os conteúdos de estudo
        </p>
      </div>

      {subjectsWithVideos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PlayCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Nenhum conteúdo de estudo disponível</p>
            <p className="text-sm text-muted-foreground/70">
              Aguarde o administrador adicionar conteúdos de estudo
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjectsWithVideos.map((subject) => {
            const count = getContentCount(subject.id);

            return (
              <Link key={subject.id} to={`/study/${subject.id}`}>
                <Card className="h-full activity-card cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${subject.color}20` }}
                      >
                        <PlayCircle
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
                    <Badge variant="secondary">
                      {count} {count === 1 ? 'conteúdo' : 'conteúdos'}
                    </Badge>
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
