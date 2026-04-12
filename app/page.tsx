import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground selection:bg-primary selection:text-primary-foreground">
      <h1 className="text-6xl font-black mb-4 tracking-tighter">POMOLOG.</h1>
      <p className="text-xl text-muted-foreground mb-8">Fokus lebih baik. Selesaikan lebih banyak.</p>

      <div className="flex gap-4">
        <Link href="/login" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors">
          Mulai Sekarang
        </Link>
        <Link href="/dashboard" className="bg-muted text-muted-foreground px-6 py-3 rounded-lg font-bold hover:bg-muted/80 transition-colors">
          Buka Meja Kerja
        </Link>
      </div>
    </div>
  );
}
