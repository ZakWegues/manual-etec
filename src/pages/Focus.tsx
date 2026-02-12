import { useState, useEffect, useCallback, useRef } from 'react';
import { useSubjects } from '@/hooks/useSubjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Timer, Play, Pause, RotateCcw, SkipForward, Settings2 } from 'lucide-react';

type FocusPhase = 'study' | 'break';

interface FocusSession {
  subject: string;
  duration: number;
  date: string;
}

const STORAGE_KEY = 'manual-etec-focus-sessions';

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 1000;
      gain2.gain.value = 0.3;
      osc2.start();
      osc2.stop(ctx.currentTime + 0.3);
    }, 350);
  } catch {}
}

export default function Focus() {
  const { data: subjects = [] } = useSubjects();
  const [subjectId, setSubjectId] = useState('');
  const [studyMinutes, setStudyMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [showSettings, setShowSettings] = useState(false);

  const [phase, setPhase] = useState<FocusPhase>('study');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState<FocusSession[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(phase === 'study' ? studyMinutes * 60 : breakMinutes * 60);
    }
  }, [studyMinutes, breakMinutes]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            playBeep();
            handlePhaseEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handlePhaseEnd = useCallback(() => {
    setIsRunning(false);
    if (phase === 'study') {
      // Save session
      const subjectName = subjects.find(s => s.id === subjectId)?.name || 'Sem matéria';
      const newSession: FocusSession = {
        subject: subjectName,
        duration: studyMinutes,
        date: new Date().toISOString(),
      };
      const updated = [newSession, ...sessions].slice(0, 20);
      setSessions(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Switch to break
      setPhase('break');
      setTimeLeft(breakMinutes * 60);
    } else {
      setPhase('study');
      setTimeLeft(studyMinutes * 60);
    }
  }, [phase, subjectId, subjects, studyMinutes, breakMinutes, sessions]);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(phase === 'study' ? studyMinutes * 60 : breakMinutes * 60);
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (phase === 'study') {
      setPhase('break');
      setTimeLeft(breakMinutes * 60);
    } else {
      setPhase('study');
      setTimeLeft(studyMinutes * 60);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalTime = phase === 'study' ? studyMinutes * 60 : breakMinutes * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const todaySessions = sessions.filter(s => {
    const d = new Date(s.date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Timer className="h-8 w-8 text-primary" />
          Modo Foco
        </h1>
        <p className="text-muted-foreground mt-1">Timer Pomodoro para sessões de estudo concentrado</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timer */}
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Badge variant={phase === 'study' ? 'default' : 'secondary'} className="mb-6 text-sm">
              {phase === 'study' ? '📚 Estudo' : '☕ Pausa'}
            </Badge>

            {/* Circular progress */}
            <div className="relative w-56 h-56 mb-8">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" className="stroke-muted" strokeWidth="4" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  className="stroke-primary"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-mono font-bold tabular-nums">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={handleReset} title="Resetar">
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                className="h-14 w-14 rounded-full"
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
              </Button>
              <Button variant="outline" size="icon" onClick={handleSkip} title="Pular fase">
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            {/* Subject selector */}
            <div className="mt-6 w-full max-w-xs">
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma matéria (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar info */}
        <div className="space-y-4">
          {/* Settings */}
          <Card>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowSettings(!showSettings)}>
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Configurações
              </CardTitle>
            </CardHeader>
            {showSettings && (
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Estudo (min)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    value={studyMinutes}
                    onChange={e => setStudyMinutes(Number(e.target.value) || 25)}
                    disabled={isRunning}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Pausa (min)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={breakMinutes}
                    onChange={e => setBreakMinutes(Number(e.target.value) || 5)}
                    disabled={isRunning}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Today's stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayMinutes} min</div>
              <p className="text-xs text-muted-foreground">{todaySessions.length} sessão(ões)</p>
            </CardContent>
          </Card>

          {/* Recent sessions */}
          {sessions.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Sessões Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sessions.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground truncate">{s.subject}</span>
                      <span className="font-medium">{s.duration}min</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
