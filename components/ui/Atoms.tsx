"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, Play } from "lucide-react";
import { STATUS_LABEL, STATUS_TONE } from "@/data/equipment-status";
import type { EquipmentStatus } from "@/data/types";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2 sm:gap-2.5">
      <span className="relative grid h-8 w-8 shrink-0 place-items-center sm:h-9 sm:w-9">
        <svg viewBox="0 0 40 40" className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden="true">
          <defs>
            <linearGradient id="logo-planet" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8fd3ff" />
              <stop offset="55%" stopColor="#2f7dff" />
              <stop offset="100%" stopColor="#ff7a3c" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="10" fill="url(#logo-planet)" />
          <ellipse
            cx="20"
            cy="20"
            rx="17"
            ry="5.5"
            fill="none"
            stroke="#ffd76b"
            strokeWidth="1.6"
            opacity="0.9"
            transform="rotate(-22 20 20)"
          />
          <circle cx="31" cy="9" r="1.4" fill="#fff2c9" />
          <circle cx="8" cy="30" r="1" fill="#bde6ff" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="display text-[clamp(0.96rem,4vw,1.15rem)] tracking-[0.06em] text-white">AFTERLIGHT</span>
        {!compact && (
          <span className="mt-1 whitespace-nowrap text-[0.55rem] uppercase tracking-[0.08em] text-cyan/85 sm:text-[0.65rem] sm:tracking-[0.12em]">
            Beyond the last mission
          </span>
        )}
      </span>
    </span>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`eyebrow ${className}`}>{children}</span>;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className = "",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-x-6 gap-y-4 ${className}`}>
      <div className="min-w-0 max-w-2xl flex-[1_1_20rem]">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="display mt-2 text-[clamp(1.7rem,4.5vw,2.7rem)] !leading-[1.04] text-white [overflow-wrap:anywhere]">{title}</h2>
        {description && <p className="mt-3 text-sm leading-relaxed text-slate-400">{description}</p>}
      </div>
      {action && <div className="min-w-0 max-w-full">{action}</div>}
    </div>
  );
}

export function AnimatedNumber({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  duration = 1500,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className="data tabular-nums">
      {prefix}
      {display.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

export function StatusPill({ status }: { status: EquipmentStatus }) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-[0.45rem] border-2 px-2.5 py-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] ${STATUS_TONE[status]}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current shadow-[0_0_6px_currentColor]" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PrevNext({
  onPrev,
  onNext,
  prevLabel = "Previous",
  nextLabel = "Next",
  current,
  total,
  className = "",
}: {
  onPrev: () => void;
  onNext: () => void;
  prevLabel?: string;
  nextLabel?: string;
  current?: number;
  total?: number;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 max-w-full flex-wrap items-center gap-2 ${className}`}>
      <button onClick={onPrev} className="btn btn-ghost !px-3.5 !py-2.5 !text-[0.75rem]" aria-label={prevLabel}>
        <ArrowLeft size={14} />
        <span className="hidden sm:inline">{prevLabel}</span>
      </button>
      {typeof current === "number" && typeof total === "number" && (
        <span className="data shrink-0 px-1 text-[0.75rem] text-slate-300">
          {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      )}
      <button onClick={onNext} className="btn btn-ghost !px-3.5 !py-2.5 !text-[0.75rem]" aria-label={nextLabel}>
        <span className="hidden sm:inline">{nextLabel}</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

export function SourceLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={`inline-flex max-w-full items-baseline gap-1.5 text-cyan/85 underline decoration-cyan/30 underline-offset-4 transition hover:text-cyan ${className}`}
    >
      <span className="min-w-0 [overflow-wrap:anywhere]">{children}</span>
      <ExternalLink size={11} className="shrink-0" aria-hidden="true" />
    </a>
  );
}

export function FilmButton({
  onClick,
  label = "Watch film",
  className = "",
}: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <button onClick={onClick} className={`btn btn-ghost ${className}`}>
      <span className="grid h-6 w-6 place-items-center rounded-[0.4rem] border-2 border-cyan/60 bg-cyan/10">
        <Play size={11} className="translate-x-[1px] fill-cyan text-cyan" />
      </span>
      {label}
    </button>
  );
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between gap-3 text-[0.75rem] uppercase tracking-[0.1em] text-slate-300">
          <span>{label}</span>
          <span className="data text-cyan">{Math.round(value)}%</span>
        </div>
      )}
      <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan via-electric to-gold"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export function Breadcrumb({
  items,
}: {
  items: { label: string; onClick?: () => void }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] uppercase tracking-[0.08em] text-slate-400">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-2">
          {i > 0 && <span className="text-slate-500" aria-hidden="true">/</span>}
          {item.onClick ? (
            <button onClick={item.onClick} className="text-action min-h-11 text-left transition hover:text-cyan [overflow-wrap:anywhere]">
              {item.label}
            </button>
          ) : (
            <span className="text-slate-300 [overflow-wrap:anywhere]" aria-current={i === items.length - 1 ? "page" : undefined}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function LinkAsButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-cyan underline underline-offset-4">
      {children}
    </Link>
  );
}
