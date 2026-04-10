'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // --- PROSES LOGIN ---
        const response = await api.post('/Auth/login', { email, password });
        
        // Simpan token ke cookie (response.data.token)
        const token = response.data.token; 
        if (token) {
          Cookies.set('token', token, { expires: 7 });
          router.push('/'); // halaman utama
        } else {
          setErrorMsg('Token tidak ditemukan dari server.');
        }

      } else {
        // --- PROSES REGISTER ---
        await api.post('/Auth/register', { name, email, password });
        
        alert('Registrasi sukses! Silakan login.');
        setIsLogin(true); // Pindah ke login
        setPassword('');
      }
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.message || error.response?.data || 'Terjadi kesalahan pada server.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-md bg-neutral-800 p-8 rounded-2xl border border-neutral-700 shadow-2xl">
        <div className="text-center mb-8">
          <span className="text-5xl">🍅</span>
          <h1 className="text-2xl font-bold mt-4 tracking-wider">POMOLOG</h1>
          <p className="text-neutral-400 mt-2">
            {isLogin ? 'Selamat datang kembali, fokus lagi yuk!' : 'Mulai perjalanan fokusmu hari ini.'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
            {typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Nama Panggilan</label>
              <input
                type="text"
                required={!isLogin}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
              placeholder="developer@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-bold transition-colors mt-4 ${
              isLoading ? 'bg-neutral-600 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isLoading ? 'Memproses...' : isLogin ? 'Masuk' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-400">
          {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg('');
            }}
            className="text-red-400 hover:text-red-300 font-bold transition-colors"
          >
            {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
          </button>
        </div>
      </div>
    </div>
  );
}