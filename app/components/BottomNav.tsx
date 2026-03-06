"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import FootprintsIcon from "./FootprintsIcon";
import PushpinIcon from "./PushpinIcon";

const TABS = [
  { label: "Wander",  Icon: FootprintsIcon },
  { label: "Collect", Icon: PushpinIcon    },
] as const;

type Tab = (typeof TABS)[number]["label"];

// Icon animations themed to each tab
const iconVariants: Record<Tab, Record<string, number[]>> = {
  Wander:  { y: [0, -5, 1, 0], rotate: [0, -8, 6, 0] },   // hop + wobble — like walking
  Collect: { y: [-8, 2, -1, 0], scale: [0.7, 1.1, 0.95, 1] }, // drops in and lands
};

export default function BottomNav({
  active,
  onSwitch,
}: {
  active: Tab;
  onSwitch: (tab: Tab) => void;
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
      {/* Glass container — inline-flex so padding is always symmetric */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0,  opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.1 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          background: "rgba(237, 234, 229, 0.5)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.65)",
          padding: "14px",
          gap: "8px",
          pointerEvents: "all",
        }}
      >
        {TABS.map(({ label, Icon }) => {
          const isActive = label === active;

          return (
            <motion.button
              key={label}
              onClick={() => handleSwitch(label)}
              whileTap={{ scale: 0.91 }}
              whileHover={!isActive ? { scale: 1.04 } : {}}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "14px 26px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderRadius: "10px",
                zIndex: 1,
                color: isActive ? "#ffffff" : "#282828",
                minWidth: 0,
              }}
            >
              {/* Sliding active pill */}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  transition={{ type: "spring", stiffness: 440, damping: 38 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #383838 0%, #282828 60%, #1a1a1a 100%)",
                    boxShadow: "0 4px 16px rgba(40,40,40,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
                    zIndex: -1,
                  }}
                />
              )}

              {/* Icon — plays a theme-specific animation on activate */}
              <motion.span
                key={`${label}-${tick}`}
                animate={isActive ? iconVariants[label] : {}}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  width: 16,
                  height: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={16} />
              </motion.span>

              {/* Label */}
              <motion.span
                animate={{ opacity: isActive ? 1 : 0.65 }}
                transition={{ duration: 0.25 }}
                style={{
                  fontFamily: "var(--font-special-elite), serif",
                  fontSize: "16px",
                  fontWeight: 400,
                  letterSpacing: "0.01em",
                  userSelect: "none",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </motion.span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
