import { useState } from 'react';
import { useRanking, RankingEntry } from '@/hooks/useRanking';
import { useSubjects } from '@/hooks/useSubjects';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp, CheckCircle2, Clock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

function getInitials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function PodiumCard({ entry, position }: { entry: RankingEntry; position: number }) {
  const config = {
    1: { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/30', size: 'h-16 w-16 sm:h-20 sm:w-20', order: 'order-2', height: 'pt-0' },
    2: { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/30', size: 'h-14 w-14 sm:h-16 sm:w-16', order: 'order-1', height: 'pt-6 sm:pt-8' },
    3: { icon: Award, color: 'text-amber-700', bg: 'bg-amber-700/10 border-amber-700/30', size: 'h-12 w-12 sm:h-14 sm:w-14', order: 'order-3', height: 'pt-8 sm:pt-12' },
  }[position]!;

  return (
    <div className={cn('flex flex-col items-center gap-2', config.order, config.height)}>
      <div className="relative">
        <Avatar className={cn(config.size, 'border-2', config.bg)}>
          <AvatarImage src={entry.avatar_url || undefined} />
          <AvatarFallback className="text-sm font-bold">{getInitials(entry.full_name)}</AvatarFallback>
        </Avatar>
        <div className={cn('absolute -top-2 -right-2 rounded-full p-1', config.bg)}>
          <config.icon className={cn('h-4 w-4 sm:h-5 sm:w-5', config.color)} />
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold text-sm sm:text-base truncate max-w-[100px] sm:max-w-[140px]">
          {entry.full_name || 'Anônimo'}
        </p>
        <Badge variant="secondary" className="text-xs font-bold">
          {entry.total_score} pts
        </Badge>
      </div>
    </div>
  );
}

function RankingRow({ entry, isCurrentUser }: { entry: RankingEntry; isCurrentUser: boolean }) {
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg border transition-colors',
      isCurrentUser ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50'
    )}>
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
        {entry.rank_position}
      </div>
      <Avatar className="h-9 w-9">
        <AvatarImage src={entry.avatar_url || undefined} />
        <AvatarFallback className="text-xs">{getInitials(entry.full_name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {entry.full_name || 'Anônimo'}
          {isCurrentUser && <span className="text-primary ml-1">(você)</span>}
        </p>
        <div className="flex gap-3 text-[10px] sm:text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> {entry.activities_completed}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {entry.on_time_count} no prazo
          </span>
          {entry.avg_grade > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" /> {entry.avg_grade}%
            </span>
          )}
        </div>
      </div>
      <Badge variant="outline" className="font-bold text-xs">
        {entry.total_score} pts
      </Badge>
    </div>
  );
}

export default function Ranking() {
  const [selectedSubject, setSelectedSubject] = useState<string>('global');
  const { data: subjects = [] } = useSubjects();
  const { data: rankings = [], isLoading } = useRanking(
    selectedSubject === 'global' ? null : selectedSubject
  );
  const { user } = useAuth();

  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3, 10);
  const currentUserEntry = rankings.find(r => r.user_id === user?.id);
  const isCurrentUserInTop10 = currentUserEntry && currentUserEntry.rank_position <= 10;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-500" />
            Ranking
          </h1>
          <p className="text-sm text-muted-foreground">Veja quem está se destacando!</p>
        </div>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por matéria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="global">Ranking Geral</SelectItem>
            {subjects.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Scoring info */}
      <Card>
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Como funciona a pontuação
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> Atividade: +10pts</div>
            <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-blue-500" /> No prazo: +5pts</div>
            <div className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> Nota: até 10pts</div>
            <div className="flex items-center gap-1"><Award className="h-3 w-3 text-purple-500" /> Social: +2-5pts</div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando ranking...</div>
      ) : rankings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum dado de ranking ainda</p>
            <p className="text-sm">Complete atividades e registre notas para aparecer aqui!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Podium */}
          {top3.length > 0 && (
            <Card>
              <CardContent className="pt-6 pb-4">
                <div className="flex justify-center items-end gap-4 sm:gap-8">
                  {top3.length >= 2 && <PodiumCard entry={top3[1]} position={2} />}
                  <PodiumCard entry={top3[0]} position={1} />
                  {top3.length >= 3 && <PodiumCard entry={top3[2]} position={3} />}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rest of ranking */}
          {rest.length > 0 && (
            <Card>
              <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-4 pb-2">
                <CardTitle className="text-base">4º - 10º Lugar</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4 space-y-2">
                {rest.map(entry => (
                  <RankingRow
                    key={entry.user_id}
                    entry={entry}
                    isCurrentUser={entry.user_id === user?.id}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Current user position if not in top 10 */}
          {currentUserEntry && !isCurrentUserInTop10 && (
            <Card className="border-primary/30">
              <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-4 pb-2">
                <CardTitle className="text-base">Sua posição</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4">
                <RankingRow entry={currentUserEntry} isCurrentUser />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
