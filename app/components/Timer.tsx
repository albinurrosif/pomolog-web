    'use client';

    import { useState, useEffect } from 'react';
    import { Task } from '@/app/page'; // Impor tipe data dari page

    interface TimerProps {
    activeTask: Task | null;
    onFinishTask: () => void;
    }

    export default function Timer({ activeTask, onFinishTask }: TimerProps) {
    const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
    const [timeLeft, setTimeLeft] = useState(1500); 
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
        interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        } else if (isActive && timeLeft === 0) {
        handleSessionEnd();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    const handleSessionEnd = () => {
        setIsActive(false);
        if (mode === 'FOCUS') {
        alert('Sesi Fokus Selesai! Kamu dapat 25 menit di Analytics.');
        setMode('BREAK');
        setTimeLeft(300); 
        } else {
        alert('Waktu Istirahat Habis! Siap kerja lagi?');
        setMode('FOCUS');
        setTimeLeft(1500);
        }
    };

    const handleStartPause = () => {
        // Validasi: Tolak start jika belum ada tugas yang dipilih
        if (mode === 'FOCUS' && !activeTask && !isActive && timeLeft === 1500) {
        alert("Pilih tugas terlebih dahulu dari antrean di bawah!");
        return;
        }
        setIsActive(!isActive);
    };

    const handleResetOrSkip = () => {
        if (mode === 'BREAK') {
        // Lewati Istirahat (Skip Break)
        setIsActive(false);
        setMode('FOCUS');
        setTimeLeft(1500);
        } else {
        // Reset Fokus Normal
        if (window.confirm('Batalkan sesi ini? Waktu fokus tidak akan dicatat.')) {
            setIsActive(false);
            setMode('FOCUS');
            setTimeLeft(1500);
        }
        }
    };

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <section className="flex flex-col items-center gap-6 w-full">
        <div className="text-xl font-bold tracking-widest uppercase">
            {mode === 'FOCUS' ? <span className="text-red-500">🔥 Sesi Fokus</span> : <span className="text-green-500">☕ Istirahat</span>}
        </div>

        <div className={`w-64 h-64 rounded-full border-8 flex items-center justify-center shadow-2xl transition-all duration-500 ${mode === 'FOCUS' ? 'border-red-500 shadow-red-500/20' : 'border-green-500 shadow-green-500/20'}`}>
            <span className="text-6xl font-mono font-bold">{formatTime(timeLeft)}</span>
        </div>

        {/* --- AREA TUGAS AKTIF --- */}
        <div className="flex flex-col items-center justify-center min-h-[90px] w-full max-w-md bg-neutral-800/30 rounded-xl p-4 border border-neutral-700/50 text-center">
            {mode === 'BREAK' ? (
            <p className="text-neutral-400 text-sm">Jauhkan mata dari layar dan regangkan badan.</p>
            ) : activeTask ? (
            <div className="flex flex-col items-center gap-2">
                <span className="text-neutral-400 text-xs">Sedang Dikerjakan:</span>
                <span className="font-bold text-lg text-white">{activeTask.title}</span>
                <button 
                onClick={onFinishTask}
                className="mt-1 text-xs bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white px-4 py-1.5 rounded-full transition-colors font-medium border border-green-500/30"
                >
                ✓ Tandai Tugas Selesai
                </button>
            </div>
            ) : (
            <p className="text-neutral-400 text-sm italic">Belum ada tugas aktif. Silakan pilih di bawah.</p>
            )}
        </div>

        {/* --- KONTROL TOMBOL --- */}
        <div className="flex gap-4">
            {mode === 'BREAK' && isActive ? (
            // Jika istirahat sedang jalan, hilangkan fitur pause
            <button disabled className="bg-neutral-800 text-neutral-500 px-8 py-3 rounded-full font-bold text-lg cursor-not-allowed w-48">
                BERJALAN...
            </button>
            ) : (
            <button 
                onClick={handleStartPause} 
                className={`px-8 py-3 rounded-full font-bold text-lg transition-all w-48 ${isActive ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : mode === 'FOCUS' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
            >
                {isActive ? 'PAUSE' : mode === 'FOCUS' ? (timeLeft < 1500 ? 'RESUME' : 'START FOKUS') : 'MULAI ISTIRAHAT'}
            </button>
            )}

            {/* Logika Reset dan Skip */}
            {mode === 'BREAK' ? (
            <button onClick={handleResetOrSkip} className="bg-neutral-800 px-8 py-3 rounded-full font-bold text-lg hover:text-green-400 transition-colors">
                LEWATI
            </button>
            ) : (
            timeLeft < 1500 && (
                <button onClick={handleResetOrSkip} className="bg-neutral-800 px-8 py-3 rounded-full font-bold text-lg hover:text-red-400 transition-colors">
                RESET
                </button>
            )
            )}
        </div>
        </section>
    );
    }