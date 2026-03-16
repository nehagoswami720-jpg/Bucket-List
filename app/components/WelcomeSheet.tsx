"use client";

import { motion } from "framer-motion";
import EnvelopeIcon from "./EnvelopeIcon";


const font: React.CSSProperties = {
  fontFamily: "'Courier New', Courier, monospace",
  letterSpacing: "-0.03em",
};

const para: React.CSSProperties = {
  ...font,
  fontSize: "16px",
  color: "#202020",
  fontWeight: "500",
  textAlign: "center",
  lineHeight: 1.5,
  margin: 0,
};

export default function WelcomeSheet({
  open,
  onStartExploring,
}: {
  open: boolean;
  onStartExploring?: () => void;
}) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.35)",
          zIndex: 10,
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
        {/* Pill handle */}
        <div
          style={{
            width: 38,
            height: 4,
            borderRadius: 99,
            backgroundColor: "rgba(0,0,0,0.18)",
            marginBottom: 44,
            flexShrink: 0,
          }}
        />

        {/* Envelope icon */}
        <EnvelopeIcon size={56} />

        {/* Breathing room */}
        <div style={{ height: 44 }} />

        {/* Greeting */}
        <p style={{ ...para, marginBottom: "24px" }}>hey there</p>

        {/* Opening */}
        <p style={{ ...para, marginBottom: "24px" }}>
          the world is full of stories.
          <br />
          the kind that happen at 2am in a foreign city,
          <br />
          on a random road trip,
          <br />
          or during a moment that changes everything.
        </p>

        {/* Green line */}
        <p
          style={{
            ...para,
            color: "#2e5e42",
            fontWeight: "800",
            marginBottom: "24px",
          }}
        >
          this is a place for those stories.
        </p>

        {/* Description */}
        <p style={{ ...para, marginBottom: "24px" }}>
          a place where people share the adventures,
          <br />
          risks, mistakes, and unforgettable experiences
          <br />
          that made life feel real.
        </p>

        {/* Inspire */}
        <p style={{ ...para, marginBottom: "24px" }}>
          maybe you&apos;ll find a story here
          <br />
          that inspires your next adventure.
        </p>

        {/* Read yours */}
        <p style={{ ...para, marginBottom: "24px" }}>
          or maybe one day, someone will read yours.
        </p>

        {/* Spacer before closing */}
        <div style={{ height: 20 }} />

        {/* Closing */}
        <p style={{ ...para, marginBottom: "52px" }}>
          either way, we&apos;re glad you&apos;re here :)
        </p>

        {/* Button */}
        <button
          onClick={onStartExploring}
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
          }}
        >
          Start exploring
        </button>
      </motion.div>
    </>
  );
}
