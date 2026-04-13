import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-16 px-6 relative z-10">
      <div className="max-w-3xl w-full">
        <Link href="/">
          <Button variant="ghost" className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Kembali ke Beranda
          </Button>
        </Link>
        
        <h1 className="text-4xl font-black tracking-tight mb-2">Kebijakan Privasi</h1>
        <p className="text-muted-foreground mb-8 border-b border-border pb-8">Terakhir diperbarui: 13 April 2026</p>

        <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
          <p>
            Di Pomolog, privasi Anda adalah prioritas utama kami. Kebijakan Privasi ini menguraikan jenis informasi pribadi yang diterima dan dikumpulkan oleh Pomolog serta bagaimana informasi tersebut digunakan.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Informasi yang Kami Kumpulkan</h2>
          <p>
            Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami saat Anda membuat akun, yaitu nama panggilan dan alamat email Anda. Kami juga mencatat data penggunaan terkait sesi Pomodoro dan tugas-tugas yang Anda kerjakan untuk keperluan fitur analitik di dalam aplikasi.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Bagaimana Kami Menggunakan Informasi Anda</h2>
          <p>
            Informasi yang kami kumpulkan digunakan semata-mata untuk mengoperasikan, memelihara, dan menyediakan fitur-fitur dari aplikasi Pomolog kepada Anda (seperti dasbor riwayat dan statistik fokus). Kami <strong>tidak pernah</strong> menjual data Anda kepada pihak ketiga.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Keamanan Data</h2>
          <p>
            Kami mengambil langkah-langkah yang wajar untuk melindungi informasi pribadi Anda dari akses, penggunaan, atau pengungkapan yang tidak sah. Kata sandi Anda dienkripsi (di-hash) sebelum disimpan di database kami.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Hubungi Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami melalui repositori GitHub resmi kami.
          </p>
        </div>
      </div>
    </div>
  );
}