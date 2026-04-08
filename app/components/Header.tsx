export default function Header() {
    return (
      <header className="flex items-center justify-between p-6 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🍅</span>
          <h1 className="text-2xl font-bold tracking-wider">POMOLOG</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-neutral-400">
            🔥 Total Fokus: <span className="text-white font-semibold">120 Menit</span>
          </div>
          <button className="text-sm bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-md transition-colors">Logout</button>
        </div>
      </header>
    );
}