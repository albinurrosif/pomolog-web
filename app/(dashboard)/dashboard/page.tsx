'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Timer from '../../components/Timer';
import TaskList from '../../components/TaskList';
import api from '@/app/lib/api';
import { toast } from 'sonner';
import { useTimer } from '@/app/context/TimerContext';

export type Task = { id: number; title: string; description: string; createdAt: string; status: 'Todo' | 'Done'; totalMinutesSpent: number };

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);

  const activeTask = tasks.find((t) => t.id === activeTaskId) || null;

  const { activeTaskData, setActiveTaskData } = useTimer();

  // Ambil data tugas dari Backend saat halaman dimuat
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/Tasks/with-time-spent');
        console.log('Tugas berhasil diambil:', response.data);
        setTasks(response.data);
      } catch (error) {
        console.error('Gagal mengambil tugas:', error);
        toast.error('Gagal mengambil data tugas dari server.');
      }
    };
    fetchTasks();
  }, []);

  // Tambah Tugas Baru ke Backend
  const handleAddTask = async (title: string, description: string): Promise<boolean> => {
    try {
      const response = await api.post('/Tasks', { title, description });
      // Menggunakan fungsional updater (prev) untuk menghindari Race Condition
      setTasks((prev) => [...prev, response.data]);
      toast.success('Tugas baru berhasil masuk antrean! 🚀');
      return true;
    } catch (error) {
      console.error('Gagal menambah tugas:', error);
      toast.error('Gagal menambah tugas. Pastikan sesi login kamu masih aktif ya.');
      return false; // Beritahu TaskList bahwa proses gagal
    }
  };

  // Pilih Tugas (Hanya state UI, tidak menembak API)
  const handleSelectTask = (id: number | null) => {
    if (id === null) {
      setActiveTaskData(null);
    } else {
      const task = tasks.find((t) => t.id === id);
      if (task) setActiveTaskData({ id: task.id, title: task.title });
    }
  };

  // Selesaikan Tugas ke Backend
  const handleFinishTask = async (taskId: number): Promise<boolean> => {
    try {
      await api.patch(`/Tasks/${taskId}/finish`);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: 'Done' } : t)));

      // Kosongkan active task di Context
      if (activeTaskData?.id === taskId) {
        setActiveTaskData(null);
      }

      toast.success('Mantap! Satu tugas berhasil diselesaikan. 🎉');
      return true;
    } catch (error) {
      console.error('Gagal menyelesaikan tugas:', error);
      toast.error('Ups, gagal menyelesaikan tugas. Server lagi sibuk nih.');
      return false;
    }
  };

  // Proses Review Otomatis (Finish + Buat Tugas Baru)
  const handleFinishAndReview = async (taskId: number, taskTitle: string): Promise<boolean> => {
    let didFinishCurrentTask = false;

    try {
      // 1. fetch API Selesai
      await api.patch(`/Tasks/${taskId}/finish`);
      didFinishCurrentTask = true;

      // 2. Tembak API create Tugas Review
      const response = await api.post('/Tasks', {
        title: `Review: ${taskTitle}`,
        description: 'Tugas review otomatis dari sisa waktu sesi.',
      });
      const newReviewTask = response.data;

      // 3. Update State Tugas SECARA BERSAMAAN (Functional Updater)
      setTasks((prev) => {
        // Ubah yang lama jadi Done
        const updatedTasks = prev.map((t) => (t.id === taskId ? { ...t, status: 'Done' } : t));
        // Masukkan yang baru ke array
        return [...updatedTasks, newReviewTask];
      });

      // 4. Langsung aktifkan tugas baru ke Context
      setActiveTaskData({ id: newReviewTask.id, title: newReviewTask.title });
      toast.success('Beralih ke mode Review. Ayo cek ulang pekerjaanmu! 🧐');
      return true;
    } catch (error) {
      console.error('Gagal melakukan proses review otomatis:', error);

      if (didFinishCurrentTask) {
        // Jika tugas lama sudah terlanjur selesai di Backend, bersihkan UI
        setActiveTaskData(null);
        try {
          const response = await api.get('/Tasks/with-time-spent');
          setTasks(response.data);
        } catch (e) {
          console.error('Gagal menarik ulang data', e);
        }
      }
      toast.error('Gagal membuat tugas review otomatis.');
      return false;
    }
  };

  // Mencatat Sesi Pomodoro ke Backend
  const handleSessionComplete = async (payload: { durationMinutes: number; tasks: { taskId: number; minutesSpent: number }[] }): Promise<boolean> => {
    try {
      await api.post('/Sessions', payload);
      console.log('Sesi Pomodoro sukses dicatat di Database!');

      const response = await api.get('/Tasks/with-time-spent');
      setTasks(response.data);
      return true;
    } catch (error) {
      console.error('Gagal mencatat sesi:', error);
      toast.error('Gagal mencatat waktu fokusmu ke database.');
      return false;
    }
  };

  // Hapus Tugas
  const handleDeleteTask = async (id: number) => {
    try {
      await api.delete(`/Tasks/${id}`);

      // Hapus dari state UI
      setTasks((prev) => prev.filter((t) => t.id !== id));

      // Jika tugas yang dihapus sedang aktif, lepaskan dari timer
      if (activeTaskId === id) setActiveTaskId(null);

      toast.success('Tugas berhasil dihapus dari antrean.');
    } catch (error) {
      console.error('Gagal menghapus tugas:', error);
      toast.error('Gagal menghapus tugas. Coba lagi nanti.');
    }
  };

  return (
    // RESPONSIVE PARENT: Di HP min-h-screen (bisa scroll), di Laptop h-screen dan overflow-hidden
    <div className="min-h-screen lg:h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground lg:overflow-hidden">
      <Header />

      {/* overflow-hidden hanya aktif di Laptop */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-8 lg:overflow-hidden flex flex-col">
        {/* GRID: 1 Kolom di HP, 2 Kolom di Laptop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full flex-1">
          {/* KOLOM KIRI (TIMER): Di HP mengikuti alur biasa, di Laptop mengambil tinggi penuh */}
          <div className="lg:col-span-5 lg:h-full flex flex-col justify-start">
            <Timer onFinishTask={handleFinishTask} onSessionComplete={handleSessionComplete} onReviewTask={handleFinishAndReview} />
          </div>

          {/* KOLOM KANAN (TASK LIST): Di HP memanjang ke bawah biasa, di Laptop menjadi Internal Scroll */}
          <div className="lg:col-span-7 lg:h-full lg:overflow-y-auto custom-scrollbar pb-10 pr-2">
            <TaskList tasks={tasks} activeTaskId={activeTaskId} onAddTask={handleAddTask} onSelectTask={handleSelectTask} onDeleteTask={handleDeleteTask} />
          </div>
        </div>
      </main>
    </div>
  );
}
