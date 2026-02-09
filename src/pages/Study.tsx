import { useSubjects } from '@/hooks/useSubjects';
import { useStudyVideos } from '@/hooks/useStudyVideos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function Study() {
  const { data: subjects = [], isLoading: loadingSubjects } = useSubjects();
  const { videos, isLoading: loadingVideos } = useStudyVideos();
  const navigate = useNavigate();

  const getVideoCount = (subjectId: string) =>
    videos.filter((v) => v.subject_id === subjectId).length;

  if (loadingSubjects || loadingVideos) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Estudo</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const subjectsWithVideos = subjects.filter((s) => getVideoCount(s.id) > 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Estudo</h1>
      <p className="text-muted-foreground">Selecione uma matéria para acessar os vídeos de estudo.</p>

      {subjectsWithVideos.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">Nenhum vídeo de estudo disponível ainda.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjectsWithVideos.map((subject) => (
            <Card
              key={subject.id}
              className="cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() => navigate(`/study/${subject.id}`)}
            >
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: subject.color || '#3B82F6' }}
                >
                  <PlayCircle className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">{subject.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {getVideoCount(subject.id)} vídeo(s) disponível(is)
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
