'use client';

import { useState } from 'react';
import { Task } from '@/app/(dashboard)/dashboard/page';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: number | null;
  onAddTask: (title: string, description: string) => Promise<boolean>;
  onSelectTask: (id: number | null) => void;
  onDeleteTask: (id: number) => void;
}

export default function TaskList({ tasks, activeTaskId, onAddTask, onSelectTask, onDeleteTask }: TaskListProps) {
  const [titleValue, setTitleValue] = useState('');
  const [descValue, setDescValue] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  // State untuk Dialog Hapus Shadcn
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  // Toggle Accordion Detail
  const toggleExpand = (id: number) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  // Tambah Tugas Baru
  const handleAdd = async () => {
    const title = titleValue.trim();
    const description = descValue.trim();
    if (titleValue.trim() === '') {
      toast.error('Judul task tidak boleh kosong!');
      return;
    }

    const isSuccess = await onAddTask(title, description);
    if (isSuccess) {
      setTitleValue('');
      setDescValue('');
    }
  };

  // Konfirmasi Hapus Tugas
  const confirmDelete = () => {
    if (taskToDelete !== null) {
      onDeleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  // Fungsi Pembantu: Cek apakah tanggal tugas adalah hari ini
  const isToday = (dateString: string) => {
    const today = new Date();
    const taskDate = new Date(dateString);
    return taskDate.getDate() === today.getDate() && taskDate.getMonth() === today.getMonth() && taskDate.getFullYear() === today.getFullYear();
  };

  const todoTasks = tasks.filter((t) => t.status === 'Todo');
  const doneTasks = tasks.filter((t) => t.status === 'Done' && isToday(t.createdAt));

  // Fungsi Pembantu: Render Tomat berdasarkan menit yang dihabiskan
  const renderTomatoes = (minutes: number) => {
    if (minutes < 25) return null; // Harus 25
    const tomatoCount = Math.floor(minutes / 25); // Harus dibagi 25
    return (
      <span className="ml-2 text-sm tracking-widest" title={`${tomatoCount} Sesi Selesai`}>
        {Array.from({ length: tomatoCount })
          .map(() => '🍅')
          .join('')}
      </span>
    );
  };

  return (
    <Card className="w-full bg-card/50 border-border">
      <CardContent className="p-6">
        {/* --- FORM TAMBAH TUGAS BARU --- */}
        <div className="flex flex-col gap-3 mb-8 p-4 bg-background rounded-xl border border-border">
          <Input
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 text-base font-medium placeholder:text-muted-foreground"
            placeholder="Ketik judul task di sini..." required
          />
          <div className="h-[1px] w-full bg-border" />
          <Textarea
            value={descValue}
            onChange={(e) => setDescValue(e.target.value)}
            className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 text-sm resize-none min-h-[60px]"
            placeholder="Deskripsi tambahan (opsional)..."
          />
          <div className="flex justify-end mt-2">
            <Button onClick={handleAdd} size="sm" className="font-bold tracking-wide">
              Tambah ke Antrean
            </Button>
          </div>
        </div>

        {/* --- ANTREAN TUGAS (TODO) --- */}
        <div>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Sprint Backlog (To-Do)</h3>

          <div className="space-y-3 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {todoTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm italic text-center py-8">Antrean kosong. Ayo buat task baru!</p>
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
                      else toast.info('Lepas task yang sedang berjalan dulu ya!');
                    }}
                    onKeyDown={(e) => {
                      if (e.target !== e.currentTarget) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (activeTaskId === task.id) onSelectTask(null);
                        else if (activeTaskId === null) onSelectTask(task.id);
                        else toast.info('Lepas task yang sedang berjalan dulu ya!');
                      }
                    }}
                    className={`
                      flex flex-col p-4 rounded-xl border-2 transition-all duration-200 outline-none
                      ${activeTaskId === null ? 'cursor-pointer hover:border-primary/50 hover:bg-neutral-900/50' : isActive ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'cursor-not-allowed opacity-50 border-transparent bg-background'}
                      ${!isActive && activeTaskId === null ? 'bg-background border-border' : ''}
                    `}
                  >
                    {/* --- HEADER TASK (Layout Horizontal) --- */}
                    <div className="flex items-center justify-between gap-4">
                      {/* KIRI: Judul & Status Progress */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className={`font-semibold truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>{task.title}</span>
                        {isActive && <span className="text-[10px] font-bold text-primary border border-primary/30 bg-primary/10 px-2 py-0.5 rounded-md animate-pulse whitespace-nowrap hidden sm:inline-block">IN PROGRESS</span>}
                      </div>

                      {/* KANAN: Tomat, Menit, & Tombol Expand */}
                      <div className="flex items-center gap-3 shrink-0">
                        {task.totalMinutesSpent > 0 && (
                          <div className="flex items-center gap-2 bg-background border border-border px-2 py-1 rounded-md">
                            {renderTomatoes(task.totalMinutesSpent)}
                            <span className="text-xs font-medium text-amber-500">{task.totalMinutesSpent} mnt</span>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(task.id);
                          }}
                          className={`h-8 w-8 text-muted-foreground hover:text-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        >
                          ▼
                        </Button>
                      </div>
                    </div>

                    {/* --- ACCORDION DETAIL --- */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-40 mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="pt-4 border-t border-border/50 flex flex-col gap-4">
                        {/* Deskripsi memenuhi lebar */}
                        <p className="text-muted-foreground text-sm leading-relaxed">{task.description || <span className="italic opacity-50">Tidak ada deskripsi.</span>}</p>

                        {/* Footer Accordion: Tanggal & Hapus di beda sisi */}
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-[11px] text-muted-foreground/50 font-medium">Dibuat: {new Date(task.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (task.id === activeTaskId) {
                                toast.error('Selesaikan atau lepas task dari timer sebelum menghapusnya!');
                                return;
                              }
                              if (task.totalMinutesSpent > 0) {
                                toast.info('Task ini sudah dikerjakan. Daripada dihapus, mending diselesaikan agar masuk Analytics!');
                                return;
                              }
                              setTaskToDelete(task.id);
                            }}
                            className="h-7 px-3 text-[11px] font-bold"
                          >
                            Hapus
                          </Button>
                        </div>
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
          <div className="space-y-3 pt-6 border-t border-border">
            <h3 className="text-sm font-bold text-green-500 uppercase tracking-wider mb-4">Selesai Hari Ini</h3>
            {doneTasks.map((task) => {
              const isExpanded = expandedTaskId === task.id;

              return (
                <div key={task.id} role="button" onClick={() => toggleExpand(task.id)} className="flex flex-col p-4 rounded-xl border border-border bg-background/50 opacity-70 hover:opacity-100 transition-all cursor-pointer group">
                  {/* HEADER TASK SELESAI */}
                  <div className="flex items-center justify-between gap-4">
                    {/* KIRI: Judul dicoret */}
                    <div className="flex-1 min-w-0">
                      <span className="line-through text-muted-foreground font-medium truncate block group-hover:text-foreground transition-colors">{task.title}</span>
                    </div>

                    {/* KANAN: Waktu, Tomat, Badge & Tombol Panah */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        {renderTomatoes(task.totalMinutesSpent)}
                        <span className="text-xs text-muted-foreground font-medium">{task.totalMinutesSpent} mnt</span>
                      </div>
                      <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">DONE</span>
                      <Button variant="ghost" size="icon" className={`h-6 w-6 text-muted-foreground transition-transform duration-200 pointer-events-none ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                      </Button>
                    </div>
                  </div>

                  {/* ACCORDION DETAIL TUGAS SELESAI */}
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-40 mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pt-3 border-t border-border/50 flex flex-col gap-2">
                      <p className="text-muted-foreground text-sm leading-relaxed">{task.description || <span className="italic opacity-50">Tidak ada deskripsi.</span>}</p>
                      <p className="text-[11px] text-muted-foreground/50 font-medium">Dibuat: {new Date(task.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* --- DIALOG KONFIRMASI HAPUS SHADCN --- */}
      <Dialog open={taskToDelete !== null} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hapus Task?</DialogTitle>
            <DialogDescription>Apakah kamu yakin ingin menghapus task ini dari antrean? Aksi ini tidak bisa dibatalkan.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setTaskToDelete(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
