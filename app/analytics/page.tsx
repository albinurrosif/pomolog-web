'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import api from '../lib/api';
import { Task } from '@/app/page';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState({ totalTasksCompleted: 0, totalSessionsCompleted: 0, totalFocusTimeMinutes: 0 });
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // FETCH DATA
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        // Ambil data untuk list "Top 5 Tugas"
        const tasksRes = await api.get('/Tasks/with-time-spent');
        setTasks(tasksRes.data);

        // Ambil data untuk 3 Kartu Ringkasan (Summary)
        const summaryRes = await api.get('/Analytics/summary');
        setSummary(summaryRes.data);

        // Ambil data untuk Grafik Batang (Weekly / Monthly)
        const chartRes = await api.get(`/Analytics/${timeRange}`);
        // Balik array-nya agar urutan di grafik dari kiri (lampau) ke kanan (terbaru)
        const sortedChartData = chartRes.data.reverse();
        setChartData(sortedChartData);
      } catch (error) {
        console.error('Gagal memuat analitik:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeRange]);

  // LOGIKA UNTUK TOP 5 TUGAS SAJA
  const topTasks = [...tasks]
    .filter((t) => t.totalMinutesSpent > 0)
    .sort((a, b) => b.totalMinutesSpent - a.totalMinutesSpent)
    .slice(0, 5);

  const totalHoursFormatted = (summary.totalFocusTimeMinutes / 60).toFixed(1);

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-red-500 selection:text-white">
      <Header />
      <main className="max-w-7xl mx-auto p-4 md:p-6 mt-6 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-wider mb-2">Analitik Fokus 📊</h1>
            <p className="text-neutral-400">Pahami ke mana waktu Anda dihabiskan.</p>
          </div>

          {/* TOMBOL FILTER MINGGUAN / BULANAN */}
          <div className="flex bg-neutral-800 p-1 rounded-lg border border-neutral-700 w-fit">
            <button onClick={() => setTimeRange('weekly')} className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${timeRange === 'weekly' ? 'bg-red-500 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}>
              7 Hari
            </button>
            <button onClick={() => setTimeRange('monthly')} className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${timeRange === 'monthly' ? 'bg-red-500 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}>
              30 Hari
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-neutral-500 animate-pulse py-10 text-center">Menarik data dari database...</p>
        ) : errorMessage ? (
          <p className="text-red-500 text-center py-8">{errorMessage}</p>
        ) : (
          <>
            {/* KARTU RINGKASAN (Menggunakan data dari /api/Analytics/summary) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-800/50 p-6 rounded-2xl border border-neutral-700">
                <p className="text-neutral-400 text-sm font-bold uppercase tracking-wider mb-1">Total Jam Fokus</p>
                <p className="text-4xl font-bold text-yellow-500">
                  {totalHoursFormatted} <span className="text-lg text-neutral-500">jam</span>
                </p>
              </div>
              <div className="bg-neutral-800/50 p-6 rounded-2xl border border-neutral-700">
                <p className="text-neutral-400 text-sm font-bold uppercase tracking-wider mb-1">Tugas Diselesaikan</p>
                <p className="text-4xl font-bold text-green-500">
                  {summary.totalTasksCompleted} <span className="text-lg text-neutral-500">tugas</span>
                </p>
              </div>
              <div className="bg-neutral-800/50 p-6 rounded-2xl border border-neutral-700">
                <p className="text-neutral-400 text-sm font-bold uppercase tracking-wider mb-1">Total Sesi Pomodoro</p>
                <p className="text-4xl font-bold text-white">
                  {summary.totalSessionsCompleted} <span className="text-lg text-neutral-500">sesi</span>
                </p>
              </div>
            </div>

            {/* GRAFIK & TOP TASKS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* GRAFIK MINGGUAN/BULANAN */}
              <div className="bg-neutral-800/50 p-6 rounded-2xl border border-neutral-700 h-96 flex flex-col">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-6">Tren Fokus ({timeRange === 'weekly' ? '7 Hari' : '30 Hari'} Terakhir)</h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      {/* Sumbu X sekarang menggunakan dayName (Sen, Sel, Rab...) atau Date */}
                      <XAxis dataKey={timeRange === 'weekly' ? 'dayName' : 'date'} stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: '#262626' }}
                        contentStyle={{ backgroundColor: '#525252', border: '1px solid #404040', borderRadius: '8px' }}
                        formatter={(value: any) => [`${value} Menit`, 'Fokus']}
                        labelFormatter={(label) => `Tanggal/Hari: ${label}`}
                      />
                      {/* Sumbu Y sekarang menggunakan totalMinutes dari API baru */}
                      <Bar dataKey="totalMinutes" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry: any, index) => (
                          <Cell
                            key={`cell-${index}`}
                            // Warnai merah untuk hari dengan fokus tertinggi, sisanya kuning
                            fill={entry.totalMinutes === Math.max(...chartData.map((d: any) => d.totalMinutes)) && entry.totalMinutes > 0 ? '#ef4444' : '#eab308'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* FOKUS TERBESAR (Top 5 Tasks) */}
              <div className="bg-neutral-800/50 p-6 rounded-2xl border border-neutral-700">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-6">fokus tertinggi</h3>
                {topTasks.length === 0 ? (
                  <p className="text-neutral-500 italic text-sm">Belum ada data tugas yang diselesaikan.</p>
                ) : (
                  <div className="space-y-4">
                    {topTasks.map((task, i) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                        <div className="flex items-center gap-4">
                          <span className={`font-bold text-xl ${i === 0 ? 'text-red-500' : 'text-neutral-600'}`}>#{i + 1}</span>
                          <div className="flex flex-col">
                            <span className="text-white font-medium truncate max-w-[180px] sm:max-w-[250px]">{task.title}</span>
                          </div>
                        </div>
                        <span className="text-yellow-500 text-sm font-bold bg-yellow-500/10 px-3 py-1 rounded-full">{task.totalMinutesSpent} menit</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
