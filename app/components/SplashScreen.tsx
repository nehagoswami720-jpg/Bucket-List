"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Typewriter } from "./Typewriter";
import WelcomeSheet from "./WelcomeSheet";

const quote =
  '\u201cMan cannot discover new oceans unless he has the courage to lose sight of the shore.\u201d\n\u2014 Andr\u00e9 Gide';

const baseFont: React.CSSProperties = {
  fontFamily: "'Courier New', Courier, monospace",
  letterSpacing: "-0.02em",
};

export default function SplashScreen({ onStartExploring }: { onStartExploring?: () => void }) {
  const [done, setDone] = useState(false);
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
      }}
    >
      <motion.div
        animate={done ? { y: -60 } : { y: 0 }}
        transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Typewriter
          text={quote}
          speed={75}
          cursor="|"
          loop={false}
          onComplete={() => setDone(true)}
          style={{
            ...baseFont,
            fontSize: "20px",
            color: "#000000",
            fontWeight: "bold",
            lineHeight: 1.3,
            textAlign: "center",
            whiteSpace: "pre-wrap",
            display: "inline-block",
            maxWidth: "280px",
          }}
        />
      </motion.div>

      <AnimatePresence>
        {done && (
          <motion.button
            initial={{ opacity: 0, y: 24, scale: 0.88, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{
              duration: 1.4,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.5,
              opacity: { duration: 1.6 },
              filter: { duration: 1.2 },
            }}
            style={{
              ...baseFont,
              marginTop: "48px",
              width: "280px",
              padding: "18px 0",
              backgroundColor: "#282828",
              color: "#ffffff",
              fontSize: "18px",
              fontWeight: "bold",
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

      <WelcomeSheet open={showSheet} onStartExploring={onStartExploring} />
    </div>
  );
}
