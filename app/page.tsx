'use client';

import { useState, useEffect } from 'react';
import Header from './components/Header';
import Timer from './components/Timer';
import TaskList from './components/TaskList';
import api from '@/app/lib/api';

export type Task = { id: number; title: string; description: string; createdAt: string; status: 'Todo' | 'Done'; totalMinutesSpent: number };

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
  const handleAddTask = async (title: string, description: string): Promise<boolean> => {
    try {
      const response = await api.post('/Tasks', { title, description });
      // Menggunakan fungsional updater (prev) untuk menghindari Race Condition
      setTasks((prev) => [...prev, response.data]);
      return true;
    } catch (error) {
      console.error('Gagal menambah tugas:', error);
      alert('Gagal menambah tugas. Pastikan sesi login Anda masih aktif.');
      return false; // Beritahu TaskList bahwa proses gagal
    }
  };

  // Pilih Tugas (Hanya state UI, tidak menembak API)
  const handleSelectTask = (id: number | null) => {
    setActiveTaskId(id);
  };

  // Selesaikan Tugas ke Backend
  const handleFinishTask = async () => {
    if (activeTaskId) {
      try {
        await api.patch(`/Tasks/${activeTaskId}/finish`);
        setTasks((prev) => prev.map((t) => (t.id === activeTaskId ? { ...t, status: 'Done' } : t)));
        setActiveTaskId(null);
      } catch (error) {
        console.error('Gagal menyelesaikan tugas:', error);
        alert('Gagal menyelesaikan tugas.');
      }
    }
  };

  // Proses Review Otomatis (Finish + Buat Tugas Baru)
  const handleFinishAndReview = async () => {
    if (!activeTask) return;

    // Simpan judul lama sebelum tugasnya diubah/dihapus dari state
    const currentTitle = activeTask.title;
    const currentId = activeTask.id;

    try {
      // 1. Tembak API Selesai
      await api.patch(`/Tasks/${currentId}/finish`);

      // 2. Tembak API Buat Tugas Review
      const response = await api.post('/Tasks', {
        title: `Review: ${currentTitle}`,
        description: 'Tugas review otomatis dari sisa waktu sesi.',
      });
      const newReviewTask = response.data;

      // 3. Update State Tugas SECARA BERSAMAAN (Functional Updater)
      setTasks((prev) => {
        // Ubah yang lama jadi Done
        const updatedTasks = prev.map((t) => (t.id === currentId ? { ...t, status: 'Done' } : t));
        // Masukkan yang baru ke array
        return [...updatedTasks, newReviewTask];
      });

      // 4. Langsung aktifkan tugas baru
      setActiveTaskId(newReviewTask.id);
    } catch (error) {
      console.error('Gagal melakukan proses review otomatis:', error);
      alert('Terjadi kesalahan saat membuat tugas review.');
    }
  };

  // Mencatat Sesi Pomodoro ke Backend
  const handleSessionComplete = async (payload: { durationMinutes: number; tasks: { taskId: number; minutesSpent: number }[] }) => {
    try {
      await api.post('/Sessions', payload);
      console.log('Sesi Pomodoro sukses dicatat di Database!');

      // Mengambil ulang daftar tugas agar angka menit di layar (TaskList) langsung ter-update
      const response = await api.get('/Tasks/with-time-spent');
      setTasks(response.data);
    } catch (error) {
      console.error('Gagal mencatat sesi:', error);
    }
  };

  // Hapus Tugas
  const handleDeleteTask = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus tugas ini? Data waktu yang sudah tercatat mungkin ikut terhapus.')) return;

    try {
      await api.delete(`/Tasks/${id}`);

      // Hapus dari state UI
      setTasks((prev) => prev.filter((t) => t.id !== id));

      // Jika tugas yang dihapus sedang aktif, lepaskan dari timer
      if (activeTaskId === id) setActiveTaskId(null);
    } catch (error) {
      console.error('Gagal menghapus tugas:', error);
      alert('Gagal menghapus tugas.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-red-500 selection:text-white">
      <Header />
      <main className="max-w-2xl mx-auto p-6 mt-10 flex flex-col items-center gap-12">
        {/* Mengirim fungsi handleSessionComplete ke Timer */}
        <Timer activeTask={activeTask} onFinishTask={handleFinishTask} onSessionComplete={handleSessionComplete} onReviewTask={handleFinishAndReview} />

        <TaskList tasks={tasks} activeTaskId={activeTaskId} onAddTask={handleAddTask} onSelectTask={handleSelectTask} />
      </main>
    </div>
  );
}
