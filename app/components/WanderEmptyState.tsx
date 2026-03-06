"use client";

import { motion } from "framer-motion";

const font: React.CSSProperties = {
  fontFamily: "'Courier New', Courier, monospace",
  letterSpacing: "-0.02em",
};

export default function WanderEmptyState({ onStart }: { onStart?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        padding: "0 48px",
        textAlign: "center",
      }}
    >
      <p style={{ ...font, fontSize: "16px", fontWeight: 600, color: "#000000", lineHeight: 1.6, margin: 0 }}>
        nothing here yet.
      </p>

      <p style={{ ...font, fontSize: "16px", fontWeight: 600, color: "#000000", lineHeight: 1.6, margin: 0 }}>
        not because there are no stories worth telling.
      </p>

      <p style={{ ...font, fontSize: "16px", fontWeight: 600, color: "#000000", lineHeight: 1.6, margin: 0 }}>
        but because nobody has been brave enough
        <br />
        to write one down.
      </p>

      <p style={{ ...font, fontSize: "16px", fontWeight: 600, color: "#000000", lineHeight: 1.6, margin: 0 }}>
        yet.
      </p>

      <button
        onClick={onStart}
        style={{
          marginTop: "12px",
          ...font,
          width: "100%",
          maxWidth: "240px",
          padding: "18px 0",
          backgroundColor: "#282828",
          color: "#ffffff",
          fontSize: "18px",
          fontWeight: "bold",
          border: "none",
          borderRadius: "14px",
          cursor: "pointer",
        }}
      >
        I&apos;ll go first
      </button>
    </motion.div>
  );
}
