import { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";

const GREETINGS = [
  "Hello! Saurabh Kumar 👋",
  "Welcome to TravelSafe",
  "Stay Safe Today",
  "Explore India Safely",
  "Travel Smart",
  "Enjoy Your Journey",
];

function useRotatingGreeting() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % GREETINGS.length), 3200);
    return () => clearInterval(id);
  }, []);
  return GREETINGS[i];
}

export default function TopBar({ onMenu }: { onMenu: () => void }) {
  const greeting = useRotatingGreeting();

  return (
    <header className="sticky top-0 z-30 px-5 pt-5 pb-3 glass border-b border-slate-100">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <button
          aria-label="Menu"
          onClick={onMenu}
          className="press h-11 w-11 grid place-items-center rounded-2xl bg-white shadow-soft"
        >
          <span className="relative block w-5 h-4">
            <span className="absolute left-0 right-0 h-[2px] rounded-full bg-slate-800 top-0" />
            <span className="absolute left-0 right-0 h-[2px] rounded-full bg-slate-800 top-1.5" />
            <span className="absolute left-0 right-0 h-[2px] rounded-full bg-slate-800 top-3" />
          </span>
        </button>

        <div className="min-w-0 text-center">
          <div className="inline-flex items-center gap-1.5">
            <span className="inline-grid h-5 w-5 place-items-center rounded-md bg-gradient-to-br from-[#2563EB] to-[#0EA5E9]">
              <ShieldCheck className="h-3 w-3 text-white" />
            </span>
            <span className="font-display font-extrabold tracking-tight text-[15px] text-slate-900">TravelSafe</span>
          </div>
          <div className="relative h-4 overflow-hidden">
            <p key={greeting} className="text-[11px] text-slate-500 truncate" style={{ animation: "fade-swap 3.2s ease-in-out" }}>
              {greeting}
            </p>
          </div>
        </div>

        <button className="press relative h-11 w-11 rounded-full shadow-soft ring-2 ring-white overflow-hidden">
          <img
            src="https://i.pravatar.cc/80?img=15"
            alt="Profile"
            className="h-full w-full object-cover"
          />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#10B981] ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
