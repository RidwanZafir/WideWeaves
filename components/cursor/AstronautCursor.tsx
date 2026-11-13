"use client";

import { useEffect, useRef } from "react";

// A compact, nose-anchored spacecraft cursor. All pointer motion is applied
// directly to these elements so the React tree never rerenders on mousemove.
const ART_W = 64;
const ART_H = 76;
const SCALE = 0.68;
const W = ART_W * SCALE;
const H = ART_H * SCALE;
const NOSE = { x: 32 * SCALE, y: 4 * SCALE };
const FINE_POINTER = "(any-pointer: fine) and (any-hover: hover)";
const REDUCED = "(prefers-reduced-motion: reduce)";

const HOVER_SELECTOR = "a[href],button,[role='button'],summary,label[for],[data-cursor='hover']";
const STRONG_SELECTOR = ".btn,.icon-btn,.callout,[data-cursor='hover']";
const CARD_SELECTOR = "article,.tilt-card,[data-cursor='card']";
const TEXT_SELECTOR = "input,textarea,select,[contenteditable='true']";
const OFF_SELECTOR = "[disabled],[aria-disabled='true']";

type Mode = "default" | "hover" | "card" | "text" | "disabled";

export default function AstronautCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<HTMLDivElement>(null);
  const figRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const pos = posRef.current;
    const fig = figRef.current;
    const reticle = reticleRef.current;
    if (!root || !pos || !fig || !reticle || typeof window.matchMedia !== "function") return;

    const html = document.documentElement;
    const fine = window.matchMedia(FINE_POINTER);
    const calm = window.matchMedia(REDUCED);
    let active = false;
    let reduced = calm.matches;
    let visible = false;
    let dragging = false;
    let raf = 0;
    let last = performance.now();
    let clock = 0;
    let tilt = 0;
    let targetTilt = 0;
    let pointerSpeed = 0;
    let moveLatch = 0;
    let lastPuff = 0;
    let mode: Mode = "default";
    const target = { x: -400, y: -400 };
    const cur = { x: -400, y: -400 };
    const prev = { x: -400, y: -400 };
    const lastPointer = { x: -400, y: -400, time: 0 };

    const arm = () => {
      active = fine.matches;
      root.dataset.active = String(active);
      if (!active) {
        html.classList.remove("astro-cursor");
        visible = false;
        root.dataset.visible = "false";
      }
    };
    arm();

    const setMode = (next: Mode) => {
      if (next === mode) return;
      mode = next;
      fig.dataset.mode = next;
      reticle.dataset.mode = next;
    };
    const reveal = () => {
      if (!active || target.x < -100) return;
      if (!visible) {
        visible = true;
        root.dataset.visible = "true";
      }
      html.classList.add("astro-cursor");
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" || !active) return;
      const now = performance.now();
      target.x = Math.min(Math.max(e.clientX, 2), window.innerWidth - 2);
      target.y = Math.min(Math.max(e.clientY, 2), window.innerHeight - 2);
      const dx = target.x - lastPointer.x;
      const dy = target.y - lastPointer.y;
      const elapsed = Math.max((now - lastPointer.time) / 1000, 0.001);
      const distance = Math.hypot(dx, dy);
      if (lastPointer.x > -100 && distance > 1) {
        targetTilt = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        pointerSpeed = Math.min(1400, distance / elapsed);
        if (pointerSpeed > 40) moveLatch = now;
      }
      lastPointer.x = target.x;
      lastPointer.y = target.y;
      lastPointer.time = now;
      if (!visible || cur.x < -100) {
        cur.x = prev.x = target.x;
        cur.y = prev.y = target.y;
      }
      reveal();
    };
    const onOver = (e: Event) => {
      const el = e.target;
      if (!(el instanceof Element)) return;
      if (el.closest(TEXT_SELECTOR)) setMode("text");
      else if (el.closest(OFF_SELECTOR)) setMode("disabled");
      else if (el.closest(STRONG_SELECTOR)) setMode("hover");
      else if (el.closest(CARD_SELECTOR)) setMode("card");
      else if (el.closest(HOVER_SELECTOR)) setMode("hover");
      else setMode("default");
    };
    const ripple = (x: number, y: number) => {
      const pulse = document.createElement("span");
      pulse.className = "astro-ripple";
      pulse.style.left = `${x}px`;
      pulse.style.top = `${y}px`;
      root.appendChild(pulse);
      window.setTimeout(() => pulse.remove(), 620);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (!active) return;
      dragging = true;
      fig.dataset.drag = "true";
      fig.dataset.click = "true";
      ripple(e.clientX, e.clientY);
      window.setTimeout(() => delete fig.dataset.click, 280);
    };
    const onUp = () => {
      dragging = false;
      delete fig.dataset.drag;
    };
    const onLeaveWindow = () => {
      visible = false;
      root.dataset.visible = "false";
    };
    const onEnterWindow = () => reveal();
    const onCalmChange = () => {
      reduced = calm.matches;
      if (reduced) tilt = 0;
    };

    const tick = (now: number) => {
      raf = window.requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.08);
      last = now;
      if (!active) return;
      clock += dt;
      const k = reduced ? 1 : 1 - Math.exp(-dt * 17);
      cur.x += (target.x - cur.x) * k;
      cur.y += (target.y - cur.y) * k;

      const vx = dt > 0 ? (cur.x - prev.x) / dt : 0;
      const vy = dt > 0 ? (cur.y - prev.y) / dt : 0;
      prev.x = cur.x;
      prev.y = cur.y;
      pointerSpeed *= Math.exp(-dt * 5.5);
      const speed = Math.max(Math.hypot(vx, vy), pointerSpeed);

      if (!reduced) {
        const difference = ((targetTilt - tilt + 540) % 360) - 180;
        tilt += difference * (1 - Math.exp(-dt * 12));
      }
      pos.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
      fig.style.transform = `rotate(${tilt}deg)${reduced ? "" : ` scale(${1 + Math.sin(clock * 2) * 0.008})`}`;
      reticle.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      fig.dataset.moving = String(!reduced && now - moveLatch < 170);
      fig.style.setProperty("--engine", String(Math.min(1, 0.38 + speed / 900 + (mode === "hover" ? 0.45 : 0))));

      // A small, capped set of DOM particles trails behind the travel vector.
      if (!reduced && speed > 100 && now - lastPuff > 75) {
        if (root.querySelectorAll(".astro-puff").length < 10) {
          lastPuff = now;
          const ux = vx / speed;
          const uy = vy / speed;
          const puff = document.createElement("span");
          puff.className = "astro-puff";
          puff.style.left = `${cur.x - ux * (12 + Math.random() * 9)}px`;
          puff.style.top = `${cur.y - uy * (12 + Math.random() * 9)}px`;
          root.appendChild(puff);
          window.setTimeout(() => puff.remove(), 700);
        }
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeaveWindow);
    document.addEventListener("pointerenter", onEnterWindow);
    window.addEventListener("blur", onLeaveWindow);
    fine.addEventListener?.("change", arm);
    calm.addEventListener?.("change", onCalmChange);
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeaveWindow);
      document.removeEventListener("pointerenter", onEnterWindow);
      window.removeEventListener("blur", onLeaveWindow);
      fine.removeEventListener?.("change", arm);
      calm.removeEventListener?.("change", onCalmChange);
      html.classList.remove("astro-cursor");
    };
  }, []);

  return (
    <div ref={rootRef} className="astro-root" data-visible="false" data-active="false" aria-hidden="true">
      <div ref={reticleRef} className="astro-reticle" data-mode="default"><span /></div>
      <div ref={posRef} className="astro-pos">
        <div
          ref={figRef}
          className="astro-fig"
          data-mode="default"
          style={{ width: W, height: H, left: -NOSE.x, top: -NOSE.y, transformOrigin: `${NOSE.x}px ${NOSE.y}px` }}
        >
          <svg width={W} height={H} viewBox={`0 0 ${ART_W} ${ART_H}`} fill="none" role="presentation">
            <defs>
              <linearGradient id="ship-shell" x1="15" y1="8" x2="48" y2="65" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fff" /><stop offset=".42" stopColor="#e6edf5" /><stop offset=".72" stopColor="#8fa4bc" /><stop offset="1" stopColor="#dce9f7" />
              </linearGradient>
              <linearGradient id="ship-wing" x1="7" y1="25" x2="31" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f7fbff" /><stop offset=".55" stopColor="#9eb3c9" /><stop offset="1" stopColor="#49627f" />
              </linearGradient>
              <linearGradient id="ship-blue" x1="25" y1="10" x2="40" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#d7fbff" /><stop offset=".3" stopColor="#5ce4ff" /><stop offset="1" stopColor="#0870db" />
              </linearGradient>
              <linearGradient id="ship-flame" x1="32" y1="58" x2="32" y2="75" gradientUnits="userSpaceOnUse">
                <stop stopColor="#efffff" /><stop offset=".32" stopColor="#70eaff" /><stop offset="1" stopColor="#1689ff" stopOpacity="0" />
              </linearGradient>
              <radialGradient id="ship-glow"><stop stopColor="#40cfff" stopOpacity=".5" /><stop offset="1" stopColor="#128dff" stopOpacity="0" /></radialGradient>
              <filter id="ship-blur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2" /></filter>
            </defs>

            {/* Exhaust is kept close to the body and brightens with movement/hover. */}
            <ellipse className="ship-exhaust-halo" cx="32" cy="65" rx="10" ry="9" fill="url(#ship-glow)" filter="url(#ship-blur)" />
            <path className="ship-flame" d="M27 55 Q32 59 37 55 L34 72 Q32 77 30 72 Z" fill="url(#ship-flame)" />
            <path d="M27 55 L23 62 L28 60 M37 55 L41 62 L36 60" stroke="#40cfff" strokeWidth="1.4" strokeLinecap="round" />

            {/* Swept exploration wings with separate metallic panels. */}
            <path d="M27 25 L16 18 L4 38 L22 47 L28 41 Z" fill="url(#ship-wing)" stroke="#dcecff" strokeOpacity=".72" strokeWidth=".8" />
            <path d="M37 25 L48 18 L60 38 L42 47 L36 41 Z" fill="url(#ship-wing)" stroke="#dcecff" strokeOpacity=".72" strokeWidth=".8" />
            <path d="M17 25 L9 37 L22 42 M47 25 L55 37 L42 42" stroke="#526b88" strokeOpacity=".7" strokeWidth="1" />
            <path d="M12 33 L19 36 M52 33 L45 36" stroke="#f8fdff" strokeOpacity=".8" strokeWidth="1.2" />
            <path d="M7 37 L11 35" stroke="#52e9ff" strokeWidth="2" strokeLinecap="round" />
            <path d="M57 37 L53 35" stroke="#52e9ff" strokeWidth="2" strokeLinecap="round" />

            {/* Fuselage, armored nose, raised cockpit and service details. */}
            <path d="M32 4 C28 10 23 20 22 31 L21 49 Q21 54 26 57 L32 60 L38 57 Q43 54 43 49 L42 31 C41 20 36 10 32 4Z" fill="url(#ship-shell)" stroke="#f6fcff" strokeWidth=".9" />
            <path d="M32 6 C28 15 28 20 28 25 L32 28 L36 25 C36 19 35 13 32 6Z" fill="#fff" fillOpacity=".72" />
            <path d="M25 35 Q32 31 39 35 L40 42 Q32 46 24 42Z" fill="#102c52" stroke="#a9d7eb" strokeWidth=".8" />
            <path d="M26 36 Q32 33 38 36 L37 40 Q32 42 27 40Z" fill="url(#ship-blue)" />
            <path d="M27 36 Q32 34 36 35" stroke="#efffff" strokeOpacity=".9" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M23 47 Q32 51 41 47 M25 51 Q32 55 39 51" stroke="#617994" strokeWidth=".75" />
            <path d="M30 45 L30 49 M34 45 L34 49" stroke="#d7f6ff" strokeOpacity=".8" strokeWidth=".7" />
            <rect x="29.6" y="55" width="4.8" height="4.5" rx="1.1" fill="#233b57" stroke="#bad0e2" strokeWidth=".6" />
            <ellipse cx="32" cy="58.3" rx="1.3" ry=".8" fill="#61e6ff" />
            <circle cx="23.5" cy="43" r="1.15" fill="#4be8ff" />
            <circle cx="40.5" cy="43" r="1.15" fill="#4be8ff" />
            <path d="M32 4 L32 1.7" stroke="#c9faff" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  );
}
