'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../lib/api';

export const DURATION = {
  FOCUS: 25 * 60,
  SHORT_BREAK: 5 * 60,
  LONG_BREAK: 15 * 60,
};

interface TaskData {
  id: number;
  title: string;
}

interface TimerContextType {
  timeLeft: number;
  isActive: boolean;
  mode: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
  activeTaskData: TaskData | null;
  taskTimeLog: Record<number, number>;
  volume: number;
  isMuted: boolean;
  isPlayingMusic: boolean;
  shouldRefreshTasks: number;

  toggleTimer: () => void;
  resetTimer: () => void;
  skipBreak: () => void;
  setMode: (mode: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK') => void;
  setActiveTaskData: (task: TaskData | null) => void;
  setTimeLeft: (time: number) => void;
  clearTaskTimeLog: () => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  stopMusic: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timeLeft, setTimeLeft] = useState(DURATION.FOCUS);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'>('FOCUS');
  const [activeTaskData, setActiveTaskData] = useState<TaskData | null>(null);
  const [taskTimeLog, setTaskTimeLog] = useState<Record<number, number>>({});
  const [shouldRefreshTasks, setShouldRefreshTasks] = useState(0);
  const [focusCycleCount, setFocusCycleCount] = useState<number>(0);

  const [volume, setVolume] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevTimeLeftRef = useRef<number>(DURATION.FOCUS); // ✅ Untuk hitung waktu dinamis
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);

  // INISIALISASI AUDIO
  useEffect(() => {
    bellAudioRef.current = new Audio('/audio/universfield-school-bell-199584.mp3');
    musicAudioRef.current = new Audio('/audio/Different Heaven - Safe & Sound [NCS Release].mp3');

    const handleMusicEnded = () => setIsPlayingMusic(false);
    musicAudioRef.current.addEventListener('ended', handleMusicEnded);

    return () => {
      bellAudioRef.current?.pause();
      musicAudioRef.current?.pause();
      musicAudioRef.current?.removeEventListener('ended', handleMusicEnded);
    };
  }, []);

  // LOGIC UNTUK MENGATUR VOLUME AUDIO SESUAI PENGATURAN USER
  useEffect(() => {
    const actualVolume = isMuted ? 0 : volume;
    if (bellAudioRef.current) bellAudioRef.current.volume = actualVolume;
    if (musicAudioRef.current) musicAudioRef.current.volume = actualVolume;
  }, [volume, isMuted]);

  // LOGIC UNTUK MENCEGAH USER MENUTUP TAB SAAT SPRINT AKTIF
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

  // LOGIC OTOMATIS JEDA TIMER JIKA TASK AKTIF DILEPAS
  useEffect(() => {
    if (isActive && mode === 'FOCUS' && !activeTaskData) {
      setIsActive(false);
      toast.info('Task dilepas. Timer dijeda otomatis.');
    }
  }, [isActive, mode, activeTaskData]);

  // LOGIC UNTUK MENGHENTIKAN MUSIK PERAYAAN
  const stopMusic = useCallback(() => {
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
      musicAudioRef.current.currentTime = 0;
    }
    setIsPlayingMusic(false);
  }, []);

  // LOGIC UTAMA SAAT TIMER HABIS
  const handleTimeUp = useCallback(async () => {
    if (mode === 'FOCUS') {
      if (musicAudioRef.current) {
        musicAudioRef.current.currentTime = 0;
        musicAudioRef.current.play().catch((e) => console.error('Gagal putar musik:', e));
        setIsPlayingMusic(true);
      }

      const tasksPayload = Object.entries(taskTimeLog).map(([idStr, minutes]) => ({
        taskId: Number(idStr),
        minutesSpent: Math.max(1, minutes),
      }));

      if (tasksPayload.length > 0) {
        try {
          await api.post('/Sessions', { durationMinutes: Math.floor(DURATION.FOCUS / 60), tasks: tasksPayload });
        } catch (error) {
          toast.error('Gagal mencatat riwayat fokus ke server.');
        }
      }

      if (activeTaskData?.title.startsWith('Review: ')) {
        try {
          await api.patch(`/Tasks/${activeTaskData.id}/finish`);
          toast.success('Sesi selesai. Task Review otomatis ditandai Done.');
          setActiveTaskData(null);
        } catch (e) {
          console.error('Gagal auto-finish review task');
        }
      } else {
        toast.success('Sesi Selesai! Waktunya istirahat.');
      }

      setShouldRefreshTasks((prev) => prev + 1);

      const newCycleCount = focusCycleCount + 1;
      setFocusCycleCount(newCycleCount);

      if (newCycleCount % 4 === 0) {
        setMode('LONG_BREAK');
        setTimeLeft(DURATION.LONG_BREAK);
        toast.info('Hebat! 4 Sesi Fokus selesai. Nikmati istirahat panjang Anda. 🎉');
      } else {
        setMode('SHORT_BREAK');
        setTimeLeft(DURATION.SHORT_BREAK);
      }

      setTaskTimeLog({});

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Sprint Selesai! 🍅', { body: 'Kerja bagus! Musik perayaan dimulai.', icon: '/favicon.ico' });
      }
    } else {
      stopMusic();
      if (bellAudioRef.current) {
        bellAudioRef.current.currentTime = 0;
        bellAudioRef.current.play().catch((e) => console.error('Gagal putar bel:', e));
      }

      toast.info('Waktu istirahat habis. Siap untuk sprint berikutnya?');
      setMode('FOCUS');
      setTimeLeft(DURATION.FOCUS);

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Waktu Istirahat Habis! ☕', { body: 'Ayo kembali fokus!', icon: '/favicon.ico' });
      }
    }
  }, [mode, activeTaskData, taskTimeLog, focusCycleCount, stopMusic]);

  // LOGIC TIMER UTAMA
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      handleTimeUp().catch((err) => console.error('Error in handleTimeUp:', err));
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft, handleTimeUp]);

  // MENGHITUNG WAKTU DINAMIS (Task Time Log) BERDASARKAN PERUBAHAN timeLeft
  useEffect(() => {
    if (isActive && mode === 'FOCUS' && activeTaskData) {
      const prevMinutes = Math.floor(prevTimeLeftRef.current / 60);
      const currentMinutes = Math.floor(timeLeft / 60);

      if (prevMinutes !== currentMinutes && prevTimeLeftRef.current !== DURATION.FOCUS) {
        setTaskTimeLog((prev) => ({
          ...prev,
          [activeTaskData.id]: (prev[activeTaskData.id] || 0) + 1,
        }));
      }
      prevTimeLeftRef.current = timeLeft;
    }
  }, [timeLeft, isActive, mode, activeTaskData]);

  const toggleTimer = () => {
    if (!isActive && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    if (!isActive && mode === 'FOCUS' && isPlayingMusic) stopMusic();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'FOCUS') setTimeLeft(DURATION.FOCUS);
    else if (mode === 'SHORT_BREAK') setTimeLeft(DURATION.SHORT_BREAK);
    else setTimeLeft(DURATION.LONG_BREAK);
  };

  const skipBreak = () => {
    setIsActive(false);
    setMode('FOCUS');
    setTimeLeft(DURATION.FOCUS);
    stopMusic();
  };

  const clearTaskTimeLog = () => setTaskTimeLog({});
  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <TimerContext.Provider
      value={{
        timeLeft,
        isActive,
        mode,
        activeTaskData,
        taskTimeLog,
        volume,
        isMuted,
        isPlayingMusic,
        shouldRefreshTasks,
        toggleTimer,
        resetTimer,
        skipBreak,
        setMode,
        setActiveTaskData,
        setTimeLeft,
        clearTaskTimeLog,
        setVolume,
        toggleMute,
        stopMusic,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) throw new Error('useTimer must be used within a TimerProvider');
  return context;
}
