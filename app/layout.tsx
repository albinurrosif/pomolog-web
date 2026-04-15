import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { TimerProvider } from './context/TimerContext';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Pomolog — Focus Timer & Task Analytics',
  description: 'Kelola fokus dengan Pomodoro timer, pelacakan tugas, dan analitik produktivitas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn('dark h-full antialiased', jetbrainsMono.className)}>
      <body className={`font-sans antialiased bg-background text-foreground relative min-h-screen overflow-x-hidden`}>
        {/* ✨ AMBIENT GLOW GLOBAL ✨ */}
        {/* Kiri Atas */}
        <div className="fixed top-[-5%] left-[-10%] w-64 h-64 md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] bg-primary blur-[80px] md:blur-[120px] rounded-full pointer-events-none -z-10 animate-blob-top" />
        {/* Kanan Bawah */}
        <div className="fixed bottom-[-5%] right-[-10%] w-64 h-64 md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] bg-primary blur-[80px] md:blur-[120px] rounded-full pointer-events-none -z-10 animate-blob-bottom animation-delay-2000" />
        {/* Wadah aplikasi agar selalu berada DI ATAS efek glow */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <TimerProvider>{children}</TimerProvider>
        </div>
        {/* Toaster untuk Notifikasi Sonner */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
