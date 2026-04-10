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
            <div key={task.id} className="flex items-center justify-between p-4 bg-neutral-900 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors">
              <span className="font-medium text-white">{task.title}</span>
              
              <button
                type="button"
                onClick={() => onSelectTask(task.id)}
                disabled={activeTaskId !== null}
                className={`text-sm font-bold px-4 py-1.5 rounded-md transition-all ${activeTaskId !== null ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30'}`}
              >
                {activeTaskId !== null ? 'TUNGGU' : '▶ PILIH TUGAS'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* --- RIWAYAT SELESAI (DONE) --- */}
      {doneTasks.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-neutral-800">
          <h3 className="text-sm font-bold text-green-500 uppercase tracking-wider mb-4">Riwayat Selesai Hari Ini</h3>
          {doneTasks.map((task) => (
            <div key={task.id} className="flex justify-between items-center p-4 rounded-lg border border-neutral-800 bg-neutral-900/30 opacity-60">
              <span className="line-through text-neutral-400">{task.title}</span>
              <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full">✓ SELESAI</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}