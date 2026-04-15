'use client';

import { Info, CheckCircle2, BrainCircuit, Coffee } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export default function TutorialSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" title="Cara Pakai Pomolog">
          <Info className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-md w-[90vw]">
        <SheetHeader className="mb-6 text-left">
          <SheetTitle className="text-2xl font-black flex items-center gap-2">
            <span className="text-3xl">🍅</span> Panduan Pomolog
          </SheetTitle>
          <SheetDescription className="text-sm font-medium">Pelajari cara memaksimalkan fokus Anda dengan metode ilmiah Pomodoro.</SheetDescription>
        </SheetHeader>

        <div className="space-y-8">
          {/* Bagian Filosofi */}
          <section>
            <blockquote className="italic text-muted-foreground border-l-4 border-primary/50 pl-4 py-2 bg-muted/50 rounded-r-lg text-sm leading-relaxed">
              "Sebuah Pomodoro tidak bisa dibagi. Tidak ada yang namanya setengah Pomodoro. Jika sebuah Pomodoro dimulai, ia harus berdering."
              <footer className="font-bold text-foreground mt-2 text-xs">— Francesco Cirillo</footer>
            </blockquote>
          </section>

          {/* Bagian Cara Pakai */}
          <section className="space-y-4">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> Cara Penggunaan
            </h3>
            <ol className="relative border-l border-border ml-3 space-y-6">
              <li className="pl-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-primary/20 rounded-full -left-3 ring-4 ring-background text-primary font-bold text-xs">1</span>
                <h4 className="font-bold text-sm">Tambahkan Tugas</h4>
                <p className="text-xs text-muted-foreground mt-1">Buat tugas di antrean. Jangan mengerjakan dua tugas sekaligus.</p>
              </li>
              <li className="pl-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-primary/20 rounded-full -left-3 ring-4 ring-background text-primary font-bold text-xs">2</span>
                <h4 className="font-bold text-sm">Pilih & Mulai Sprint</h4>
                <p className="text-xs text-muted-foreground mt-1">Klik tugas yang ingin dikerjakan, lalu tekan Start Sprint (25 Menit).</p>
              </li>
              <li className="pl-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-primary/20 rounded-full -left-3 ring-4 ring-background text-primary font-bold text-xs">3</span>
                <h4 className="font-bold text-sm">Tandai Selesai / Review</h4>
                <p className="text-xs text-muted-foreground mt-1">Jika tugas selesai sebelum 25 menit, sisa waktunya wajib digunakan untuk me-Review (mengecek ulang) hasil kerja Anda.</p>
              </li>
            </ol>
          </section>

          {/* Bagian Aturan Istirahat */}
          <section className="bg-card/50 border border-border rounded-xl p-4 space-y-4">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-widest text-center mb-2">Aturan Istirahat</h3>

            <div className="flex gap-4 items-start">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Short Break (5 Menit)</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">Muncul setelah 1 sesi fokus. Tinggalkan layar Anda, ambil minum, atau regangkan badan.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Long Break (15 Menit)</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">Otomatis muncul setelah Anda berhasil menyelesaikan 4 sesi fokus (sprint) berturut-turut.</p>
              </div>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
