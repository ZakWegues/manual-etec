import { useParams, Link } from 'react-router-dom';
import { useActivity, useToggleActivityProgress } from '@/hooks/useActivities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, CheckCircle2, Clock, ExternalLink, GraduationCap, Loader2, Youtube } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { ptBR } from 'date-fns/locale';

function getYouTubeEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  
  return null;
}

export default function ActivityDetail() {
  const { subjectId, activityId } = useParams();
  const { data: activity, isLoading } = useActivity(activityId);
  const toggleProgress = useToggleActivityProgress();

  const handleToggle = () => {
    if (!activity) return;
    toggleProgress.mutate({ activityId: activity.id, isCompleted: activity.is_completed });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-lg text-muted-foreground">Atividade não encontrada</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link to={`/subjects/${subjectId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>
    );
  }

  const dueDate = new Date(activity.due_date);
  const isOverdue = isPast(dueDate) && !isToday(dueDate) && !activity.is_completed;
  const isDueToday = isToday(dueDate);
  const embedUrl = getYouTubeEmbedUrl(activity.youtube_url);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" className="mb-4 -ml-4">
          <Link to={`/subjects/${subjectId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para {activity.subject?.name}
          </Link>
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {activity.subject && (
                <Badge
                  style={{
                    backgroundColor: `${activity.subject.color}20`,
                    color: activity.subject.color,
                  }}
                >
                  {activity.subject.name}
                </Badge>
              )}
              {activity.youtube_url && (
                <Badge variant="outline" className="gap-1">
                  <Youtube className="h-3 w-3" />
                  Vídeo disponível
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{activity.title}</h1>
          </div>

          <Button
            onClick={handleToggle}
            variant={activity.is_completed ? 'outline' : 'default'}
            className={activity.is_completed ? 'border-success text-success' : ''}
            disabled={toggleProgress.isPending}
          >
            {toggleProgress.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : activity.is_completed ? (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            ) : null}
            {activity.is_completed ? 'Concluída' : 'Marcar como concluída'}
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card className={`${isOverdue ? 'border-destructive' : isDueToday ? 'border-warning' : activity.is_completed ? 'border-success' : ''}`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Data de entrega</p>
                <p className="font-medium">
                  {format(dueDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            {activity.is_completed ? (
              <Badge className="bg-success text-success-foreground gap-1 text-sm px-3 py-1">
                <CheckCircle2 className="h-4 w-4" />
                Concluída
              </Badge>
            ) : isOverdue ? (
              <Badge variant="destructive" className="gap-1 text-sm px-3 py-1">
                <Clock className="h-4 w-4" />
                Atrasada
              </Badge>
            ) : isDueToday ? (
              <Badge className="bg-warning text-warning-foreground gap-1 text-sm px-3 py-1">
                <Clock className="h-4 w-4" />
                Entrega hoje
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 text-sm px-3 py-1">
                <Clock className="h-4 w-4" />
                Pendente
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {activity.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{activity.description}</p>
          </CardContent>
        </Card>
      )}

      {/* YouTube Video */}
      {embedUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-destructive" />
              Vídeo da Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="youtube-container">
              <iframe
                src={embedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {activity.youtube_url && (
              <Button asChild variant="ghost" className="mt-4" size="sm">
                <a href={activity.youtube_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir no YouTube
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}