export default function Timer(){
    return (
      <section className="flex flex-col items-center gap-6">
        {/* Lingkaran Timer */}
        <div className="w-64 h-64 rounded-full border-8 border-red-500 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.2)]">
          <span className="text-6xl font-mono font-bold tracking-tighter">25:00</span>
        </div>

        {/* Kontrol Timer */}
        <div className="flex gap-4">
          <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 active:scale-95">START</button>
          <button className="bg-neutral-800 hover:bg-neutral-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-all">RESET</button>
        </div>
      </section>
    );
}