"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "crumple" | "collapse" | "plane" | "flying" | "success";

const FLAPS = [
  {
    id: "top",
    clipPath: "polygon(0% 0%, 50% 50%, 100% 0%)",
    color: "#EDEAE5",
    origin: "top center",
    rx: 88,
    ry: 0,
    delay: 0,
  },
  {
    id: "right",
    clipPath: "polygon(100% 0%, 50% 50%, 100% 100%)",
    color: "#E8E5DF",
    origin: "right center",
    rx: 0,
    ry: -88,
    delay: 0.07,
  },
  {
    id: "bottom",
    clipPath: "polygon(0% 100%, 50% 50%, 100% 100%)",
    color: "#F0EDE8",
    origin: "bottom center",
    rx: -88,
    ry: 0,
    delay: 0.035,
  },
  {
    id: "left",
    clipPath: "polygon(0% 0%, 50% 50%, 0% 100%)",
    color: "#EAE7E1",
    origin: "left center",
    rx: 0,
    ry: 88,
    delay: 0.1,
  },
];

export default function PaperCrumpleTransition({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("crumple");
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const t = (ms: number, fn: () => void) => setTimeout(fn, ms);
    timersRef.current = [
      t(620,  () => setPhase("collapse")),
      t(980,  () => setPhase("plane")),
      t(1900, () => setPhase("flying")),
      t(2700, () => setPhase("success")),
    ];
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase === "success") {
      autoRef.current = setTimeout(() => onDone(), 4000);
      return () => { if (autoRef.current) clearTimeout(autoRef.current); };
    }
  }, [phase, onDone]);

  const showCrumple = phase === "crumple" || phase === "collapse";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.12 }}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#F5F2EC",
        zIndex: 100,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >

      {/* ── Crumple / collapse ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCrumple && (
          <motion.div
            key="crumple-container"
            exit={{
              scale: 0,
              opacity: 0,
              transition: { duration: 0.32, ease: [0.4, 0, 1, 1] },
            }}
            style={{
              position: "absolute",
              inset: 0,
              /* perspective on parent makes children 3D-transform in shared space */
              perspective: 900,
              perspectiveOrigin: "50% 50%",
            }}
          >
            {/* Paper base — visible through gaps as flaps fold */}
            <div style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#FAF8F4",
            }} />

            {/* Crease lines — the fold marks on the paper */}
            <svg
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(0,0,0,0.055)" strokeWidth="0.35" />
              <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(0,0,0,0.055)" strokeWidth="0.35" />
              <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(0,0,0,0.03)" strokeWidth="0.2" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(0,0,0,0.03)" strokeWidth="0.2" />
            </svg>

            {/* 4 triangular flaps */}
            {FLAPS.map((flap) => (
              <motion.div
                key={flap.id}
                initial={{ rotateX: 0, rotateY: 0 }}
                animate={{ rotateX: flap.rx, rotateY: flap.ry }}
                transition={{
                  duration: 0.52,
                  delay: flap.delay,
                  ease: [0.4, 0, 0.2, 1],
                }}
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: flap.color,
                  clipPath: flap.clipPath,
                  transformOrigin: flap.origin,
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "visible",
                  /* inner shadow hints at paper thickness */
                  boxShadow: "inset 0 0 50px rgba(0,0,0,0.05)",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Paper plane ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {(phase === "plane" || phase === "flying") && (
          <motion.div
            key="plane"
            initial={{ scale: 0, opacity: 0, rotate: -20, x: 0, y: 0 }}
            animate={
              phase === "plane"
                ? {
                    scale: 1,
                    opacity: 1,
                    rotate: -10,
                    x: 0,
                    y: 0,
                  }
                : {
                    scale:   [1,   1.1,  0.9,  0.75],
                    opacity: [1,   1,    1,    0   ],
                    x:       [0,   18,   160,  380 ],
                    y:       [0,  -25,  -90,  -180 ],
                    rotate:  [-10, -18,  -12,  -4  ],
                  }
            }
            transition={
              phase === "plane"
                ? {
                    type: "spring",
                    stiffness: 280,
                    damping: 20,
                    opacity: { duration: 0.25 },
                  }
                : {
                    duration: 0.82,
                    ease: [0.25, 0.1, 0.3, 1],
                    times: [0, 0.2, 0.6, 1],
                  }
            }
            style={{ width: 140, height: 70, flexShrink: 0 }}
          >
            <PaperPlaneSVG />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dotted trail ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "flying" && (
          <motion.div
            key="trail"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.5, scale: 1 }}
                animate={{ opacity: 0, scale: 0.2 }}
                transition={{ delay: i * 0.06, duration: 0.45 }}
                style={{
                  position: "absolute",
                  left: `calc(50% - ${i * 22}px)`,
                  top: `calc(50% + ${i * 11}px)`,
                  width: Math.max(2, 6 - i),
                  height: Math.max(2, 6 - i),
                  borderRadius: "50%",
                  backgroundColor: "#B8B4AC",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Success screen ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "0 40px",
              textAlign: "center",
              width: "100%",
              maxWidth: 390,
            }}
          >
            <p style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "20px",
              fontWeight: 400,
              color: "#202126",
              maxWidth: "300px",
              lineHeight: 1.85,
              margin: 0,
              letterSpacing: "-0.03em",
            }}>
              your story is live.<br />
              somewhere out there,<br />
              someone is going to read this<br />
              and think —<br />
              &apos;I need to try that.&apos;
            </p>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              onClick={() => {
                if (autoRef.current) clearTimeout(autoRef.current);
                onDone();
              }}
              style={{
                marginTop: 48,
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
                fontSize: "15px",
                color: "#202126",
                background: "none",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.01em",
                padding: "8px 0",
              }}
            >
              start exploring →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

// ── Off-white paper plane SVG (side view, pointing right) ──────────────────
function PaperPlaneSVG() {
  return (
    <svg
      viewBox="0 0 140 70"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: "100%",
        height: "100%",
        filter: "drop-shadow(0px 5px 10px rgba(0,0,0,0.12))",
      }}
    >
      {/* Main body — top wing + fuselage triangle */}
      <path
        d="M 4,35 L 136,8 L 136,62 Z"
        fill="#F0EDE7"
        stroke="#C4C0B8"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      {/* Center fold — the spine of the plane */}
      <line
        x1="4" y1="35"
        x2="102" y2="35"
        stroke="#C4C0B8"
        strokeWidth="0.9"
      />
      {/* Top crease from fold to nose */}
      <path
        d="M 102,35 L 136,8"
        fill="none"
        stroke="#B8B4AC"
        strokeWidth="0.75"
      />
      {/* Lower belly wing — the small visible flap underneath */}
      <path
        d="M 62,35 L 102,35 L 112,50 L 78,46 Z"
        fill="#E5E2DB"
        stroke="#C4C0B8"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      {/* Subtle inner shadow on top wing near fold */}
      <path
        d="M 4,35 L 80,23"
        fill="none"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}
