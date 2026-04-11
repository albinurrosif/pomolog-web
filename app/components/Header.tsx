'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function Header() {
  const pathname = usePathname(); // Untuk mendeteksi halaman mana yang sedang aktif
  const router = useRouter();

  return (
    <header className="w-full bg-neutral-900 border-b border-neutral-800 p-4 sticky top-0 z-10 shadow-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-2xl">🍅</span>
          <h1 className="text-xl font-bold tracking-wider text-white">POMOLOG</h1>
        </Link>

        {/* NAVIGASI */}
        <nav className="flex gap-6">
          <Link href="/" className={`font-bold transition-colors text-sm ${pathname === '/' ? 'text-red-500' : 'text-neutral-500 hover:text-white'}`}>
            MEJA KERJA
          </Link>
          <Link href="/history" className={`font-bold transition-colors text-sm ${pathname === '/history' ? 'text-red-500' : 'text-neutral-500 hover:text-white'}`}>
            RIWAYAT
          </Link>
        </nav>

        {/* TOMBOL LOGOUT */}
        <button
          onClick={() => {
            Cookies.remove('token');
            router.push('/login');
          }}
          className="text-xs font-bold text-neutral-400 hover:text-red-400 transition-colors"
        >
          LOGOUT
        </button>
      </div>
    </header>
  );
}
