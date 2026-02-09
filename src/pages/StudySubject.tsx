import { useParams, useNavigate } from 'react-router-dom';
import { useSubjects } from '@/hooks/useSubjects';
import { useStudyVideos } from '@/hooks/useStudyVideos';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^?&]+)/);
  return match?.[1] ?? null;
}

export default function StudySubject() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const { data: subjects = [], isLoading: loadingSubjects } = useSubjects();
  const { videos, isLoading: loadingVideos } = useStudyVideos(subjectId);

  const subject = subjects.find((s) => s.id === subjectId);

  if (loadingSubjects || loadingVideos) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate('/study')} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <h1 className="text-2xl font-bold">{subject?.name || 'Matéria'} — Estudo</h1>

      {videos.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">Nenhum vídeo disponível para esta matéria.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {videos.map((video) => {
            const ytId = getYouTubeId(video.youtube_url);
            return (
              <Card key={video.id} className="overflow-hidden">
                {ytId ? (
                  <div className="aspect-video">
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-muted">
                    <PlayCircle className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold">{video.title}</h3>
                  {video.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{video.description}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
