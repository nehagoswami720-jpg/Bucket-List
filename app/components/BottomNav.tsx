"use client";

import { useState, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";
import FootprintsIcon from "./FootprintsIcon";
import { useWindowSize } from "../lib/useWindowSize";

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
  const { isDesktop } = useWindowSize();
  const btnControls  = useAnimationControls();
  const iconControls = useAnimationControls();
  const [rings, setRings] = useState<number[]>([]);
  const ringId = useRef(0);

  function handleSwitch(tab: Tab) {
    if (tab === active) return;
    onSwitch(tab);
    setTick((t) => t + 1);
  }

  const tabPadding    = isDesktop ? "6px 48px" : "4px 28px";
  const tabFontSize   = isDesktop ? 13 : 11;
  const iconSize      = isDesktop ? 24 : 20;
  const btnSize       = isDesktop ? 68 : 56;
  const btnLift       = isDesktop ? -24 : -20;
  const bottomPad     = isDesktop ? "0 24px 32px" : "0 16px 40px";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        padding: bottomPad,
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
          background: "rgba(255, 247, 237, 0.5)",
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
                padding: tabPadding,
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
                style={{ width: iconSize, height: iconSize, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Icon size={iconSize} />
              </motion.span>
              <span style={{
                fontFamily: "Helvetica, Arial, sans-serif",
                fontSize: tabFontSize,
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
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 8px",
          transform: `translateY(${btnLift}px)`,
          flexShrink: 0,
          position: "relative",
        }}>
          {/* Expanding rings */}
          {rings.map((id) => (
            <motion.div
              key={id}
              initial={{ scale: 0.6, opacity: 0.5 }}
              animate={{ scale: 2.6, opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute",
                width: btnSize,
                height: btnSize,
                borderRadius: "50%",
                border: "2px solid #282828",
                pointerEvents: "none",
              }}
            />
          ))}

          <motion.button
            animate={btnControls}
            onClick={() => {
              // Pulse ring
              const id = ++ringId.current;
              setRings((r) => [...r, id]);
              setTimeout(() => setRings((r) => r.filter((x) => x !== id)), 700);

              // Button bounce
              btnControls.start({
                scale: [1, 0.82, 1.18, 0.95, 1.05, 1],
                transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
              });

              // Icon spin
              iconControls.start({
                rotate: [0, 135],
                transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
              }).then(() =>
                iconControls.start({
                  rotate: 0,
                  transition: { duration: 0 },
                })
              );

              onShare?.();
            }}
            style={{
              width: btnSize,
              height: btnSize,
              borderRadius: "50%",
              backgroundColor: "#282828",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 20px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.1)",
              position: "relative",
            }}
          >
            <motion.svg
              animate={iconControls}
              width={isDesktop ? 26 : 22}
              height={isDesktop ? 26 : 22}
              viewBox="0 0 22 22"
              fill="none"
              style={{ display: "block" }}
            >
              <path d="M11 4v14M4 11h14" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round"/>
            </motion.svg>
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
                padding: tabPadding,
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
                style={{ width: iconSize, height: iconSize, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Icon size={iconSize} />
              </motion.span>
              <span style={{
                fontFamily: "Helvetica, Arial, sans-serif",
                fontSize: tabFontSize,
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
