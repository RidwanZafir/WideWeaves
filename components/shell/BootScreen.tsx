"use client";

import { motion } from "framer-motion";
import Luffy from "@/components/guide/Luffy";
import { PLANETS } from "@/data/planets";
import { MOON_COUNT, MARS_COUNT } from "@/data/equipment";

/**
 * Shown while the expedition boots (first paint, refresh, or a fresh session).
 * Luffy does the talking instead of a bare spinner, and the two worlds report
 * their catalogue counts so the wait also tells you something.
 */
export default function BootScreen({ onEntranceComplete }: { onEntranceComplete?: () => void }) {
  return (
    <div
      data-cursor="loading"
      className="relative grid min-h-dvh place-items-center overflow-hidden bg-ink px-5"
    >
      {/* horizon glow that warms as the boot completes */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 108%, rgba(255,106,44,0.16), transparent 58%), radial-gradient(100% 70% at 50% -10%, rgba(47,125,255,0.16), transparent 62%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(1.4px 1.4px at 20% 30%, rgba(255,255,255,0.75), transparent), radial-gradient(1.2px 1.2px at 78% 14%, rgba(200,230,255,0.7), transparent), radial-gradient(1.6px 1.6px at 44% 72%, rgba(255,255,255,0.6), transparent), radial-gradient(1px 1px at 12% 82%, rgba(190,220,255,0.65), transparent), radial-gradient(1.3px 1.3px at 88% 66%, rgba(255,255,255,0.5), transparent)",
          backgroundSize: "560px 560px",
        }}
      />

      <div className="relative flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          onAnimationComplete={onEntranceComplete}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end gap-3"
        >
          <motion.div
            className="h-28 w-24 shrink-0 md:h-32 md:w-28"
            animate={{ y: [0, -6, 0], rotate: [-1.2, 1.2, -1.2] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Luffy className="h-full w-full" expression="grin" pose="wave" />
          </motion.div>

          <div className="mb-3 max-w-[19rem] rounded-2xl rounded-bl-sm border border-cyan/25 bg-[linear-gradient(150deg,rgba(12,30,58,0.92),rgba(2,5,12,0.92))] px-3.5 py-2.5 text-left">
            <span className="data text-[0.5rem] uppercase tracking-[0.22em] text-cyan/70">
              Luffy · expedition guide
            </span>
            <p className="mt-1 text-[0.8rem] leading-snug text-slate-200">
              Waking up the archive. Give me one second to find the good stuff.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-7 w-[15rem]"
        >
          <div className="h-[3px] overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan via-electric to-gold"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <p className="data mt-3 text-[0.56rem] uppercase tracking-[0.32em] text-slate-500">
            Initialising expedition
          </p>
        </motion.div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {(["moon", "mars"] as const).map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-2 rounded-[0.5rem] border-2 border-white/15 bg-white/[0.04] px-3 py-1.5"
            >
              <img src={PLANETS[p].globe} alt="" className="h-5 w-5 object-contain" aria-hidden />
              <span className="data text-[0.52rem] uppercase tracking-[0.16em] text-slate-400">
                {PLANETS[p].name} · {p === "moon" ? MOON_COUNT : MARS_COUNT} records
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
