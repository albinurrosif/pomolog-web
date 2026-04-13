import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-16 px-6 relative z-10">
      <div className="max-w-3xl w-full">
        <Link href="/">
          <Button variant="ghost" className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Kembali ke Beranda
          </Button>
        </Link>

        <h1 className="text-4xl font-black tracking-tight mb-2">Syarat & Ketentuan</h1>
        <p className="text-muted-foreground mb-8 border-b border-border pb-8">Terakhir diperbarui: 13 April 2026</p>

        <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
          <p>Dengan mengakses dan menggunakan aplikasi Pomolog, Anda setuju untuk terikat oleh Syarat dan Ketentuan layanan ini. Jika Anda tidak setuju dengan ketentuan apa pun, Anda dilarang menggunakan atau mengakses situs ini.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Lisensi Penggunaan</h2>
          <p>Pomolog memberikan Anda lisensi pribadi, non-eksklusif, tidak dapat dialihkan, dan terbatas untuk menggunakan perangkat lunak ini secara ketat sesuai dengan ketentuan Perjanjian ini.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Akun Pengguna</h2>
          <p>Anda bertanggung jawab untuk menjaga kerahasiaan akun dan kata sandi Anda. Anda setuju untuk menerima tanggung jawab atas semua aktivitas yang terjadi di bawah akun Anda.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Penafian (Disclaimer)</h2>
          <p>
            Materi di Pomolog disediakan dengan dasar "sebagaimana adanya". Pomolog tidak memberikan jaminan, tersurat maupun tersirat, dan dengan ini menolak dan menyangkal semua jaminan lainnya termasuk, tanpa batasan, jaminan tersirat
            atau kondisi kelayakan untuk diperdagangkan, atau kesesuaian untuk tujuan tertentu.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Perubahan Syarat</h2>
          <p>Pomolog dapat merevisi syarat layanan ini untuk situs webnya kapan saja tanpa pemberitahuan. Dengan menggunakan aplikasi ini Anda setuju untuk terikat oleh versi Syarat dan Ketentuan yang berlaku saat ini.</p>
        </div>
      </div>
    </div>
  );
}
