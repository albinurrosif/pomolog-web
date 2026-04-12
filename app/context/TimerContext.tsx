'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

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

  toggleTimer: () => void;
  resetTimer: () => void;
  setMode: (mode: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK') => void;
  setActiveTaskData: (task: TaskData | null) => void;
  setTimeLeft: (time: number) => void;
  clearTaskTimeLog: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'>('FOCUS');

  const [activeTaskData, setActiveTaskData] = useState<TaskData | null>(null);
  const [taskTimeLog, setTaskTimeLog] = useState<Record<number, number>>({});

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // LOGIKA UTAMA TIMER
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  // LOGIKA PENCATAT WAKTU
  useEffect(() => {
    if (isActive && mode === 'FOCUS' && activeTaskData) {
      if (timeLeft % 60 === 0 && timeLeft !== 25 * 60) {
        setTaskTimeLog((prev) => ({
          ...prev,
          [activeTaskData.id]: (prev[activeTaskData.id] || 0) + 1,
        }));
      }
    }
  }, [timeLeft, isActive, mode, activeTaskData]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'FOCUS') setTimeLeft(25 * 60);
    else if (mode === 'SHORT_BREAK') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const clearTaskTimeLog = () => setTaskTimeLog({});

  return (
    <TimerContext.Provider
      value={{
        timeLeft,
        isActive,
        mode,
        activeTaskData,
        taskTimeLog,
        toggleTimer,
        resetTimer,
        setMode,
        setActiveTaskData,
        setTimeLeft,
        clearTaskTimeLog,
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
