'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import api from '../../lib/api';
import { Task } from '@/app/(dashboard)/dashboard/page';

import { Card, CardContent } from '@/components/ui/card';

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

        // Urutkan dari yang terbaru (berdasarkan createdAt)
        doneTasks.sort((a: Task, b: Task) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setHistoryTasks(doneTasks);
      } catch (error) {
        console.error('Gagal mengambil riwayat:', error);
        setErrorMessage('Gagal memuat riwayat. Pastikan koneksi dan server aktif.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Fungsi Pembantu: Render Ikon Tomat (1 Tomat = 25 Menit)
  const renderTomatoes = (minutes: number) => {
    if (minutes < 25) return null;
    const tomatoCount = Math.floor(minutes / 25);
    return (
      <span className="mr-2 text-sm tracking-widest" title={`${tomatoCount} Sesi Selesai`}>
        {Array.from({ length: tomatoCount })
          .map(() => '🍅')
          .join('')}
      </span>
    );
  };

  return (
    // Menggunakan variabel warna Shadcn
    <div className="min-h-screen text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <Header />
      <main className="max-w-5xl mx-auto p-4 md:p-8 mt-4 md:mt-8 flex flex-col gap-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-wider uppercase">Laci Arsip</h1>
          <p className="text-muted-foreground text-sm font-medium">Rekam jejak semua task yang berhasil diselesaikan.</p>
        </div>

        {/* MAIN CONTENT */}
        <Card className="w-full bg-card/50 border-border">
          <CardContent className="p-6">
            {isLoading ? (
              <p className="text-muted-foreground text-center py-12 animate-pulse font-medium">Membongkar arsip...</p>
            ) : errorMessage ? (
              <p className="text-destructive text-center py-12 font-medium">{errorMessage}</p>
            ) : historyTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-12 italic">Arsip masih kosong. Selesaikan satu task untuk melihat rekam jejakmu di sini.</p>
            ) : (
              // Mengubah Grid menjadi Stack/List agar tidak sesak
              <div className="flex flex-col gap-4">
                {historyTasks.map((task) => (
                  <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors gap-6 group">
                    {/* KIRI: Judul, Deskripsi, Tanggal */}
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-foreground line-through opacity-70 truncate group-hover:opacity-100 transition-opacity">{task.title}</span>
                        <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20 shrink-0">DONE</span>
                      </div>

                      {/* Deskripsi: Dibatasi 2 baris (line-clamp) agar rapi */}
                      <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">{task.description || <span className="italic opacity-50">Tidak ada deskripsi.</span>}</p>

                      <span className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider mt-1">
                        Dibuat:{' '}
                        {new Date(task.createdAt).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* KANAN: Metrik Fokus (Tomat & Menit) */}
                    <div className="flex items-center shrink-0">
                      {task.totalMinutesSpent > 0 ? (
                        <div className="flex items-center bg-muted/50 border border-border px-4 py-2 rounded-lg">
                          {renderTomatoes(task.totalMinutesSpent)}
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Total Fokus</span>
                            <span className="text-sm font-bold text-amber-500">{task.totalMinutesSpent} Menit</span>
                          </div>
                        </div>
                      ) : (
                        <div className="px-4 py-2 opacity-30">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">No Time Log</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
