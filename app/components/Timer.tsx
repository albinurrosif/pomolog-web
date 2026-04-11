'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/app/page';

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
      alert('Tugas dilepas. Timer dijeda otomatis. Pilih tugas untuk melanjutkan sesi.');
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

      console.log('MENGIRIM SESI KE BACKEND:', tasksPayload);

      if (tasksPayload.length > 0) {
        onSessionComplete({
          durationMinutes: 25,
          tasks: tasksPayload,
        });
      } else {
        console.error('Gagal mengirim sesi: Tidak ada waktu yang tercatat untuk tugas apapun.');
      }

      if (activeTask && activeTask.title.startsWith('Review: ')) {
        await onFinishTask(); // finish review task
        alert('Sesi selesai! Tugas Review otomatis ditandai selesai.');
      } else {
        alert('Sesi Fokus Selesai! Kamu dapat 25 menit di Analytics.');
      }
      setMode('BREAK');
      setTimeLeft(BREAK_DURATION);
      setTaskTimeLog({});
    } else {
      alert('Waktu Istirahat Habis! Siap kerja lagi?');
      setMode('FOCUS');
      setTimeLeft(FOCUS_DURATION);
    }
  };

  // LOGIKA TOMBOL SELESAI (EARLY FINISH)
  const handleCompleteButtonClick = async () => {
    // Cegah klik ganda saat proses sedang berjalan
    if (isSubmitting) return;

    // Jika timer masih memiliki sisa waktu dan kita sedang mode Fokus
    if (timeLeft > 0 && timeLeft < FOCUS_DURATION && mode === 'FOCUS') {
      setShowEarlyFinishModal(true);
    } else {
      // Proses selesai normal tanpa modal
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
      alert('Pilih tugas terlebih dahulu dari antrean di bawah untuk melanjutkan sesi!');
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
      if (window.confirm('Batalkan sesi ini? Waktu fokus tidak akan dicatat.')) {
        setIsActive(false);
        setMode('FOCUS');
        setTimeLeft(FOCUS_DURATION);
        setTaskTimeLog({});
      }
    }
  };

  // FUNGSI BANTU UNTUK MENCEGAH KLIK GANDA SAAT PROSES ASINKRON BERJALAN
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
    <section className="flex flex-col items-center gap-6 w-full">
      <div className="text-xl font-bold tracking-widest uppercase">{mode === 'FOCUS' ? <span className="text-red-500">🔥 Sesi Fokus</span> : <span className="text-green-500">☕ Istirahat</span>}</div>

      <div className={`w-64 h-64 rounded-full border-8 flex items-center justify-center shadow-2xl transition-all duration-500 ${mode === 'FOCUS' ? 'border-red-500 shadow-red-500/20' : 'border-green-500 shadow-green-500/20'}`}>
        <span className="text-6xl font-mono font-bold">{formatTime(timeLeft)}</span>
      </div>

      {/* --- AREA TUGAS AKTIF --- */}
      <div className="flex flex-col items-center justify-center min-h-[90px] w-full max-w-md bg-neutral-800/30 rounded-xl p-4 border border-neutral-700/50 text-center">
        {mode === 'BREAK' ? (
          <p className="text-neutral-400 text-sm">Jauhkan mata dari layar dan regangkan badan.</p>
        ) : activeTask ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-neutral-400 text-xs">Sedang Dikerjakan:</span>
            <span className="font-bold text-lg text-white">{activeTask.title}</span>

            {(isActive || (taskTimeLog[activeTask.id] || 0) > 0) && (
              <button onClick={handleCompleteButtonClick} className="mt-1 text-xs bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white px-4 py-1.5 rounded-full transition-colors font-medium border border-green-500/30">
                ✓ Tandai Tugas Selesai
              </button>
            )}
          </div>
        ) : timeLeft < FOCUS_DURATION ? (
          <p className="text-yellow-500 text-sm font-medium animate-pulse">Sisa sesi masih ada! Pilih tugas baru di bawah untuk melanjutkan.</p>
        ) : (
          <p className="text-neutral-400 text-sm italic">Belum ada tugas aktif. Silakan pilih di bawah.</p>
        )}
      </div>

      <div className="flex gap-4">
        {mode === 'BREAK' && isActive ? (
          <button disabled className="bg-neutral-800 text-neutral-500 px-8 py-3 rounded-full font-bold text-lg cursor-not-allowed w-48">
            BERJALAN...
          </button>
        ) : (
          <button
            onClick={handleStartPause}
            className={`px-8 py-3 rounded-full font-bold text-lg transition-all w-48 ${isActive ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : mode === 'FOCUS' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {isActive ? 'PAUSE' : mode === 'FOCUS' ? (timeLeft < FOCUS_DURATION ? 'RESUME' : 'START FOKUS') : 'MULAI ISTIRAHAT'}
          </button>
        )}

        {mode === 'BREAK' ? (
          <button onClick={handleResetOrSkip} className="bg-neutral-800 px-8 py-3 rounded-full font-bold text-lg hover:text-green-400 transition-colors">
            LEWATI
          </button>
        ) : (
          timeLeft < FOCUS_DURATION && (
            <button onClick={handleResetOrSkip} className="bg-neutral-800 px-8 py-3 rounded-full font-bold text-lg hover:text-red-400 transition-colors">
              RESET
            </button>
          )
        )}
      </div>
      {/* --- MODAL EARLY FINISH --- */}
      {showEarlyFinishModal && activeTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-700 p-6 rounded-2xl max-w-sm text-center shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Kerja Cepat! ⚡</h3>
            <p className="text-neutral-400 text-sm mb-6">
              Tugas selesai, tapi pantang menyerah sebelum 25 menit. Sisa waktu: <span className="text-yellow-500 font-bold">{formatTime(timeLeft)}</span>. Apa yang ingin kamu lakukan selanjutnya?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  await onFinishTask(); // Selesaikan tugas lama
                  setShowEarlyFinishModal(false); // Tutup modal
                  // Auto-pause akan menyala otomatis karena activeTask jadi null
                }}
                className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 py-3 rounded-lg font-bold transition-colors text-sm"
              >
                Lanjut Tugas Lain (Pilih Manual)
              </button>
              {!activeTask.title.startsWith('Review: ') && (
                <button
                  onClick={() =>
                    runWithSubmitLock(async () => {
                      await onReviewTask();
                      setShowEarlyFinishModal(false);
                    })
                  }
                  className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold transition-colors text-sm shadow-lg shadow-red-500/20"
                >
                  Review Pekerjaan Ini
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
