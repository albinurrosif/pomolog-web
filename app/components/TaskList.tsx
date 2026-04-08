export default function TaskList() {
    return (
      <section className="w-full bg-neutral-800/50 p-6 rounded-2xl border border-neutral-800">
        <h2 className="text-xl font-semibold mb-4">Tugas Saat Ini</h2>

        {/* Input Task Baru */}
        <div className="flex gap-2 mb-6">
          <input type="text" placeholder="Apa yang ingin kamu fokuskan?" className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition-colors" />
          <button className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-neutral-200 transition-colors">Tambah</button>
        </div>

        {/* List Task Dummy */}
        <div className="space-y-3">
          {/* Task Item 1 */}
          <div className="flex items-center justify-between p-4 bg-neutral-900 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors">
            <div>
              <h3 className="font-medium">Belajar React Server Components</h3>
              <p className="text-xs text-neutral-400 mt-1">Status: To-Do</p>
            </div>
            <button className="text-red-500 hover:bg-red-500/10 px-3 py-1 rounded-md text-sm font-medium transition-colors">▶ Pilih</button>
          </div>

          {/* Task Item 2 */}
          <div className="flex items-center justify-between p-4 bg-neutral-900 rounded-lg border border-neutral-700 opacity-60">
            <div>
              <h3 className="font-medium line-through text-neutral-400">Setup Project Next.js</h3>
              <p className="text-xs text-green-500 mt-1">Status: Done</p>
            </div>
          </div>
        </div>
      </section>
    );
}