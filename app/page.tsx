'use client';

import { useState, useEffect } from 'react';
import Header from './components/Header';
import Timer from './components/Timer';
import TaskList from './components/TaskList';
import api from '@/app/lib/api';

export type Task = { id: number; title: string; description: string; createdAt: string; status: 'Todo' | 'Done'; totalMinutesSpent: number;};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);

  const activeTask = tasks.find((t) => t.id === activeTaskId) || null;

  // Ambil data tugas dari Backend saat halaman dimuat
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Panggil endpoint yang baru dibuat
        const response = await api.get('/Tasks/with-time-spent');
        console.log('Tugas berhasil diambil:', response.data);
        setTasks(response.data);
      } catch (error) {
        console.error('Gagal mengambil tugas:', error);
      }
    };
    fetchTasks();
  }, []);

  // Tambah Tugas Baru ke Backend
  const handleAddTask = async (title: string) => {
    try {
      const response = await api.post('/Tasks', { title, description: '' });
      // Tambahkan tugas yang dikembalikan dari server ke state
      setTasks([...tasks, response.data]);
    } catch (error) {
      console.error('Gagal menambah tugas:', error);
      alert('Gagal menambah tugas. Pastikan sesi login Anda masih aktif.');
    }
  };

  // Pilih Tugas (Hanya state UI, tidak menembak API)
  const handleSelectTask = (id: number) => {
    setActiveTaskId(id);
  };

  // Selesaikan Tugas ke Backend
  const handleFinishTask = async () => {
    if (activeTaskId) {
      try {
        await api.patch(`/Tasks/${activeTaskId}/finish`);
        // Update state lokal agar UI langsung berubah tanpa perlu refresh
        setTasks(tasks.map((t) => (t.id === activeTaskId ? { ...t, status: 'Done' } : t)));
        setActiveTaskId(null);
      } catch (error) {
        console.error('Gagal menyelesaikan tugas:', error);
        alert('Gagal menyelesaikan tugas.');
      }
    }
  };

  // Mencatat Sesi Pomodoro ke Backend
  const handleSessionComplete = async (payload: { durationMinutes: number; tasks: { taskId: number; minutesSpent: number }[] }) => {
    try {
      await api.post('/Sessions', payload);
      console.log('Sesi Pomodoro sukses dicatat di Database!');
    } catch (error) {
      console.error('Gagal mencatat sesi:', error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-red-500 selection:text-white">
      <Header />
      <main className="max-w-2xl mx-auto p-6 mt-10 flex flex-col items-center gap-12">
        {/* Mengirim fungsi handleSessionComplete ke Timer */}
        <Timer 
          activeTask={activeTask} 
          onFinishTask={handleFinishTask} 
          onSessionComplete={handleSessionComplete} 
        />

        <TaskList 
          tasks={tasks} 
          activeTaskId={activeTaskId} 
          onAddTask={handleAddTask} 
          onSelectTask={handleSelectTask} 
        />
      </main>
    </div>
  );
}