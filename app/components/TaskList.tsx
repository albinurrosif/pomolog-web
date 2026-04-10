'use client';

import { useState } from 'react';
import { Task } from '@/app/page';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: number | null;
  onAddTask: (title: string) => void;
  onSelectTask: (id: number) => void;
}

export default function TaskList({ tasks, activeTaskId, onAddTask, onSelectTask }: TaskListProps) {
  const [inputValue, setInputValue] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  // Fungsi untuk toggle expand/collapse detail tugas
  const toggleExpand = (id: number) => {
    setExpandedTaskId(expandedTaskId === id ? null : id); // Tutup jika diklik lagi
  };

  // Fungsi untuk menambah tugas baru
  const handleAdd = () => {
    if (!inputValue.trim()) return;
    onAddTask(inputValue);
    setInputValue('');
  };

  const todoTasks = tasks.filter((t) => t.status === 'Todo');
  const doneTasks = tasks.filter((t) => t.status === 'Done');

  return (
    <section className="w-full bg-neutral-800/50 p-6 rounded-2xl border border-neutral-800">
      <div className="flex gap-2 mb-8">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
          placeholder="Apa yang ingin kamu kerjakan selanjutnya?"
        />
        <button onClick={handleAdd} className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-neutral-200 transition-colors">
          Tambah
        </button>
      </div>

      {/* --- ANTREAN TUGAS (TODO) --- */}
      <div className="space-y-3 mb-8">
        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 border-b border-neutral-700 pb-2">Antrean Tugas (To-Do)</h3>
        {todoTasks.length === 0 ? (
          <p className="text-neutral-500 text-sm italic text-center py-4">Belum ada tugas di antrean.</p>
        ) : (
          todoTasks.map((task) => (
            <div key={task.id} className="flex flex-col p-4 bg-neutral-900 rounded-lg border border-neutral-700">
              {/* Bagian Atas (Selalu Terlihat) */}
              <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(task.id)}>
                <div className="flex flex-col">
                  <span className="font-medium text-white">{task.title}</span>
                  {task.totalMinutesSpent > 0 && <span className="text-xs text-yellow-500">⏱️ {task.totalMinutesSpent} menit</span>}
                </div>
                <span>{expandedTaskId === task.id ? '▼' : '▶'}</span>
              </div>

              {/* Bagian Bawah (Tersembunyi, Muncul kalau di-klik) */}
              {expandedTaskId === task.id && (
                <div className="mt-4 pt-4 border-t border-neutral-800 text-sm">
                  <p className="text-neutral-400 mb-2">{task.description ? task.description : <span className="italic">Tidak ada deskripsi.</span>}</p>
                  <p className="text-xs text-neutral-600">
                    Dibuat pada:{' '}
                    {new Date(task.createdAt).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* --- RIWAYAT SELESAI (DONE) --- */}
      {doneTasks.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-neutral-800">
          <h3 className="text-sm font-bold text-green-500 uppercase tracking-wider mb-4">Riwayat Selesai</h3>
          {doneTasks.map((task) => (
            <div key={task.id} className="flex justify-between items-center p-4 rounded-lg border border-neutral-800 bg-neutral-900/30 opacity-60">
              <div className="flex flex-col">
                <span className="line-through text-neutral-400">{task.title}</span>
                {/* TAMPILKAN TOTAL WAKTU FINAL */}
                <span className="text-xs text-neutral-500 mt-1">Total Fokus: {task.totalMinutesSpent} menit</span>
              </div>
              <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full">✓ SELESAI</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
