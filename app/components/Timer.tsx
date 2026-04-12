'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useTimer } from '@/app/context/TimerContext';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TimerProps {
  onFinishTask: (taskId: number) => Promise<boolean>;
  onSessionComplete: (payload: { durationMinutes: number; tasks: { taskId: number; minutesSpent: number }[] }) => Promise<boolean>;
  onReviewTask: (taskId: number, taskTitle: string) => Promise<boolean>;
}

const FOCUS_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

export default function Timer({ onFinishTask, onSessionComplete, onReviewTask }: TimerProps) {
  // Ambil state dan fungsi dari TimerContext
  const { timeLeft, isActive, mode, activeTaskData, taskTimeLog, toggleTimer, resetTimer, setMode, setTimeLeft, clearTaskTimeLog } = useTimer();

  const [showEarlyFinishModal, setShowEarlyFinishModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. PELINDUNG ANTI-REFRESH
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

  // 2. DETEKSI TIMER HABIS (00:00) & LOGIKA SELESAI SESI
  const prevTimeRef = useRef(timeLeft);

  useEffect(() => {
    const handleSessionEnd = async () => {
      if (mode === 'FOCUS') {
        const tasksPayload = Object.entries(taskTimeLog).map(([idStr, minutes]) => ({
          taskId: Number(idStr),
          minutesSpent: Math.max(1, minutes),
        }));

        if (tasksPayload.length > 0) {
          const isRecorded = await onSessionComplete({
            durationMinutes: 25,
            tasks: tasksPayload,
          });

          if (!isRecorded) return;
        }

        if (activeTaskData && activeTaskData.title.startsWith('Review: ')) {
          await onFinishTask(activeTaskData.id);
          toast.success('Sesi selesai. Task Review otomatis ditandai Done.');
        } else {
          toast.success('Sesi Fokus Selesai. 25 menit ditambahkan ke Analytics.');
        }

        setMode('SHORT_BREAK');
        setTimeLeft(BREAK_DURATION);
        clearTaskTimeLog();
      } else {
        toast.info('Waktu istirahat habis. Siap untuk sprint berikutnya?');
        setMode('FOCUS');
        setTimeLeft(FOCUS_DURATION);
      }
    };

    if (prevTimeRef.current > 0 && timeLeft === 0 && !isActive) {
      handleSessionEnd();
    }
    prevTimeRef.current = timeLeft;
  }, [timeLeft, isActive, mode, taskTimeLog, activeTaskData, onFinishTask, onSessionComplete, setMode, setTimeLeft, clearTaskTimeLog]);

  // LOGIKA TOMBOL SELESAI AWAL (EARLY FINISH)
  const handleCompleteButtonClick = async () => {
    if (isSubmitting || !activeTaskData) return;

    if (timeLeft > 0 && timeLeft < FOCUS_DURATION && mode === 'FOCUS') {
      setShowEarlyFinishModal(true);
    } else {
      setIsSubmitting(true);
      try {
        await onFinishTask(activeTaskData.id);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // LOGIKA TOMBOL START/PAUSE
  const handleStartPause = () => {
    if (mode === 'FOCUS' && !activeTaskData && !isActive) {
      toast.info('Pilih task dari Antrean terlebih dahulu.');
      return;
    }
    toggleTimer();
  };

  // LOGIKA TOMBOL RESET/SKIP
  const handleResetOrSkip = () => {
    if (mode === 'SHORT_BREAK') {
      setMode('FOCUS');
      setTimeLeft(FOCUS_DURATION);
      if (isActive) toggleTimer();
    } else {
      if (window.confirm('Batalkan sesi ini? Waktu fokus tidak akan dicatat ke Analytics.')) {
        resetTimer();
        clearTaskTimeLog();
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
      <div className="flex flex-col items-center gap-2">
        <h2 className={`text-sm font-bold tracking-[0.2em] uppercase ${mode === 'FOCUS' ? 'text-primary' : 'text-green-500'}`}>{mode === 'FOCUS' ? 'FOCUS SESSION' : 'SHORT BREAK'}</h2>
      </div>

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

      <Card className="w-full max-w-sm bg-card/50 border-border">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[120px] text-center gap-3">
          {mode === 'SHORT_BREAK' ? (
            <p className="text-muted-foreground text-sm font-medium">Jauhkan mata dari layar dan regangkan badan.</p>
          ) : activeTaskData ? (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Task</span>
                <span className="font-bold text-xl text-foreground leading-tight">{activeTaskData.title}</span>
              </div>

              {(isActive || (taskTimeLog[activeTaskData.id] || 0) > 0) && (
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

      <div className="flex gap-4 w-full max-w-sm">
        {mode === 'SHORT_BREAK' && isActive ? (
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

        {mode === 'SHORT_BREAK' ? (
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
                  if (activeTaskData) await onFinishTask(activeTaskData.id);
                  setShowEarlyFinishModal(false);
                })
              }
              className="h-12 font-semibold"
            >
              Pilih Task Lain Manual
            </Button>

            {!activeTaskData?.title.startsWith('Review: ') && (
              <Button
                disabled={isSubmitting}
                onClick={() =>
                  runWithSubmitLock(async () => {
                    if (activeTaskData) await onReviewTask(activeTaskData.id, activeTaskData.title);
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
