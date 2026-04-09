'use client';

import { useState } from 'react';
import Header from './components/Header';
import Timer from './components/Timer';
import TaskList from './components/TaskList';

// Ekspor tipe Task agar bisa dipakai di komponen lain
export type Task = { id: string; title: string; status: 'TODO' | 'IN_PROGRESS' | 'DONE' };

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  // State untuk menyimpan ID tugas yang sedang ditarik ke Timer
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Cari objek tugas utuh berdasarkan ID yang aktif
  const activeTask = tasks.find((t) => t.id === activeTaskId) || null;

  const handleAddTask = (title: string) => {
    setTasks([...tasks, { id: Date.now().toString(), title, status: 'TODO' }]);
  };

  const handleSelectTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: 'IN_PROGRESS' } : t)));
    setActiveTaskId(id);
  };

  const handleFinishTask = () => {
    if (activeTaskId) {
      setTasks(tasks.map((t) => (t.id === activeTaskId ? { ...t, status: 'DONE' } : t)));
      // Kosongkan area tugas aktif agar user dipaksa mengambil tugas baru dari antrean
      setActiveTaskId(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-red-500 selection:text-white">
      <Header />
      <main className="max-w-2xl mx-auto p-6 mt-10 flex flex-col items-center gap-12">
        {/* Mengirim data tugas aktif dan fungsi finish ke Timer */}
        <Timer activeTask={activeTask} onFinishTask={handleFinishTask} />

        {/* Mengirim daftar tugas utuh ke TaskList */}
        <TaskList tasks={tasks} activeTaskId={activeTaskId} onAddTask={handleAddTask} onSelectTask={handleSelectTask} />
      </main>
    </div>
  );
}
