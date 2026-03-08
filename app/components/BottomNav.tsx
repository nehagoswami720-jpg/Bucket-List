"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import FootprintsIcon from "./FootprintsIcon";

function BookmarkIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path
        d="M5 3h10a1 1 0 0 1 1 1v12.5l-6-3.5-6 3.5V4a1 1 0 0 1 1-1Z"
        fill="currentColor"
      />
    </svg>
  );
}

const TABS = [
  { label: "Wander",  Icon: FootprintsIcon },
  { label: "Collect", Icon: BookmarkIcon   },
] as const;

type Tab = (typeof TABS)[number]["label"];

const iconVariants: Record<Tab, Record<string, number[]>> = {
  Wander:  { y: [0, -5, 1, 0], rotate: [0, -8, 6, 0] },
  Collect: { y: [-8, 2, -1, 0], scale: [0.7, 1.1, 0.95, 1] },
};

export default function BottomNav({
  active,
  onSwitch,
  onShare,
}: {
  active: Tab;
  onSwitch: (tab: Tab) => void;
  onShare?: () => void;
}) {
  const [tick, setTick] = useState(0);

  function handleSwitch(tab: Tab) {
    if (tab === active) return;
    onSwitch(tab);
    setTick((t) => t + 1);
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        padding: "0 16px 40px",
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.1 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          background: "rgba(237, 234, 229, 0.5)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.65)",
          padding: "5px 8px 7px",
          gap: "0px",
          pointerEvents: "all",
          overflow: "visible",
          position: "relative",
        }}
      >
        {/* ── Wander tab ── */}
        {(() => {
          const { label, Icon } = TABS[0];
          const isActive = label === active;
          return (
            <motion.button
              key={label}
              onClick={() => handleSwitch(label)}
              whileTap={{ scale: 0.91 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                padding: "4px 28px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderRadius: "12px",
                color: isActive ? "#282828" : "#8a8680",
                minWidth: 0,
              }}
            >
              <motion.span
                key={`${label}-${tick}`}
                animate={isActive ? iconVariants[label] : {}}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Icon size={20} />
              </motion.span>
              <span style={{
                fontFamily: "Helvetica, Arial, sans-serif",
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
                letterSpacing: "0.01em",
                userSelect: "none",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}>
                {label}
              </span>
            </motion.button>
          );
        })()}

        {/* ── Center + button ── */}
        {/* Outer div owns the lift — Framer Motion only controls scale, never translateY */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 8px",
          transform: "translateY(-20px)",
          flexShrink: 0,
        }}>
          <motion.button
            onClick={onShare}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "#282828",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 20px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 4v14M4 11h14" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </motion.button>
        </div>

        {/* ── Collect tab ── */}
        {(() => {
          const { label, Icon } = TABS[1];
          const isActive = label === active;
          return (
            <motion.button
              key={label}
              onClick={() => handleSwitch(label)}
              whileTap={{ scale: 0.91 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                padding: "4px 28px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderRadius: "12px",
                color: isActive ? "#282828" : "#8a8680",
                minWidth: 0,
              }}
            >
              <motion.span
                key={`${label}-${tick}`}
                animate={isActive ? iconVariants[label] : {}}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Icon size={20} />
              </motion.span>
              <span style={{
                fontFamily: "Helvetica, Arial, sans-serif",
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
                letterSpacing: "0.01em",
                userSelect: "none",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}>
                {label}
              </span>
            </motion.button>
          );
        })()}
      </motion.div>
    </div>
  );
}
