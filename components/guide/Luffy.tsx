"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import type { Expression, Pose } from "@/data/types";

/**
 * framer-motion rewrites `transform-origin` on SVG groups to the element's own
 * centre, which tears a limb out of its socket. Joints therefore use plain
 * groups with CSS transforms, where the pivot is exactly where we put it.
 */
function joint(rotate: number, origin: string, extra?: CSSProperties): CSSProperties {
  return {
    transform: `rotate(${rotate}deg)`,
    transformOrigin: origin,
    transformBox: "view-box",
    transition: "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)",
    ...extra,
  };
}

interface LuffyProps {
  expression?: Expression;
  pose?: Pose;
  talking?: boolean;
  className?: string;
  mirror?: boolean;
  compact?: boolean;
}

/**
 * AFTERLIGHT's guide: an original anime-styled straw-hat explorer drawn as
 * vector art. To use an authorised/licensed character illustration instead,
 * drop a transparent PNG at public/guide/luffy.png and pass customArt to the
 * <GuidePortrait /> wrapper — see components/guide/GuidePortrait.tsx.
 */
/**
 * A hand, drawn in the arm's own local frame so its fingers always follow the
 * limb: the arm rotates, the fingers rotate with it. No detached limbs.
 */
function Hand({
  x,
  y,
  variant,
}: {
  x: number;
  y: number;
  variant: "fist" | "open" | "point";
}) {
  const outline = "#d99a6c";

  return (
    <g>
      {/* thumb sits on the inner edge of the palm */}
      <ellipse cx={x - 8} cy={y - 0.5} rx="4.6" ry="3.4" fill="url(#lf-skin)" transform={`rotate(-24 ${x - 8} ${y - 0.5})`} />
      <ellipse
        cx={x - 8}
        cy={y - 0.5}
        rx="4.6"
        ry="3.4"
        fill="none"
        stroke={outline}
        strokeWidth="0.9"
        transform={`rotate(-24 ${x - 8} ${y - 0.5})`}
      />

      {variant === "open" ? (
        <g>
          <ellipse cx={x} cy={y + 1.5} rx="8.2" ry="7.8" fill="url(#lf-skin)" stroke={outline} strokeWidth="0.9" />
          {/* four splayed fingers, each with its own edge so it reads at 36px */}
          {[
            { dx: -6.4, len: 10, rot: -20 },
            { dx: -2.2, len: 12, rot: -7 },
            { dx: 2.2, len: 11.5, rot: 6 },
            { dx: 6.4, len: 9.5, rot: 19 },
          ].map((f) => (
            <g key={f.dx} transform={`rotate(${f.rot} ${x + f.dx} ${y + 6})`}>
              <line
                x1={x + f.dx}
                y1={y + 4}
                x2={x + f.dx}
                y2={y + 5 + f.len}
                stroke="url(#lf-skin)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <line
                x1={x + f.dx}
                y1={y + 5}
                x2={x + f.dx}
                y2={y + 5 + f.len}
                stroke={outline}
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.85"
              />
            </g>
          ))}
        </g>
      ) : (
        <g>
          {/* closed hand: palm, curled finger mass, knuckle creases */}
          <circle cx={x} cy={y + 1.5} r="8.4" fill="url(#lf-skin)" stroke={outline} strokeWidth="0.9" />
          <path
            d={`M${x - 5.2} ${y + 3.6} q5.2 3.2 10.4 0`}
            stroke={outline}
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M${x - 2.8} ${y + 7.8} l0 -2.4 M${x + 2.8} ${y + 7.8} l0 -2.4`}
            stroke={outline}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          {variant === "point" && (
            <g>
              {/* extended index finger, inline with the forearm */}
              <line
                x1={x + 0.6}
                y1={y + 6}
                x2={x + 0.6}
                y2={y + 20}
                stroke="#f7c69e"
                strokeWidth="6.4"
                strokeLinecap="round"
              />
              <line
                x1={x + 2.2}
                y1={y + 7}
                x2={x + 2.2}
                y2={y + 19}
                stroke={outline}
                strokeWidth="1.1"
                strokeLinecap="round"
                opacity="0.9"
              />
              <circle cx={x + 0.6} cy={y + 20.5} r="1.6" fill="#ffd8b6" />
            </g>
          )}
        </g>
      )}
    </g>
  );
}

export default function Luffy({
  expression = "grin",
  pose = "idle",
  talking = false,
  className,
  mirror = false,
  compact = false,
}: LuffyProps) {
  // The raised arm is rotated at the shoulder; the forearm adds its own bend so
  // the limb never reads as a single stiff tube.
  const armRotate = pose === "wave" ? -118 : pose === "point" ? -38 : pose === "think" ? -132 : 8;
  const elbowBend = pose === "wave" ? -6 : pose === "point" ? -16 : pose === "think" ? 74 : 10;
  const handVariant: "fist" | "open" | "point" =
    pose === "wave" ? "open" : pose === "point" ? "point" : "fist";

  return (
    <svg
      /* the compact crop is Luffy's head and hat only — the dock bubble is a
         face, not a hat brim with eyes peeking under it */
      viewBox={compact ? "44 16 132 132" : "0 0 220 300"}
      className={className}
      role="img"
      aria-label={`Luffy, your exploration guide, looking ${expression}`}
      style={{ overflow: "visible", transform: mirror ? "scaleX(-1)" : undefined }}
    >
      <defs>
        <radialGradient id="lf-halo" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#5fd0ff" stopOpacity="0.42" />
          <stop offset="55%" stopColor="#2f7dff" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#050a18" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lf-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd3ae" />
          <stop offset="100%" stopColor="#efb082" />
        </linearGradient>
        <linearGradient id="lf-vest" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e04a3a" />
          <stop offset="100%" stopColor="#a81f22" />
        </linearGradient>
        <linearGradient id="lf-hat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffeec4" />
          <stop offset="100%" stopColor="#e9c88c" />
        </linearGradient>
        <filter id="lf-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* atmospheric halo */}
      <ellipse cx="110" cy="150" rx="104" ry="140" fill="url(#lf-halo)" />

      <motion.g
        animate={{ y: [0, -3.5, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* legs */}
        <g stroke="#1a2740" strokeWidth="17" strokeLinecap="round">
          <line x1="94" y1="228" x2="90" y2="272" />
          <line x1="126" y1="228" x2="131" y2="272" />
        </g>
        <ellipse cx="86" cy="279" rx="13" ry="6" fill="#4a3324" />
        <ellipse cx="135" cy="279" rx="13" ry="6" fill="#4a3324" />

        {/* torso + vest */}
        <path d="M86 156 Q110 147 134 156 L140 228 Q110 238 80 228 Z" fill="url(#lf-skin)" />
        <path d="M86 156 Q97 152 105 159 L101 229 Q88 231 80 227 Z" fill="url(#lf-vest)" />
        <path d="M134 156 Q123 152 115 159 L119 229 Q132 231 140 227 Z" fill="url(#lf-vest)" />
        <path d="M101 159 Q110 170 119 159" stroke="#7d1418" strokeWidth="2.5" fill="none" />
        <rect x="80" y="222" width="60" height="11" rx="4" fill="#f2c14b" />
        <path d="M80 229 Q110 239 140 229 L140 250 Q110 261 80 250 Z" fill="#2f5fa8" />
        <path d="M110 233 L110 257" stroke="#244a86" strokeWidth="2" />

        {/* left arm (viewer left) — hangs behind the torso, elbow barely bent */}
        <g
          style={joint(pose === "idle" ? -2 : -4, "86px 164px", {
            animation: pose === "idle" ? "luffy-sway 4.6s ease-in-out infinite" : undefined,
          })}
        >
          <line
            x1="86"
            y1="164"
            x2="79"
            y2="191"
            stroke="#f7c69e"
            strokeWidth="15"
            strokeLinecap="round"
          />
          <g style={joint(pose === "idle" ? 6 : 10, "79px 191px")}>
            <line
              x1="79"
              y1="191"
              x2="72"
              y2="211"
              stroke="#f7c69e"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <Hand x={70} y={216} variant="fist" />
          </g>
        </g>

        {/* head group */}
        <g>
          {/* back hair */}
          <path
            d="M66 96 Q62 52 110 44 Q158 52 154 96 L150 118 Q146 88 110 82 Q74 88 70 118 Z"
            fill="#171a22"
          />
          {/* ears */}
          <ellipse cx="70" cy="104" rx="7" ry="10" fill="#efb082" />
          <ellipse cx="150" cy="104" rx="7" ry="10" fill="#efb082" />
          {/* face */}
          <ellipse cx="110" cy="101" rx="41" ry="46" fill="url(#lf-skin)" />
          {/* jaw shadow */}
          <path d="M78 118 Q110 158 142 118 Q138 148 110 152 Q82 148 78 118 Z" fill="#e6a578" opacity="0.35" />

          {/* hair fringe */}
          <path
            d="M69 92 Q72 56 110 50 Q148 56 151 92 Q140 76 128 84 Q124 66 110 72 Q96 66 92 84 Q80 76 69 92 Z"
            fill="#171a22"
          />
          <path d="M84 62 Q96 55 104 62" stroke="#2b303d" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* eyebrows */}
          <motion.g
            animate={{
              y: expression === "wow" ? -3 : expression === "serious" ? 2 : 0,
              rotate: expression === "serious" ? 8 : 0,
            }}
            transition={{ duration: 0.25 }}
            style={{ transformOrigin: "110px 86px" }}
          >
            <path d="M84 84 Q92 79 100 83" stroke="#1b1d24" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M120 83 Q128 79 136 84" stroke="#1b1d24" strokeWidth="4" fill="none" strokeLinecap="round" />
          </motion.g>

          {/* eyes */}
          <g>
            <motion.g animate={{ scaleY: expression === "proud" ? 0.25 : 1 }} style={{ transformOrigin: "94px 101px" }}>
              <ellipse cx="94" cy="101" rx="10.5" ry="12" fill="#fff8f2" />
              <motion.circle
                cx="94"
                cy="101"
                r="6.4"
                fill="#1b2430"
                animate={{ cx: expression === "curious" ? 97 : expression === "wow" ? 95 : 94, r: expression === "wow" ? 7.2 : 6.4 }}
                transition={{ duration: 0.3 }}
              />
              <circle cx="91.5" cy="98" r="2.4" fill="#ffffff" />
            </motion.g>
            <motion.g animate={{ scaleY: expression === "proud" ? 0.25 : 1 }} style={{ transformOrigin: "126px 101px" }}>
              <ellipse cx="126" cy="101" rx="10.5" ry="12" fill="#fff8f2" />
              <motion.circle
                cx="126"
                cy="101"
                r="6.4"
                fill="#1b2430"
                animate={{ cx: expression === "curious" ? 129 : expression === "wow" ? 127 : 126, r: expression === "wow" ? 7.2 : 6.4 }}
                transition={{ duration: 0.3 }}
              />
              <circle cx="123.5" cy="98" r="2.4" fill="#ffffff" />
            </motion.g>
            {/* blink lids */}
            <motion.g
              animate={{ scaleY: [0, 0, 1, 0] }}
              transition={{ duration: 5.5, times: [0, 0.9, 0.94, 1], repeat: Infinity, repeatDelay: 2.2 }}
              style={{ transformOrigin: "110px 101px" }}
            >
              <rect x="82" y="88" width="56" height="26" rx="12" fill="url(#lf-skin)" />
            </motion.g>
          </g>

          {/* scar under left eye */}
          <g stroke="#c8785a" strokeWidth="2" strokeLinecap="round">
            <line x1="85" y1="114" x2="92" y2="114" />
            <line x1="88" y1="111" x2="88" y2="117" />
          </g>

          {/* nose */}
          <path d="M110 108 Q113 114 108 116" stroke="#d08e63" strokeWidth="2.4" fill="none" strokeLinecap="round" />

          {/* blush */}
          <ellipse cx="82" cy="118" rx="9" ry="5" fill="#ff8a7a" opacity={expression === "grin" || expression === "proud" ? 0.32 : 0.16} />
          <ellipse cx="138" cy="118" rx="9" ry="5" fill="#ff8a7a" opacity={expression === "grin" || expression === "proud" ? 0.32 : 0.16} />

          {/* mouth variants */}
          <motion.g animate={{ opacity: expression === "grin" || expression === "proud" ? 1 : 0 }} transition={{ duration: 0.2 }}>
            <motion.g
              animate={talking ? { scaleY: [1, 1.28, 0.92, 1.2, 1] } : { scaleY: 1 }}
              transition={talking ? { duration: 0.52, repeat: Infinity } : { duration: 0.2 }}
              style={{ transformOrigin: "110px 128px" }}
            >
              <path d="M91 120 Q110 147 129 120 Q110 130 91 120 Z" fill="#5c1f24" />
              <path d="M93 121 Q110 128 127 121 L126 124 Q110 131 94 124 Z" fill="#fffaf4" />
            </motion.g>
          </motion.g>
          <motion.g animate={{ opacity: expression === "wow" ? 1 : 0 }} transition={{ duration: 0.2 }}>
            <motion.ellipse
              cx="110"
              cy="129"
              rx="9"
              ry="11"
              fill="#5c1f24"
              animate={talking ? { ry: [10, 6, 11, 5, 10] } : { ry: 11 }}
              transition={talking ? { duration: 0.6, repeat: Infinity } : { duration: 0.2 }}
            />
          </motion.g>
          <motion.g animate={{ opacity: expression === "curious" ? 1 : 0 }} transition={{ duration: 0.2 }}>
            <ellipse cx="112" cy="128" rx="5.5" ry="6.5" fill="#5c1f24" />
          </motion.g>
          <motion.g animate={{ opacity: expression === "serious" ? 1 : 0 }} transition={{ duration: 0.2 }}>
            <path d="M99 128 Q110 133 121 128" stroke="#7a3a34" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          </motion.g>

          {/* straw hat */}
          <g>
            <ellipse cx="110" cy="58" rx="66" ry="15" fill="#d8b675" opacity="0.55" transform="translate(0 4)" filter="url(#lf-soft)" />
            <path d="M74 54 Q76 18 110 14 Q144 18 146 54 Q110 66 74 54 Z" fill="url(#lf-hat)" />
            <path d="M75 47 Q110 58 145 47 L145 55 Q110 66 75 55 Z" fill="#cf3b2f" />
            <ellipse cx="110" cy="57" rx="65" ry="14.5" fill="url(#lf-hat)" />
            <ellipse cx="110" cy="57" rx="65" ry="14.5" fill="none" stroke="#c9a86f" strokeWidth="1.4" />
            <path d="M52 55 Q80 68 110 68 Q140 68 168 55" stroke="#c9a86f" strokeWidth="1.2" fill="none" opacity="0.7" />
            <path d="M88 30 Q98 42 94 54 M110 26 Q110 40 110 55 M130 30 Q124 42 128 54" stroke="#d9bb84" strokeWidth="1.2" fill="none" opacity="0.8" />
          </g>
        </g>

        {/* right arm (viewer right) — shoulder swing, elbow bend, wrist */}
        <g style={joint(armRotate, "136px 164px")}>
          {/* upper arm */}
          <line
            x1="136"
            y1="164"
            x2="147"
            y2="189"
            stroke="#f7c69e"
            strokeWidth="15"
            strokeLinecap="round"
          />

          <g style={joint(elbowBend, "147px 189px")}>
            {/* forearm */}
            <line
              x1="147"
              y1="189"
              x2="153"
              y2="210"
              stroke="#f7c69e"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* the wrist carries the hand so a wave is a hand motion, not a limb swing */}
            <g
              style={joint(0, "154px 212px", {
                animation: pose === "wave" ? "luffy-wave 1.05s ease-in-out infinite" : undefined,
              })}
            >
              <Hand x={155} y={214} variant={handVariant} />
            </g>
          </g>
        </g>
      </motion.g>
    </svg>
  );
}
