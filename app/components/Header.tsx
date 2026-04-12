'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('token', { path: '/' });
    router.push('/login');
  };

  // Helper untuk menentukan gaya link yang aktif
  const navLinkStyle = (path: string) => `
    relative text-sm font-medium transition-colors hover:text-white
    ${pathname === path ? 'text-white' : 'text-neutral-400'}
  `;

  return (
    // Efek Glassmorphism: bg-neutral-950/80 dan backdrop-blur-md
    <header className="w-full bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* LOGO & BRAND */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🍅</span>
          <h1 className="text-lg font-bold tracking-widest text-white">POMOLOG</h1>
        </Link>

        {/* NAVIGASI UTAMA */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/dashboard" className={navLinkStyle('/')}>
            Workspace
            {pathname === '/dashboard' && <span className="absolute -bottom-5 left-0 w-full h-[2px] bg-primary rounded-t-md" />}
          </Link>
          <Link href="/history" className={navLinkStyle('/history')}>
            Riwayat
            {pathname === '/history' && <span className="absolute -bottom-5 left-0 w-full h-[2px] bg-primary rounded-t-md" />}
          </Link>
          <Link href="/analytics" className={navLinkStyle('/analytics')}>
            Analytics
            {pathname === '/analytics' && <span className="absolute -bottom-5 left-0 w-full h-[2px] bg-primary rounded-t-md" />}
          </Link>
        </nav>

        {/* TOMBOL AKSI */}
        <div className="flex items-center gap-4">
          {/* Menggunakan Shadcn Button Variant Ghost */}
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-neutral-400 hover:text-red-400 hover:bg-red-500/10 font-bold tracking-wide text-xs">
            LOGOUT
          </Button>
        </div>
      </div>
    </header>
  );
}
