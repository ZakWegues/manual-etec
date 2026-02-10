import { useParams, Link } from 'react-router-dom';
import { useActivity, useToggleActivityProgress } from '@/hooks/useActivities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, CheckCircle2, Clock, ExternalLink, FileText, GraduationCap, Loader2, Youtube } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { ptBR } from 'date-fns/locale';

function getYouTubeEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
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

  // Get all resources
  const allResources = activity.videos && activity.videos.length > 0
    ? activity.videos.map(v => ({
        url: v.youtube_url,
        title: v.title,
        type: (v as any).type || 'video',
        file_url: (v as any).file_url,
      }))
    : activity.youtube_url
      ? [{ url: activity.youtube_url, title: null, type: 'video', file_url: null }]
      : [];

  const videoResources = allResources.filter(r => r.type === 'video');
  const pdfResources = allResources.filter(r => r.type === 'pdf');
  const hasResources = allResources.length > 0;

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
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {activity.subject && (
                <Badge style={{ backgroundColor: `${activity.subject.color}20`, color: activity.subject.color }}>
                  {activity.subject.name}
                </Badge>
              )}
              {videoResources.length > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Youtube className="h-3 w-3" />
                  {videoResources.length} vídeo{videoResources.length > 1 ? 's' : ''}
                </Badge>
              )}
              {pdfResources.length > 0 && (
                <Badge variant="outline" className="gap-1">
                  <FileText className="h-3 w-3" />
                  {pdfResources.length} PDF{pdfResources.length > 1 ? 's' : ''}
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

      {/* YouTube Videos */}
      {videoResources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-destructive" />
              {videoResources.length > 1 ? `Vídeos (${videoResources.length})` : 'Vídeo'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {videoResources.map((video, index) => {
              const embedUrl = getYouTubeEmbedUrl(video.url);
              if (!embedUrl) return null;
              return (
                <div key={index} className="space-y-2">
                  {video.title && (
                    <h4 className="font-medium text-sm text-muted-foreground">
                      {videoResources.length > 1 ? `${index + 1}. ` : ''}{video.title}
                    </h4>
                  )}
                  <div className="youtube-container">
                    <iframe src={embedUrl} title={video.title || `Vídeo ${index + 1}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <a href={video.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir no YouTube
                    </a>
                  </Button>
                  {index < videoResources.length - 1 && <div className="border-b pt-4" />}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* PDFs */}
      {pdfResources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {pdfResources.length > 1 ? `PDFs (${pdfResources.length})` : 'PDF'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pdfResources.map((pdf, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <FileText className="h-8 w-8 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{pdf.title || `PDF ${index + 1}`}</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href={pdf.file_url!} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir
                  </a>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
