"use client";

import { motion } from "framer-motion";

const COLOR = "#558065";

export default function PencilIcon({ size = 52 }: { size?: number }) {
  const w = Math.round(size * (14 / 52));

  return (
    // Outer container — gives room for the tilted pencil + squiggle
    <div style={{ position: "relative", width: 80, height: 68, display: "inline-block" }}>

      {/* ── Pencil ── */}
      <motion.div
        // Entry: swings in from a steeper tilt and springs to writing angle
        initial={{ scale: 0.2, opacity: 0, rotate: 72 }}
        animate={{ scale: 1, opacity: 1, rotate: 38 }}
        transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.15 }}
        style={{ position: "absolute", top: 2, left: 20, transformOrigin: "60% 60%" }}
      >
        {/* Write press — dips down and springs back, loops */}
        <motion.div
          animate={{ rotate: [0, -6, 3, 0] }}
          transition={{ duration: 0.7, delay: 0.85, ease: [0.4, 0, 0.2, 1], repeat: Infinity, repeatDelay: 3.1 }}
        >
          {/* Continuous float + sway */}
          <motion.div
            animate={{ y: [0, -4, 0], rotate: [0, -2, 2, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
          >
            <svg width={w} height={size} viewBox="0 0 14 52" fill="none">

              {/* Outer silhouette — draws on first */}
              <motion.path
                d="M2.5 11 Q2.5 2 7 2 Q11.5 2 11.5 11 L11.5 38 L7 50.5 L2.5 38 Z"
                stroke={COLOR} strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.75, delay: 0.4, ease: "easeOut" }}
              />

              {/* Eraser bottom / ferrule top */}
              <motion.line
                x1="2.5" y1="11" x2="11.5" y2="11"
                stroke={COLOR} strokeWidth="1.7" strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.22, delay: 0.88 }}
              />

              {/* Ferrule bottom */}
              <motion.line
                x1="2.5" y1="15" x2="11.5" y2="15"
                stroke={COLOR} strokeWidth="1.7" strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.22, delay: 1.02 }}
              />

              {/* Wood / graphite separator */}
              <motion.line
                x1="3" y1="38" x2="11" y2="38"
                stroke={COLOR} strokeWidth="1.2" strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.22, delay: 1.16 }}
              />

              {/* Dashed ridge line down the body */}
              <motion.line
                x1="7" y1="15" x2="7" y2="38"
                stroke={COLOR} strokeWidth="0.7" strokeLinecap="round"
                strokeDasharray="1.5 3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              />

              {/* Graphite tip dot */}
              <motion.circle
                cx="7" cy="49.5" r="1"
                fill={COLOR}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 16, delay: 1.38 }}
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Squiggle — appears at the tip after pencil draws ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 1.55 }}
        style={{ position: "absolute", bottom: 0, left: 0 }}
      >
        <svg width="46" height="18" viewBox="0 0 46 18" fill="none">
          {/* Main squiggle wave */}
          <motion.path
            d="M2 12 Q8 2 14 9 Q20 16 26 9 Q32 2 38 9 Q42 13 44 10"
            stroke={COLOR} strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            animate={{ pathLength: [0, 1], opacity: [0, 1] }}
            transition={{ duration: 0.7, delay: 1.6, ease: "easeOut", repeat: Infinity, repeatDelay: 2.6 }}
          />
          {/* Small loop at the end — like dotting an i */}
          <motion.path
            d="M44 10 Q47 5 44 8"
            stroke={COLOR} strokeWidth="2.5"
            strokeLinecap="round"
            animate={{ pathLength: [0, 1], opacity: [0, 0.7] }}
            transition={{ duration: 0.25, delay: 2.2, ease: "easeOut", repeat: Infinity, repeatDelay: 3.05 }}
          />
        </svg>
      </motion.div>
    </div>
  );
}
