"use client";

import { useState } from "react";
import {
  motion,
  useAnimation,
  AnimatePresence,
} from "framer-motion";

export default function EnvelopePage() {
  const [opened, setOpened] = useState(false);
  const [sealCracked, setSealCracked] = useState(false);
  const [flapping, setFlapping] = useState(false);
  const sealControls = useAnimation();

  const handleTap = async () => {
    if (opened) return;

    // 1. Crack the seal
    setSealCracked(false);
    await sealControls.start({
      scale: 1.25,
      transition: { duration: 0.18, ease: "easeOut" },
    });
    await sealControls.start({
      scale: [1.25, 0.92, 1.05, 1],
      rotate: [0, -4, 3, 0],
      transition: { duration: 0.35, ease: "easeInOut" },
    });
    setSealCracked(true);

    // 2. Open the flap
    await new Promise((r) => setTimeout(r, 80));
    setFlapping(true);

    // 3. Show the letter
    await new Promise((r) => setTimeout(r, 420));
    setOpened(true);
  };

  return (
    <main
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{
        width: "390px",
        minHeight: "100svh",
        background: "#1C1A17",
        margin: "0 auto",
      }}
    >
      {/* Floating envelope container */}
      <motion.div
        className="relative flex items-center justify-center cursor-pointer select-none"
        animate={!opened ? { y: [0, -6, 0] } : { y: 0 }}
        transition={
          !opened
            ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3 }
        }
        onClick={handleTap}
        style={{ zIndex: 10 }}
      >
        {/* ── Envelope shell ── */}
        <div
          className="relative"
          style={{
            width: 280,
            height: 200,
            perspective: "800px",
          }}
        >
          {/* Envelope body */}
          <div
            className="absolute inset-0 rounded-sm shadow-2xl"
            style={{ background: "#F0E6D3" }}
          />

          {/* Bottom-left triangle fold */}
          <svg
            className="absolute inset-0"
            width="280"
            height="200"
            viewBox="0 0 280 200"
            style={{ pointerEvents: "none" }}
          >
            {/* Left inner fold */}
            <polygon
              points="0,200 0,60 140,120"
              fill="#E8D9C2"
              opacity="0.9"
            />
            {/* Right inner fold */}
            <polygon
              points="280,200 280,60 140,120"
              fill="#EDE0CC"
              opacity="0.9"
            />
            {/* Bottom fold */}
            <polygon
              points="0,200 280,200 140,120"
              fill="#E2D5BE"
              opacity="0.85"
            />
            {/* Envelope border */}
            <rect
              x="0.5"
              y="0.5"
              width="279"
              height="199"
              rx="2"
              ry="2"
              fill="none"
              stroke="#C9B99A"
              strokeWidth="1"
            />
          </svg>

          {/* Top flap — animates open */}
          <motion.div
            className="absolute left-0 right-0 top-0"
            style={{
              transformOrigin: "top center",
              transformStyle: "preserve-3d",
              zIndex: 20,
            }}
            animate={flapping ? { rotateX: -165 } : { rotateX: 0 }}
            transition={
              flapping
                ? { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }
                : { duration: 0 }
            }
          >
            <svg
              width="280"
              height="110"
              viewBox="0 0 280 110"
              style={{ display: "block" }}
            >
              {/* Flap triangle */}
              <polygon
                points="0,0 280,0 140,105"
                fill="#EDE0CC"
              />
              {/* Flap bottom edge highlight */}
              <line
                x1="0"
                y1="0"
                x2="140"
                y2="105"
                stroke="#C9B99A"
                strokeWidth="1"
                opacity="0.7"
              />
              <line
                x1="280"
                y1="0"
                x2="140"
                y2="105"
                stroke="#C9B99A"
                strokeWidth="1"
                opacity="0.7"
              />
            </svg>
          </motion.div>

          {/* Wax seal */}
          <motion.div
            animate={sealControls}
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: flapping ? 5 : 25,
            }}
          >
            <svg
              width="54"
              height="54"
              viewBox="0 0 54 54"
              style={{ display: "block", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))" }}
            >
              {/* Seal body */}
              <circle cx="27" cy="27" r="25" fill="#8B1A1A" />
              <circle cx="27" cy="27" r="23" fill="#9E2020" />

              {/* Decorative inner ring */}
              <circle
                cx="27"
                cy="27"
                r="18"
                fill="none"
                stroke="#6B1414"
                strokeWidth="1.5"
                opacity="0.8"
              />
              <circle
                cx="27"
                cy="27"
                r="13"
                fill="none"
                stroke="#6B1414"
                strokeWidth="1"
                opacity="0.6"
              />

              {/* Cross / fleur pattern */}
              <g stroke="#6B1414" strokeWidth="1.5" strokeLinecap="round" opacity="0.9">
                <line x1="27" y1="14" x2="27" y2="40" />
                <line x1="14" y1="27" x2="40" y2="27" />
                <line x1="18.5" y1="18.5" x2="35.5" y2="35.5" />
                <line x1="35.5" y1="18.5" x2="18.5" y2="35.5" />
              </g>

              {/* Center dot */}
              <circle cx="27" cy="27" r="3" fill="#6B1414" opacity="0.9" />

              {/* Petal decorations */}
              <g fill="#7A1818" opacity="0.7">
                <ellipse cx="27" cy="18" rx="2.5" ry="4" />
                <ellipse cx="27" cy="36" rx="2.5" ry="4" />
                <ellipse cx="18" cy="27" rx="4" ry="2.5" />
                <ellipse cx="36" cy="27" rx="4" ry="2.5" />
              </g>

              {/* Crack overlay when seal is cracked */}
              {sealCracked && (
                <g stroke="#5A0F0F" strokeWidth="1" opacity="0.7" strokeLinecap="round">
                  <path d="M22,15 L25,22 L20,26 L27,27 L24,34 L28,40" fill="none" />
                  <path d="M31,16 L30,23 L35,25 L27,27 L32,33" fill="none" />
                  <line x1="15" y1="24" x2="21" y2="27" />
                  <line x1="37" y1="29" x2="43" y2="32" />
                </g>
              )}

              {/* Shine */}
              <ellipse cx="21" cy="20" rx="4" ry="2.5" fill="white" opacity="0.1" transform="rotate(-30 21 20)" />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* "tap to open" hint */}
      <AnimatePresence>
        {!opened && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            style={{
              marginTop: 28,
              color: "#F0E6D3",
              opacity: 0.65,
              fontStyle: "italic",
              fontSize: 14,
              letterSpacing: "0.04em",
              fontFamily: "Georgia, serif",
              userSelect: "none",
            }}
          >
            tap to open
          </motion.p>
        )}
      </AnimatePresence>

      {/* Letter overlay */}
      <AnimatePresence>
        {opened && (
          <motion.div
            key="letter"
            initial={{ y: 80, scaleY: 0.6, opacity: 0 }}
            animate={{ y: 0, scaleY: 1, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 22,
              mass: 1,
            }}
            className="absolute flex flex-col items-center justify-start overflow-hidden"
            style={{
              width: 258,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#F5EDD9",
              borderRadius: 4,
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
              padding: "36px 28px",
              minHeight: 340,
              zIndex: 50,
              transformOrigin: "bottom center",
            }}
          >
            {/* Ruled lines */}
            <div
              className="absolute inset-0"
              style={{ borderRadius: 4, overflow: "hidden", pointerEvents: "none" }}
            >
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: 20,
                    right: 20,
                    top: 72 + i * 28,
                    height: 1,
                    background: "#C9B99A",
                    opacity: 0.35,
                  }}
                />
              ))}
            </div>

            {/* Letter content */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 20,
                lineHeight: 1.65,
                color: "#2C2416",
                textAlign: "center",
                position: "relative",
                zIndex: 2,
                fontStyle: "italic",
                letterSpacing: "0.01em",
                marginTop: 18,
              }}
            >
              A story is waiting
              <br />
              for you…
            </motion.p>

            {/* Decorative seal mark on letter */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.75, duration: 0.4, ease: "backOut" }}
              style={{
                marginTop: 36,
                position: "relative",
                zIndex: 2,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28">
                <circle cx="14" cy="14" r="12" fill="none" stroke="#8B1A1A" strokeWidth="1" opacity="0.4" />
                <circle cx="14" cy="14" r="8" fill="none" stroke="#8B1A1A" strokeWidth="1" opacity="0.3" />
                <g stroke="#8B1A1A" strokeWidth="1" strokeLinecap="round" opacity="0.35">
                  <line x1="14" y1="6" x2="14" y2="22" />
                  <line x1="6" y1="14" x2="22" y2="14" />
                </g>
                <circle cx="14" cy="14" r="2" fill="#8B1A1A" opacity="0.35" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
