'use client';

import { useState } from 'react';
import { Task } from '@/app/page';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: number | null;
  onAddTask: (title: string, description: string) => Promise<boolean>;
  onSelectTask: (id: number | null) => void;
}

export default function TaskList({ tasks, activeTaskId, onAddTask, onSelectTask }: TaskListProps) {
  const [titleValue, setTitleValue] = useState('');
  const [descValue, setDescValue] = useState(''); // State untuk deskripsi
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  // Fungsi untuk toggle expand/collapse deskripsi tugas
  const toggleExpand = (id: number) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  // Fungsi untuk menambahkan tugas baru
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

  const todoTasks = tasks.filter((t) => t.status === 'Todo');
  const doneTasks = tasks.filter((t) => t.status === 'Done');

  return (
    <section className="w-full bg-neutral-800/50 p-6 rounded-2xl border border-neutral-800">
      {/* --- FORM TAMBAH TUGAS BARU --- */}
      <div className="flex flex-col gap-3 mb-8 bg-neutral-900 p-4 rounded-xl border border-neutral-700">
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
      <div className="space-y-3 mb-8">
        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 border-b border-neutral-700 pb-2">Antrean Tugas (To-Do)</h3>
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
                  if (activeTaskId === task.id) {
                    // Jika tugas ini sedang aktif dan diklik lagi -> BATALKAN (Deselect)
                    onSelectTask(null);
                  } else if (activeTaskId === null) {
                    // Jika tidak ada yang aktif -> PILIH
                    onSelectTask(task.id);
                  } else {
                    // Jika ada tugas lain yang aktif
                    alert('Batalkan tugas aktif saat ini (klik ulang tugas yang bergaris merah) terlebih dahulu!');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (activeTaskId === task.id) onSelectTask(null);
                    else if (activeTaskId === null) onSelectTask(task.id);
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

                    {isActive && <span className="text-xs text-red-400 mt-1">Sedang dikerjakan</span>}
                  </div>

                  {/* EXPAND BUTTON */}
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

                {/* ACCORDION (DETAIL DESKRIPSI) */}
                <div
                  className={`
                    overflow-hidden transition-all duration-300
                    ${isExpanded ? 'max-h-40 mt-4 pt-4 border-t border-neutral-800' : 'max-h-0'}
                  `}
                >
                  <p className="text-neutral-400 mb-2 text-sm">{task.description || <span className="italic">Tidak ada deskripsi.</span>}</p>

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
              </div>
            );
          })
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
