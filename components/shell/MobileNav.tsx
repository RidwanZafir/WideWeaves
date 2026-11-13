"use client";

import { Home, Compass, Gamepad2, BookOpen, Menu } from "lucide-react";
import Luffy from "@/components/guide/Luffy";
import { useAfterlight } from "@/lib/store";

export default function MobileNav() {
  const { view, go, setMenuOpen, guideOpen, setGuideOpen, dismissGuide, stage } = useAfterlight();
  if (stage !== "explore") return null;

  const items = [
    { id: "home", label: "Home", icon: Home },
    { id: "explore", label: "Archive", icon: Compass },
    { id: "games", label: "Games", icon: Gamepad2 },
    { id: "learn", label: "Learn", icon: BookOpen },
  ] as const;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-cyan/25 bg-[linear-gradient(180deg,rgba(6,14,30,0.95),rgba(3,7,16,0.98))] px-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-6 items-center gap-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className={`flex min-h-[3.25rem] min-w-0 flex-col items-center justify-center gap-1 rounded-[0.5rem] border-2 px-0.5 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.06em] transition ${
                active ? "border-gold/70 bg-gold/15 text-gold" : "border-transparent text-slate-400"
              }`}
              aria-current={active ? "page" : undefined}
              aria-label={item.id === "explore" ? "Equipment archive" : item.label}
            >
              <Icon size={17} className={active ? "drop-shadow-[0_0_8px_rgba(255,201,60,0.7)]" : ""} />
              {item.label}
            </button>
          );
        })}
        <button
          onClick={() => guideOpen ? dismissGuide() : setGuideOpen(true)}
          className={`flex min-h-[3.25rem] min-w-0 flex-col items-center justify-center gap-1 rounded-[0.5rem] border-2 px-0.5 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.06em] transition ${
            guideOpen ? "border-cyan/70 bg-cyan/15 text-cyan" : "border-transparent text-slate-400"
          }`}
          aria-label={guideOpen ? "Close expedition guide" : "Open expedition guide"}
          aria-pressed={guideOpen}
        >
          <Luffy compact className="h-[1.15rem] w-[1.15rem]" expression="grin" pose="wave" />
          Guide
        </button>
        <button
          onClick={() => setMenuOpen(true)}
          className="flex min-h-[3.25rem] min-w-0 flex-col items-center justify-center gap-1 rounded-[0.5rem] border-2 border-transparent px-0.5 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.06em] text-slate-400"
          aria-label="Open more navigation"
          aria-haspopup="dialog"
          aria-controls="site-menu"
        >
          <Menu size={17} />
          More
        </button>
      </div>
    </nav>
  );
}
