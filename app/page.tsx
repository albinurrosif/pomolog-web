import Image from "next/image";
import Header from "./components/Header";
import Timer from "./components/Timer";
import TaskList from "./components/TaskList";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-red-500 selection:text-white">
      {/* --- HEADER --- */}
       <Header />

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-2xl mx-auto p-6 mt-10 flex flex-col items-center gap-12">
        
        {/* SECTION: TIMER BESAR */}
        <Timer/>

        {/* SECTION: TASK MANAGEMENT */}
        <TaskList/>

      </main>
    </div>
  );
}