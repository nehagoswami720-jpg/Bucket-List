"use client";

import { motion } from "framer-motion";

const font: React.CSSProperties = {
  fontFamily: "'Courier New', Courier, monospace",
  letterSpacing: "-0.02em",
  fontSize: "16px",
  fontWeight: 600,
  color: "#202020",
  textAlign: "center",
  lineHeight: 1.6,
  margin: 0,
};

export default function CollectEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        padding: "0 32px",
        textAlign: "center",
      }}
    >
      <p style={font}>nothing saved yet.</p>

      <p style={font}>
        you&apos;ve just arrived.
        <br />
        the stories are out there —
      </p>

      <p style={font}>
        the ones that&apos;ll make you think
        <br />
        &ldquo;i need to try this.&rdquo;
      </p>

      <p style={font}>go find one.</p>
    </motion.div>
  );
}
