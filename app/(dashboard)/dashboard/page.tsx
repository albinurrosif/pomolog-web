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

  // 1. SEDOT STATE DARI CONTEXT SEBAGAI SUMBER KEBENARAN TUNGGAL (Single Source of Truth)
  const { activeTaskData, setActiveTaskData, shouldRefreshTasks } = useTimer();

  // 2. DERIVASI ID TASK AKTIF (Menggantikan useState yang lama agar tidak out-of-sync)
  const activeTaskId = activeTaskData?.id ?? null;

  // Ambil data tugas dari Backend saat halaman dimuat atau saat timer memberi sinyal refresh
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/Tasks/with-time-spent');
        setTasks(response.data);
      } catch (error) {
        console.error('Gagal mengambil tugas:', error);
        toast.error('Gagal mengambil data tugas dari server.');
      }
    };
    fetchTasks();
  }, [shouldRefreshTasks]);

  // Tambah Tugas Baru ke Backend
  const handleAddTask = async (title: string, description: string): Promise<boolean> => {
    try {
      const response = await api.post('/Tasks', { title, description });
      setTasks((prev) => [...prev, response.data]);
      toast.success('Tugas baru berhasil masuk antrean! 🚀');
      return true;
    } catch (error) {
      console.error('Gagal menambah tugas:', error);
      toast.error('Gagal menambah tugas. Pastikan sesi login kamu masih aktif ya.');
      return false;
    }
  };

  // Pilih Tugas
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
      await api.patch(`/Tasks/${taskId}/finish`);
      didFinishCurrentTask = true;

      const response = await api.post('/Tasks', {
        title: `Review: ${taskTitle}`,
        description: 'Tugas review otomatis dari sisa waktu sesi.',
      });
      const newReviewTask = response.data;

      setTasks((prev) => {
        const updatedTasks = prev.map((t) => (t.id === taskId ? { ...t, status: 'Done' } : t));
        return [...updatedTasks, newReviewTask];
      });

      setActiveTaskData({ id: newReviewTask.id, title: newReviewTask.title });
      toast.success('Beralih ke mode Review. Ayo cek ulang pekerjaanmu! 🧐');
      return true;
    } catch (error) {
      console.error('Gagal melakukan proses review otomatis:', error);

      if (didFinishCurrentTask) {
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

  // Hapus Tugas
  const handleDeleteTask = async (id: number) => {
    try {
      await api.delete(`/Tasks/${id}`);

      setTasks((prev) => prev.filter((t) => t.id !== id));

      // Jika tugas yang dihapus sedang aktif, lepaskan dari Context timer
      if (activeTaskId === id) setActiveTaskData(null);

      toast.success('Tugas berhasil dihapus dari antrean.');
    } catch (error) {
      console.error('Gagal menghapus tugas:', error);
      toast.error('Gagal menghapus tugas. Coba lagi nanti.');
    }
  };

  return (
    <div className="min-h-screen lg:h-screen flex flex-col text-foreground font-sans selection:bg-primary selection:text-primary-foreground lg:overflow-hidden">
      <Header />

      <main className="flex-1 w-full max-w-350 mx-auto p-4 md:p-8 lg:overflow-hidden flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full flex-1">
          <div className="lg:col-span-5 lg:h-full flex flex-col justify-start">
            <Timer onFinishTask={handleFinishTask} onReviewTask={handleFinishAndReview} />
          </div>

          <div className="lg:col-span-7 lg:h-full lg:overflow-y-auto custom-scrollbar pb-10 pr-2">
            <TaskList tasks={tasks} activeTaskId={activeTaskId} onAddTask={handleAddTask} onSelectTask={handleSelectTask} onDeleteTask={handleDeleteTask} />
          </div>
        </div>
      </main>
    </div>
  );
}
