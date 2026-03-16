"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Typewriter } from "./Typewriter";
import WelcomeSheet from "./WelcomeSheet";

const quoteText  = '\u201cMan cannot discover new oceans unless he has the courage to lose sight of the shore.\u201d';
const attribution = '\u2014 Andr\u00e9 Gide';

const baseFont: React.CSSProperties = {
  fontFamily: "'Courier New', Courier, monospace",
  letterSpacing: "-0.02em",
};

// Deterministic dust particles — fixed seeds so no hydration mismatch
const PARTICLES = [
  { x: 12,  y: 18,  size: 2.5, dur: 9,  delay: 0,    dy: -28, dx: 6  },
  { x: 78,  y: 32,  size: 2,   dur: 13, delay: 1.5,  dy: -20, dx: -8 },
  { x: 55,  y: 72,  size: 3,   dur: 11, delay: 0.8,  dy: -35, dx: 4  },
  { x: 88,  y: 55,  size: 1.5, dur: 15, delay: 2.2,  dy: -18, dx: -5 },
  { x: 22,  y: 65,  size: 2,   dur: 10, delay: 3.1,  dy: -30, dx: 10 },
  { x: 65,  y: 10,  size: 2.5, dur: 14, delay: 0.4,  dy: -22, dx: -6 },
  { x: 40,  y: 85,  size: 1.5, dur: 12, delay: 1.9,  dy: -25, dx: 7  },
  { x: 92,  y: 78,  size: 2,   dur: 8,  delay: 2.7,  dy: -32, dx: -9 },
  { x: 6,   y: 44,  size: 1.5, dur: 16, delay: 0.2,  dy: -16, dx: 5  },
  { x: 72,  y: 92,  size: 2.5, dur: 11, delay: 3.5,  dy: -28, dx: -4 },
];

export default function SplashScreen({ onStartExploring }: { onStartExploring?: () => void }) {
  const [quoteDone, setQuoteDone] = useState(false);
  const [done, setDone]           = useState(false);
  const [showSheet, setShowSheet] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#FFF7ED",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Dust particles */}
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, p.dy * 0.5, p.dy],
            x: [0, p.dx * 0.5, p.dx],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: "#8B6F47",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Quote + button — centered as a unit */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
        <Typewriter
          text={quoteText}
          speed={58}
          cursor="|"
          loop={false}
          onComplete={() => setQuoteDone(true)}
          style={{
            ...baseFont,
            fontSize: "20px",
            color: "#202020",
            fontWeight: 700,
            lineHeight: 1.3,
            textAlign: "center",
            display: "inline-block",
            maxWidth: "280px",
          }}
        />

        {quoteDone && (
          <Typewriter
            text={attribution}
            speed={58}
            cursor="|"
            loop={false}
            onComplete={() => setDone(true)}
            style={{
              ...baseFont,
              fontSize: "14px",
              color: "#8A8075",
              fontWeight: 700,
              textAlign: "center",
              display: "inline-block",
              marginTop: "4px",
            }}
          />
        )}

        <AnimatePresence>
          {done && (
            <motion.button
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              style={{
                ...baseFont,
                marginTop: "48px",
                width: "280px",
                padding: "18px 0",
                backgroundColor: "#282828",
                color: "#ffffff",
                fontSize: "18px",
                fontWeight: 700,
                border: "none",
                borderRadius: "14px",
                cursor: "pointer",
                letterSpacing: "-0.01em",
              }}
              onClick={() => setShowSheet(true)}
            >
              Continue
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <WelcomeSheet open={showSheet} onClose={() => setShowSheet(false)} onStartExploring={onStartExploring} />
    </div>
  );
}
