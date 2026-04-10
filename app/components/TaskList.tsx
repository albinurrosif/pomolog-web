'use client';

import { useState } from 'react';
import { Task } from '@/app/page';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: number | null;
  onAddTask: (title: string, description: string) => Promise<boolean>;
  onSelectTask: (id: number | null) => void;
  onDeleteTask: (id: number) => void; // TAMBAHAN: Prop untuk fungsi hapus
}

export default function TaskList({ tasks, activeTaskId, onAddTask, onSelectTask, onDeleteTask }: TaskListProps) {
  const [titleValue, setTitleValue] = useState('');
  const [descValue, setDescValue] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  // Fungsi untuk toggle expand/collapse detail tugas
  const toggleExpand = (id: number) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  // Fungsi untuk menambah tugas baru
  const handleAdd = async () => {
    const title = titleValue.trim();
    const description = descValue.trim();
    if (!title) return;

    const isSuccess = await onAddTask(title, description);
    if (isSuccess) {
      setTitleValue('');
      setDescValue('');
    }
  };

  // Fungsi untuk memeriksa apakah tanggal tugas adalah hari ini
  const isToday = (dateString: string) => {
    const today = new Date();
    const taskDate = new Date(dateString);
    return taskDate.getDate() === today.getDate() && taskDate.getMonth() === today.getMonth() && taskDate.getFullYear() === today.getFullYear();
  };

  const todoTasks = tasks.filter((t) => t.status === 'Todo');
  const doneTasks = tasks.filter((t) => t.status === 'Done' && isToday(t.createdAt));

  return (
    <section className="w-full bg-neutral-800/50 p-6 rounded-2xl border border-neutral-800">
      {/* --- FORM TAMBAH TUGAS BARU --- */}
      <div className="flex flex-col gap-3 mb-6 bg-neutral-900 p-4 rounded-xl border border-neutral-700">
        <input
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          className="w-full bg-transparent border-b border-neutral-700 px-2 py-2 focus:outline-none focus:border-red-500 font-medium text-white placeholder-neutral-500 transition-colors"
          placeholder="Judul Tugas..."
        />
        <textarea
          value={descValue}
          onChange={(e) => setDescValue(e.target.value)}
          className="w-full bg-transparent px-2 py-2 focus:outline-none text-sm text-neutral-300 placeholder-neutral-600 resize-none"
          placeholder="Deskripsi detail (opsional)..."
          rows={2}
        />
        <div className="flex justify-end mt-2">
          <button onClick={handleAdd} className="bg-white text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-neutral-200 transition-colors">
            Tambah Tugas
          </button>
        </div>
      </div>

      {/* --- ANTREAN TUGAS (TODO) --- */}
      <div>
        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 border-b border-neutral-700 pb-2">Antrean Tugas (To-Do)</h3>

        <div className="space-y-3 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {todoTasks.length === 0 ? (
            <p className="text-neutral-500 text-sm italic text-center py-4">Belum ada tugas di antrean.</p>
          ) : (
            todoTasks.map((task) => {
              const isActive = activeTaskId === task.id;
              const isExpanded = expandedTaskId === task.id;

              return (
                <div
                  key={task.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (activeTaskId === task.id) onSelectTask(null);
                    else if (activeTaskId === null) onSelectTask(task.id);
                    else alert('Batalkan tugas aktif saat ini terlebih dahulu!');
                  }}
                  onKeyDown={(e) => {
                    if (e.target !== e.currentTarget) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (activeTaskId === task.id) onSelectTask(null);
                      else if (activeTaskId === null) onSelectTask(task.id);
                      else alert('Batalkan tugas aktif saat ini terlebih dahulu!');
                    }
                  }}
                  className={`
                    flex flex-col p-4 rounded-lg border transition-all 
                    ${activeTaskId === null ? 'cursor-pointer hover:border-neutral-500' : isActive ? 'border-red-500 bg-neutral-800' : 'cursor-not-allowed opacity-60'}
                    ${!isActive && activeTaskId === null ? 'bg-neutral-900 border-neutral-700' : ''}
                  `}
                >
                  {/* HEADER */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{task.title}</span>
                      {task.totalMinutesSpent > 0 && <span className="text-xs text-yellow-500 mt-1">⏱️ {task.totalMinutesSpent} menit</span>}
                      {isActive && <span className="text-xs text-red-400 mt-1">▶ Sedang dikerjakan</span>}
                    </div>

                    <button
                      type="button"
                      aria-expanded={isExpanded ? 'true' : 'false'}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(task.id);
                      }}
                      className="p-2 text-neutral-400 hover:text-white transition"
                    >
                      <span className={`inline-block transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                  </div>

                  {/* ACCORDION (DETAIL & DELETE) */}
                  <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-40 mt-4 pt-4 border-t border-neutral-800' : 'max-h-0'}`}>
                    <div className="flex justify-between items-end">
                      <div className="flex-1 pr-4">
                        <p className="text-neutral-400 mb-2 text-sm">{task.description || <span className="italic">Tidak ada deskripsi.</span>}</p>
                        <p className="text-xs text-neutral-600">Dibuat pada: {new Date(task.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>

                      {/* Tombol Delete untuk ralat typo */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (task.totalMinutesSpent > 0) {
                            alert('Tugas ini sudah memiliki rekam jejak waktu. Selesaikan tugas ini (Tandai Selesai) agar waktunya masuk ke Analitik, jangan dihapus!');
                            return;
                          }
                          onDeleteTask(task.id);
                        }}
                        className="text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white px-3 py-2 rounded-lg transition-colors border border-red-500/20"
                      >
                        🗑️ HAPUS
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* --- RIWAYAT SELESAI (DONE HARI INI SAJA) --- */}
      {doneTasks.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-neutral-800">
          <h3 className="text-sm font-bold text-green-500 uppercase tracking-wider mb-4">Selesai Hari Ini 🎉</h3>
          {doneTasks.map((task) => (
            <div key={task.id} className="flex justify-between items-center p-4 rounded-lg border border-neutral-800 bg-neutral-900/30 opacity-60">
              <div className="flex flex-col">
                <span className="line-through text-neutral-400">{task.title}</span>
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
