'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/app/page';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TimerProps {
  activeTask: Task | null;
  onFinishTask: () => Promise<void>;
  onSessionComplete: (payload: { durationMinutes: number; tasks: { taskId: number; minutesSpent: number }[] }) => void;
  onReviewTask: () => Promise<void>;
}

const FOCUS_DURATION = 25 * 60; // 25 menit dalam detik
const BREAK_DURATION = 5 * 60; // 5 menit dalam detik

export default function Timer({ activeTask, onFinishTask, onSessionComplete, onReviewTask }: TimerProps) {
  const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [taskTimeLog, setTaskTimeLog] = useState<Record<number, number>>({});
  const [showEarlyFinishModal, setShowEarlyFinishModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PELINDUNG ANTI-REFRESH
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isActive && mode === 'FOCUS') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isActive, mode]);

  // TIMER UTAMA
  useEffect(() => {
    let interval: NodeJS.Timeout;

    // AUTO-PAUSE
    if (isActive && mode === 'FOCUS' && !activeTask) {
      setIsActive(false);
      toast.info('Task dilepas. Timer dijeda otomatis. Pilih task lain untuk melanjutkan.');
      return;
    }

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);

        if (activeTask && mode === 'FOCUS') {
          setTaskTimeLog((prev) => ({
            ...prev,
            [activeTask.id]: (prev[activeTask.id] || 0) + 1,
          }));
        }
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleSessionEnd();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, activeTask]);

  // LOGIKA SELESAI SESI
  const handleSessionEnd = async () => {
    setIsActive(false);

    if (mode === 'FOCUS') {
      const tasksPayload = Object.entries(taskTimeLog).map(([idStr, seconds]) => ({
        taskId: Number(idStr),
        minutesSpent: Math.max(1, Math.round(seconds / 60)),
      }));

      if (tasksPayload.length > 0) {
        onSessionComplete({
          durationMinutes: 25,
          tasks: tasksPayload,
        });
      } else {
        console.error('Gagal mengirim sesi: Tidak ada waktu yang tercatat.');
      }

      if (activeTask && activeTask.title.startsWith('Review: ')) {
        await onFinishTask();
        toast.success('Sesi selesai. Task Review otomatis ditandai Done.');
      } else {
        toast.success('Sesi Fokus Selesai. 25 menit ditambahkan ke Analytics.');
      }

      setMode('BREAK');
      setTimeLeft(BREAK_DURATION);
      setTaskTimeLog({});
    } else {
      toast.info('Waktu istirahat habis. Siap untuk sprint berikutnya?');
      setMode('FOCUS');
      setTimeLeft(FOCUS_DURATION);
    }
  };

  // LOGIKA TOMBOL SELESAI (EARLY FINISH)
  const handleCompleteButtonClick = async () => {
    if (isSubmitting) return;

    if (timeLeft > 0 && timeLeft < FOCUS_DURATION && mode === 'FOCUS') {
      setShowEarlyFinishModal(true);
    } else {
      setIsSubmitting(true);
      try {
        await onFinishTask();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // LOGIKA TOMBOL START/PAUSE
  const handleStartPause = () => {
    if (mode === 'FOCUS' && !activeTask && !isActive) {
      toast.info('Pilih task dari Backlog terlebih dahulu.');
      return;
    }
    setIsActive(!isActive);
  };

  // LOGIKA TOMBOL RESET/SKIP
  const handleResetOrSkip = () => {
    if (mode === 'BREAK') {
      setIsActive(false);
      setMode('FOCUS');
      setTimeLeft(FOCUS_DURATION);
    } else {
      if (window.confirm('Batalkan sesi ini? Waktu fokus tidak akan dicatat ke Analytics.')) {
        setIsActive(false);
        setMode('FOCUS');
        setTimeLeft(FOCUS_DURATION);
        setTaskTimeLog({});
      }
    }
  };

  const runWithSubmitLock = async (action: () => Promise<void>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await action();
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section className="flex flex-col items-center gap-8 w-full pt-0 mt-0">
      {/* LABEL MODE */}
      <div className="flex flex-col items-center gap-2">
        <h2 className={`text-sm font-bold tracking-[0.2em] uppercase ${mode === 'FOCUS' ? 'text-primary' : 'text-green-500'}`}>{mode === 'FOCUS' ? 'FOCUS SESSION' : 'SHORT BREAK'}</h2>
      </div>

      {/* LINGKARAN TIMER (Diperbesar & Ditebalkan) */}
      <div
        className={`
    relative flex items-center justify-center
    w-[22rem] h-[22rem] rounded-full
    border-[16px] shadow-2xl
    transition-all duration-700
    ${mode === 'FOCUS' ? 'border-primary shadow-primary/30 bg-background' : 'border-green-500 shadow-green-500/30 bg-background'}
  `}
      >
        <span className="text-8xl font-mono font-black tracking-tighter text-foreground">{formatTime(timeLeft)}</span>
      </div>

      {/* AREA TASK AKTIF */}
      <Card className="w-full max-w-sm bg-card/50 border-border">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[120px] text-center gap-3">
          {mode === 'BREAK' ? (
            <p className="text-muted-foreground text-sm font-medium">Jauhkan mata dari layar dan regangkan badan.</p>
          ) : activeTask ? (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Task</span>
                <span className="font-bold text-xl text-foreground leading-tight">{activeTask.title}</span>
              </div>

              {(isActive || (taskTimeLog[activeTask.id] || 0) > 0) && (
                <Button onClick={handleCompleteButtonClick} disabled={isSubmitting} variant="outline" size="sm" className="mt-2 text-green-500 border-green-500/30 hover:bg-green-500 hover:text-white transition-all font-bold">
                  Tandai Selesai
                </Button>
              )}
            </>
          ) : timeLeft < FOCUS_DURATION ? (
            <p className="text-amber-500 text-sm font-medium animate-pulse">Sesi masih berjalan. Pilih task baru untuk melanjutkan.</p>
          ) : (
            <p className="text-muted-foreground text-sm italic">Belum ada task yang dipilih.</p>
          )}
        </CardContent>
      </Card>

      {/* TOMBOL KONTROL UTAMA */}
      <div className="flex gap-4 w-full max-w-sm">
        {mode === 'BREAK' && isActive ? (
          <Button disabled className="flex-1 h-14 text-lg font-bold uppercase tracking-wider">
            BERJALAN...
          </Button>
        ) : (
          <Button
            onClick={handleStartPause}
            className={`flex-1 h-14 text-lg font-bold uppercase tracking-wider transition-all shadow-lg ${isActive ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/20' : mode === 'FOCUS' ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20' : 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20'}`}
          >
            {isActive ? 'PAUSE' : mode === 'FOCUS' ? (timeLeft < FOCUS_DURATION ? 'RESUME' : 'START SPRINT') : 'START BREAK'}
          </Button>
        )}

        {mode === 'BREAK' ? (
          <Button variant="secondary" onClick={handleResetOrSkip} className="h-14 px-8 font-bold text-muted-foreground hover:text-foreground">
            SKIP
          </Button>
        ) : (
          timeLeft < FOCUS_DURATION && (
            <Button variant="secondary" onClick={handleResetOrSkip} className="h-14 px-8 font-bold text-muted-foreground hover:text-destructive">
              RESET
            </Button>
          )
        )}
      </div>

      {/* SHADCN DIALOG: EARLY FINISH */}
      <Dialog open={showEarlyFinishModal} onOpenChange={(open) => !open && setShowEarlyFinishModal(false)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Selesai Lebih Awal?</DialogTitle>
            <DialogDescription className="pt-2 text-sm">
              Task sudah selesai, tapi sisa waktu masih <span className="text-amber-500 font-bold">{formatTime(timeLeft)}</span>. Pantang menyerah sebelum 25 menit. Apa langkah selanjutnya?
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-4">
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() =>
                runWithSubmitLock(async () => {
                  await onFinishTask();
                  setShowEarlyFinishModal(false);
                })
              }
              className="h-12 font-semibold"
            >
              Pilih Task Lain Manual
            </Button>

            {!activeTask?.title.startsWith('Review: ') && (
              <Button
                disabled={isSubmitting}
                onClick={() =>
                  runWithSubmitLock(async () => {
                    await onReviewTask();
                    setShowEarlyFinishModal(false);
                  })
                }
                className="h-12 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
              >
                Review Pekerjaan Ini
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
