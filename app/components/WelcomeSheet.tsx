"use client";

import { useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import EnvelopeIcon from "./EnvelopeIcon";


const font: React.CSSProperties = {
  fontFamily: "'Courier New', Courier, monospace",
  letterSpacing: "-0.03em",
};

const para: React.CSSProperties = {
  ...font,
  fontSize: "16px",
  color: "#141414",
  fontWeight: "500",
  textAlign: "center",
  lineHeight: 1.35,
  letterSpacing: "-0.04em",
  margin: 0,
};

// Staggered fade-up for each paragraph
function FadePara({
  delay,
  style,
  children,
}: {
  delay: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      style={{ ...para, ...style }}
    >
      {children}
    </motion.p>
  );
}

export default function WelcomeSheet({
  open,
  onClose,
  onStartExploring,
}: {
  open: boolean;
  onClose?: () => void;
  onStartExploring?: () => void;
}) {
  const btnControls = useAnimationControls();
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);

  if (!open) return null;

  return (
    <>
      {/* Backdrop — tap to close */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        onClick={() => onClose?.()}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.35)",
          zIndex: 10,
          cursor: "pointer",
        }}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.72, ease: [0.32, 0.72, 0, 1] }}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          top: "7%",
          backgroundColor: "#FFF3E5",
          borderRadius: "26px 26px 0 0",
          zIndex: 11,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "14px 32px 52px",
          boxSizing: "border-box",
        }}
      >
        {/* Pill handle — tap to close */}
        <div
          onClick={() => onClose?.()}
          style={{
            width: 38,
            height: 4,
            borderRadius: 99,
            backgroundColor: "rgba(0,0,0,0.18)",
            marginBottom: 44,
            flexShrink: 0,
            cursor: "pointer",
          }}
        />

        {/* Envelope icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.15 }}
        >
          <EnvelopeIcon size={56} />
        </motion.div>

        {/* Breathing room */}
        <div style={{ height: 52 }} />

        <FadePara delay={0.25} style={{ marginBottom: "24px" }}>hi :)</FadePara>

        <FadePara delay={0.38} style={{ marginBottom: "24px" }}>
          the world is full of stories.
          <br />
          the kind that happen at 2am in a foreign city,
          <br />
          on a random road trip,
          <br />
          or during a moment that changes everything.
        </FadePara>

        <FadePara delay={0.5} style={{ color: "#2e5e42", fontWeight: "800", marginBottom: "24px" }}>
          this is a place for those stories.
        </FadePara>

        <FadePara delay={0.62} style={{ marginBottom: "24px" }}>
          a place where people share the adventures,
          <br />
          risks, mistakes, and unforgettable experiences
          <br />
          that made life feel real.
        </FadePara>

        <FadePara delay={0.74} style={{ marginBottom: "24px" }}>
          maybe you&apos;ll find a story here
          <br />
          that inspires your next adventure.
        </FadePara>

        <FadePara delay={0.86} style={{ marginBottom: "24px" }}>
          or maybe one day, someone will read yours.
        </FadePara>

        <div style={{ height: 20 }} />

        <FadePara delay={0.98} style={{ marginBottom: "52px" }}>
          either way, glad you&apos;re here :)
        </FadePara>

        {/* Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 1.1 }}
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <motion.button
            animate={btnControls}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const id = ++rippleId.current;
              setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
              setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 700);
              btnControls.start({
                scale: [1, 0.92, 1.06, 0.98, 1.02, 1],
                transition: { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] },
              });
              onStartExploring?.();
            }}
            whileHover={{ filter: "brightness(1.12)" }}
            style={{
              ...font,
              width: "100%",
              maxWidth: "358px",
              padding: "18px 0",
              backgroundColor: "#282828",
              color: "#ffffff",
              fontSize: "18px",
              fontWeight: 700,
              border: "none",
              borderRadius: "14px",
              cursor: "pointer",
              flexShrink: 0,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {ripples.map((r) => (
              <motion.span
                key={r.id}
                initial={{ scale: 0, opacity: 0.4 }}
                animate={{ scale: 14, opacity: 0 }}
                transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  position: "absolute",
                  left: r.x - 20,
                  top: r.y - 20,
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.22)",
                  pointerEvents: "none",
                }}
              />
            ))}
            Start exploring
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
}
