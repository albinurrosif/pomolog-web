'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { useTimer, DURATION } from '@/app/context/TimerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Volume2, VolumeX, Music, Square } from 'lucide-react';

interface TimerProps {
  onFinishTask: (taskId: number) => Promise<boolean>;
  onReviewTask: (taskId: number, taskTitle: string) => Promise<boolean>;
}

export default function Timer({ onFinishTask, onReviewTask }: TimerProps) {
  const {
    timeLeft,
    isActive,
    mode,
    activeTaskData,
    taskTimeLog,
    volume,
    isMuted,
    isPlayingMusic,
    toggleTimer,
    resetTimer,
    skipBreak,
    setVolume,
    toggleMute,
    stopMusic,
    clearTaskTimeLog,
    setMode,
    setTimeLeft, // Ambil ini untuk fitur "Skip ke Istirahat"
  } = useTimer();

  const [showEarlyFinishModal, setShowEarlyFinishModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCompleteButtonClick = async () => {
    if (isSubmitting || !activeTaskData) return;

    if (timeLeft > 0 && timeLeft < DURATION.FOCUS && mode === 'FOCUS') {
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

  const handleStartPause = () => {
    if (mode === 'FOCUS' && !activeTaskData && !isActive) {
      toast.info('Pilih task dari Antrean terlebih dahulu.');
      return;
    }
    toggleTimer();
  };

  const handleResetOrSkip = () => {
    if (mode !== 'FOCUS') {
      skipBreak();
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

  // UI helper untuk mode
  const getModeLabel = () => {
    if (mode === 'FOCUS') return 'FOCUS SESSION';
    if (mode === 'SHORT_BREAK') return 'SHORT BREAK';
    return 'LONG BREAK'; // Tambahan untuk Long Break
  };

  const getModeColor = () => {
    if (mode === 'FOCUS') return 'text-primary';
    if (mode === 'SHORT_BREAK') return 'text-green-500';
    return 'text-blue-500'; // Warna khusus Long Break
  };

  const getBorderColor = () => {
    if (mode === 'FOCUS') return 'border-primary shadow-primary/30';
    if (mode === 'SHORT_BREAK') return 'border-green-500 shadow-green-500/30';
    return 'border-blue-500 shadow-blue-500/30';
  };

  return (
    <section className="flex flex-col items-center gap-8 w-full pt-0 mt-0">
      <div className="w-full max-w-sm flex justify-between items-center px-4 -mb-4 z-10">
        <div className="flex items-center gap-2 bg-card/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-border">
          <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              if (isMuted) toggleMute();
              setVolume(parseFloat(e.target.value));
            }}
            aria-label="Kontrol Volume"
            title="Volume"
            className="w-16 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {isPlayingMusic && (
          <Button onClick={stopMusic} variant="destructive" size="sm" className="h-8 rounded-full px-3 text-xs font-bold shadow-lg shadow-destructive/20 animate-pulse">
            <Square className="w-3 h-3 mr-1 fill-current" /> Stop Music
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <h2 className={`text-sm font-bold tracking-[0.2em] uppercase flex items-center gap-2 ${getModeColor()}`}>
          {getModeLabel()}
          {isPlayingMusic && <Music className="w-4 h-4 animate-bounce" />}
        </h2>
      </div>

      <div className={`relative flex items-center justify-center w-88 h-88 rounded-full border-16 shadow-2xl transition-all duration-700 bg-background ${getBorderColor()}`}>
        <span className="text-8xl font-mono font-black tracking-tighter text-foreground">{formatTime(timeLeft)}</span>
      </div>

      <Card className="w-full max-w-sm bg-card/50 border-border">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-30 text-center gap-3">
          {mode !== 'FOCUS' ? (
            <p className="text-muted-foreground text-sm font-medium">Jauhkan mata dari layar dan istirahatkan pikiran Anda sejenak.</p>
          ) : activeTaskData ? (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Task</span>
                <span className="font-bold text-xl text-foreground leading-tight">{activeTaskData.title}</span>
              </div>

              {/* PERBAIKAN BUG 1: Tombol Finish hanya muncul jika MODE === FOCUS */}
              {(isActive || timeLeft < DURATION.FOCUS) && mode === 'FOCUS' && (
                <Button onClick={handleCompleteButtonClick} disabled={isSubmitting} variant="outline" size="sm" className="mt-2 text-green-500 border-green-500/30 hover:bg-green-500 hover:text-white transition-all font-bold">
                  Tandai Selesai
                </Button>
              )}
            </>
          ) : timeLeft < DURATION.FOCUS ? (
            <p className="text-amber-500 text-sm font-medium animate-pulse">Sesi masih berjalan. Pilih task baru untuk melanjutkan.</p>
          ) : (
            <p className="text-muted-foreground text-sm italic">Belum ada task yang dipilih.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4 w-full max-w-sm">
        {mode !== 'FOCUS' && isActive ? (
          <Button disabled className="flex-1 h-14 text-lg font-bold uppercase tracking-wider">
            BERJALAN...
          </Button>
        ) : (
          <Button
            onClick={handleStartPause}
            className={`flex-1 h-14 text-lg font-bold uppercase tracking-wider transition-all shadow-lg ${isActive ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/20' : mode === 'FOCUS' ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20' : mode === 'LONG_BREAK' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20' : 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20'}`}
          >
            {isActive ? 'PAUSE' : mode === 'FOCUS' ? (timeLeft < DURATION.FOCUS ? 'RESUME' : 'START SPRINT') : mode === 'LONG_BREAK' ? 'START LONG BREAK' : 'START BREAK'}
          </Button>
        )}

        {mode !== 'FOCUS' ? (
          <Button variant="secondary" onClick={handleResetOrSkip} className="h-14 px-8 font-bold text-muted-foreground hover:text-foreground">
            SKIP
          </Button>
        ) : (
          timeLeft < DURATION.FOCUS && (
            <Button variant="secondary" onClick={handleResetOrSkip} className="h-14 px-8 font-bold text-muted-foreground hover:text-destructive">
              RESET
            </Button>
          )
        )}
      </div>

      {/* DIALOG EARLY FINISH (Diperbarui untuk mengatasi skenario Review) */}
      <Dialog open={showEarlyFinishModal} onOpenChange={(open) => !open && setShowEarlyFinishModal(false)}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle className="text-xl">Selesai Lebih Awal?</DialogTitle>
            <DialogDescription className="pt-2 text-sm">
              {activeTaskData?.title.startsWith('Review: ')
                ? `Review sudah selesai, tapi sisa waktu masih ${formatTime(timeLeft)}. Anda bisa mengakhiri sesi sekarang.`
                : `Task sudah selesai, tapi sisa waktu masih ${formatTime(timeLeft)}. Pantang menyerah sebelum 25 menit. Apa langkah selanjutnya?`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-4">
            {activeTaskData?.title.startsWith('Review: ') ? (
              // TAMPILAN JIKA YANG SELESAI ADALAH TASK REVIEW
              <Button
                disabled={isSubmitting}
                onClick={() =>
                  runWithSubmitLock(async () => {
                    await onFinishTask(activeTaskData.id);
                    // Paksa pindah ke istirahat tanpa menunggu waktu habis
                    setMode('SHORT_BREAK');
                    setTimeLeft(DURATION.SHORT_BREAK);
                    toast.success('Sesi ditutup lebih awal. Selamat beristirahat!');
                    setShowEarlyFinishModal(false);
                  })
                }
                className="h-12 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
              >
                Akhiri Sesi Fokus Sekarang
              </Button>
            ) : (
              // TAMPILAN NORMAL (BUKAN TASK REVIEW)
              <>
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
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
