'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '../../lib/api';
import { toast } from 'sonner';

// Import Shadcn Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // --- PROSES LOGIN ---
        const response = await api.post('/Auth/login', { email, password });
        const token = response.data.token;

        if (token) {
          Cookies.set('token', token, { expires: 7 });
          toast.success('Login berhasil! Selamat datang kembali. 🚀');
          router.push('/dashboard');
        } else {
          toast.error('Token tidak ditemukan dari server.');
        }
      } else {
        // --- PROSES REGISTER ---
        await api.post('/Auth/register', { name, email, password });

        toast.success('Registrasi sukses! Silakan login dengan akun barumu.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data || 'Terjadi kesalahan pada server.';
      // Menggunakan Sonner Toast alih-alih div merah kaku
      toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Efek Glow di belakang Card (Opsional, memberikan kesan premium) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/70 blur-[120px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-md bg-card/50 backdrop-blur-xl border-border shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="flex justify-center mb-2">
            <span className="text-5xl drop-shadow-lg">🍅</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-widest uppercase">POMOLOG</CardTitle>
          <CardDescription className="text-sm font-medium">{isLogin ? 'Selamat datang, mari mulai fokus.' : 'Mulai perjalanan produktivitasmu hari ini.'}</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-muted-foreground">
                  Nama Panggilan
                </Label>
                <Input id="name" type="text" required={!isLogin} value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="bg-background h-12" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">
                Email
              </Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="JhonDoe@example.com" className="bg-background h-12" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground">
                Password
              </Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" className="bg-background h-12" />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="w-full h-12 font-bold text-md tracking-wide shadow-lg shadow-primary/20">
              {isLoading ? 'Memproses...' : isLogin ? 'Masuk' : 'Daftar Sekarang'}
            </Button>

            <div className="text-sm text-muted-foreground text-center mt-2">
              {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                }}
                className="text-primary hover:text-primary/80 font-bold transition-colors underline-offset-4 hover:underline"
              >
                {isLogin ? 'Buat akun baru' : 'Masuk di sini'}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
