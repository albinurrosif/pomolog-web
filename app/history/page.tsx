'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import api from '../lib/api';
import { Task } from '@/app/page';

export default function HistoryPage() {
  const [historyTasks, setHistoryTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/Tasks/with-time-spent');
        // Filter HANYA tugas yang sudah "Done"
        const doneTasks = response.data.filter((t: Task) => t.status === 'Done');

        // Urutkan dari yang terbaru diselesaikan (berdasarkan createdAt)
        doneTasks.sort((a: Task, b: Task) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setHistoryTasks(doneTasks);
      } catch (error) {
        console.error('Gagal mengambil riwayat:', error);
        setErrorMessage('Gagal memuat riwayat. Silakan coba lagi nanti.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-red-500 selection:text-white">
      <Header />
      <main className="max-w-6xl mx-auto p-6 mt-10 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-wider">Laci Arsip 🗄️</h1>
          <p className="text-neutral-400">Semua tugas yang telah berhasil Anda taklukkan.</p>
        </div>

        <section className="w-full bg-neutral-800/50 p-6 rounded-2xl border border-neutral-800">
          {isLoading ? (
            <p className="text-neutral-500 text-center py-8 animate-pulse">Memuat riwayat Anda...</p>
          ) : errorMessage ? (
            <p className="text-red-500 text-center py-8">{errorMessage}</p>
          ) : historyTasks.length === 0 ? (
            <p className="text-neutral-500 text-center py-8 italic">Belum ada tugas yang diselesaikan. Ayo mulai fokus!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {historyTasks.map((task) => (
                <div key={task.id} className="flex flex-col p-4 bg-neutral-900 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-white line-through opacity-80">{task.title}</span>
                      <span className="text-xs font-bold text-green-500 mt-1">✓ SELESAI</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-3 border-t border-neutral-800">
                    <p className="text-neutral-400 text-sm">{task.description || <span className="italic">Tidak ada deskripsi.</span>}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-neutral-500">
                        Dibuat pada:{' '}
                        {new Date(task.createdAt).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {task.totalMinutesSpent > 0 && <span className="text-xs font-medium text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">⏱️ Total Fokus: {task.totalMinutesSpent} menit</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
