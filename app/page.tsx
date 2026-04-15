import Link from 'next/link';
import { Timer, BarChart3, ListChecks, ArrowRight, BrainCircuit, Coffee, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TutorialSheet from './components/TutorialSheet';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* HEADER NAVIGASI */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🍅</span>
          {/* Sembunyikan tulisan di mobile, munculkan di tablet/desktop (sm:block) */}
          <span className="font-bold text-xl tracking-widest uppercase hidden sm:block">Pomolog</span>
        </div>
        <nav className="flex items-center gap-3 sm:gap-4">
          <TutorialSheet />
          <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
            Masuk
          </Link>
          <Button asChild className="font-bold rounded-full px-4 sm:px-6 shadow-lg shadow-primary/20">
            <Link href="/login">Mulai Gratis</Link>
          </Button>
        </nav>
      </header>

      {/* HERO SECTION */}
      {/* Menambahkan px-8 agar di mobile ada jarak dengan tepi layar */}
      <main className="flex-1 flex flex-col items-center justify-center text-center z-10 mt-12 md:mt-20 px-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-8 border border-primary/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Rilis v1.0
        </div>

        {/* Diperkecil di mobile (text-4xl), membesar di layar lebar */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-6 max-w-5xl leading-tight">
          Fokus Lebih Dalam.
          <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500"> Selesaikan Lebih Banyak.</span>
        </h1>

        <p className="text-base md:text-xl text-muted-foreground mb-10 max-w-3xl font-medium leading-relaxed">
          Alat pengelola waktu dan tugas yang dirancang untuk profesional. Ambil kendali atas fokus Anda, lacak setiap sesi, dan temukan pola produktivitas Anda melalui analitik mendalam.
        </p>

        <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold shadow-xl shadow-primary/25 rounded-full group">
            <Link href="/login">
              Coba Pomolog Sekarang
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-full bg-background/50 backdrop-blur-sm border-border hover:bg-muted">
            <Link href="/dashboard">Buka Meja Kerja</Link>
          </Button>
        </div>

        {/* EDUKASI POMODORO SECTION */}
        <div className="mt-32 max-w-6xl w-full text-left relative px-4 md:px-8">
          <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10 rounded-full" />
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
              Bukan Sekadar <span className="text-primary">Timer.</span> <br className="hidden md:block" />
            </h2>
            <blockquote className="text-base md:text-lg italic text-muted-foreground mt-8 border-l-4 border-primary/50 pl-6 py-2 mx-auto max-w-2xl text-left">
              "Teknik Pomodoro mengajarkan Anda untuk bekerja sama dengan waktu, bukan berjuang melawannya."
              <footer className="text-sm font-bold text-foreground mt-4">— Francesco Cirillo, Pencipta Teknik Pomodoro</footer>
            </blockquote>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary border border-primary/20">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Sprint 25 Menit</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Pilih satu tugas dari antrean. Tekan tombol mulai, dan bekerjalah dengan komitmen penuh selama 25 menit (1 sesi Pomodoro).</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 text-green-500 border border-green-500/20">
                <Coffee className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Jeda Pendek</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Saat waktu habis, ambil jeda 5 menit. Tinggalkan layar Anda, regangkan badan, atau minum air. Ini adalah kunci untuk mencegah kelelahan mental.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 text-amber-500 border border-amber-500/20">
                <Repeat className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Evaluasi & Ulangi</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Tandai tugas yang sudah selesai, atau manfaatkan fitur "Review" jika Anda selesai lebih awal. Ulangi siklus ini untuk membangun momentum kerja Anda.</p>
            </div>
          </div>
        </div>

        {/* FEATURE CARDS */}
        <div className="mt-32 mb-20 text-center w-full px-4 md:px-8">
          <h2 className="text-3xl font-black tracking-tight mb-12">Fitur Unggulan Pomolog</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mx-auto text-left">
            <Card className="bg-card/40 backdrop-blur-xl border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Timer className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Persistent Timer</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Timer Anda tetap berdetak selama anda tidak menutup browser. Anda tidak akan kehilangan jejak waktu secara tidak sengaja.</p>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-xl border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                  <ListChecks className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Task Integration</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Tidak perlu aplikasi to-do terpisah. Tambahkan tugas, kaitkan dengan timer aktif, dan sistem akan melacak menit yang Anda habiskan untuk setiap tugas.</p>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-xl border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Deep Analytics</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Visualisasikan dedikasi Anda. Lihat grafik interaktif tren fokus mingguan hingga bulanan, serta identifikasi tugas mana yang menyerap waktu terbanyak.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-border mt-auto py-12 bg-background/50 backdrop-blur-md px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-8 text-center">
          {/* TOP: identity */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Pomolog</p>

            <p className="text-sm text-foreground flex items-center justify-center gap-1">
              Designed & Built by
              <a href="https://kumpulink.vercel.app/albi" target="_blank" rel="noreferrer noopener" className="text-primary hover:underline ml-1">
                Albi Nur
              </a>
            </p>
          </div>

          {/* MIDDLE: support (dikasih ruang sendiri biar “special”) */}
          <div>
            <a href="#" className="inline-flex items-center gap-2 text-amber-500 hover:opacity-80 transition">
              <Coffee className="w-4 h-4" />
              Support this project
            </a>
          </div>

          {/* BOTTOM: links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <a href="https://kumpulink.vercel.app/albi" className="hover:text-primary">
              Connect with me
            </a>
            <a href="https://linkedin.com/in/albinur" className="hover:text-primary">
              LinkedIn
            </a>
            <a href="https://github.com/albinurrosif/pomolog-web" className="hover:text-primary">
              Source Code
            </a>

            <span className="text-primary">•</span>

            <Link href="/privacy-policy" className="hover:text-primary">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="hover:text-primary">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
