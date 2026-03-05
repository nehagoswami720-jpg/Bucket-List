"use client";

import { motion } from "framer-motion";

// Flap starts open (nearly flat) then seals down into a V
const FLAP_OPEN   = "M3.5 7.5 Q15.5 4 29 2 Q42.5 4 54.5 7.8";
const FLAP_CLOSED = "M3.5 7.5 Q15.5 20.5 29 26.5 Q42.5 20.5 54.5 7.8";

export default function EnvelopeIcon({ size = 58 }: { size?: number }) {
  const h = Math.round(size * 0.75);

  return (
    // 1. Spring bounce entry
    <motion.div
      initial={{ scale: 0.3, opacity: 0, rotate: -15 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 18,
        delay: 0.15,
      }}
    >
      {/* 2. Gentle infinite float after entry settles */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.9,
        }}
      >
        <svg
          width={size}
          height={h}
          viewBox="0 0 58 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Body */}
          <motion.path
            d="M2.8 8.2 Q2.5 5.5 5.2 5.2 L52.8 5.5 Q55.5 5.8 55.2 8.5 L54.8 40.2 Q54.5 42.8 51.8 42.5 L6.2 42.2 Q3.5 42.0 3.2 39.2 Z"
            stroke="#558065"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
          />

          {/* 3. Flap seals itself: open → closed */}
          <motion.path
            d={FLAP_OPEN}
            stroke="#558065"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            animate={{ d: FLAP_CLOSED }}
            transition={{ duration: 0.75, delay: 1.0, ease: [0.4, 0, 0.2, 1] }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
