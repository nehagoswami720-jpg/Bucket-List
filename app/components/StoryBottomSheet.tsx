"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { DBStory, CATEGORY_COLOR } from "../lib/storyTypes";

export default function StoryBottomSheet({
  story,
  isSaved,
  onSaveToggle,
  onClose,
  isOwnStory = false,
}: {
  story: DBStory | null;
  isSaved: boolean;
  onSaveToggle: () => void;
  onClose: () => void;
  isOwnStory?: boolean;
}) {
  const [pressing, setPressing] = useState(false);
  const [particles, setParticles] = useState<{ id: number; angle: number; distance: number; size: number }[]>([]);
  const particleId = useRef(0);
  const iconControls = useAnimationControls();

  // Reset press state when sheet closes
  useEffect(() => {
    if (!story) setPressing(false);
  }, [story]);

  async function handleSaveToggle() {
    onSaveToggle();

    iconControls.start({
      scale: [1, 0.55, 1.35, 0.9, 1],
      rotate: !isSaved ? [0, -14, 10, -4, 0] : [0, 14, -10, 4, 0],
      transition: { duration: 0.52, ease: [0.34, 1.56, 0.64, 1] },
    });

    if (!isSaved) {
      const newPs = Array.from({ length: 8 }, (_, i) => ({
        id: ++particleId.current,
        angle: i * 45 + (Math.random() - 0.5) * 22,
        distance: 18 + Math.random() * 14,
        size: 3 + Math.random() * 3,
      }));
      setParticles((p) => [...p, ...newPs]);
      setTimeout(() => setParticles((p) => p.filter((pp) => !newPs.some((np) => np.id === pp.id))), 700);
    }
  }

  return (
    <AnimatePresence>
      {story && (
        <>
          {/* Backdrop */}
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.32)",
              backdropFilter: "blur(3px)",
              WebkitBackdropFilter: "blur(3px)",
              zIndex: 200,
            }}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              height: "68vh",
              backgroundColor: "#F5F0E8",
              borderRadius: "20px 20px 0 0",
              zIndex: 201,
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
            }}
          >
            {/* Close button */}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "22px 14px 0", flexShrink: 0 }}>
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.07)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="#282828" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </motion.button>
            </div>

            {/* Scrollable content */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
              } as React.CSSProperties}
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{ padding: "12px 24px 48px", display: "flex", flexDirection: "column" }}
              >
                {/* Category pill + optional "Submitted by you" tag */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      backgroundColor: CATEGORY_COLOR[story.category],
                      borderRadius: 6,
                      padding: "4px 10px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Helvetica, Arial, sans-serif",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#ffffff",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {story.category}
                    </span>
                  </div>

                  {isOwnStory && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        display: "inline-flex",
                        border: `1.5px solid ${CATEGORY_COLOR[story.category]}`,
                        borderRadius: 6,
                        padding: "4px 10px",
                        backgroundColor: "transparent",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Helvetica, Arial, sans-serif",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: CATEGORY_COLOR[story.category],
                          letterSpacing: "0.01em",
                        }}
                      >
                        Submitted by you
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Title */}
                <h2
                  style={{
                    fontFamily: "Helvetica, Arial, sans-serif",
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#2A2A2A",
                    lineHeight: 1.3,
                    letterSpacing: "-0.02em",
                    margin: "0 0 20px",
                  }}
                >
                  {story.title}
                </h2>

                {/* Story body */}
                <div style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: "16px",
                  color: "#1E1E1E",
                  lineHeight: 1.6,
                }}>
                  {story.body ? (
                    story.body.split("\n\n").map((para, i) => (
                      <p key={i} style={{ margin: i < story.body!.split("\n\n").length - 1 ? "0 0 20px" : "0" }}>
                        {para}
                      </p>
                    ))
                  ) : (
                    <>
                      <p style={{ margin: "0 0 20px" }}>{story.moment}</p>
                      <p style={{ margin: "0 0 20px" }}>{story.worth_it}</p>
                      {story.advice && (
                        <p style={{ margin: 0, color: "#555555", fontStyle: "italic" }}>
                          {story.advice}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Save button */}
                {!isOwnStory && (
                <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
                  <motion.button
                    onClick={handleSaveToggle}
                    onPointerDown={() => setPressing(true)}
                    onPointerUp={() => setPressing(false)}
                    onPointerLeave={() => setPressing(false)}
                    animate={{
                      scale: pressing ? 0.91 : 1,
                      borderColor: isSaved ? "#20500C" : "#282828",
                      backgroundColor: isSaved ? "rgba(32,80,12,0.04)" : "rgba(0,0,0,0)",
                    }}
                    transition={{
                      scale: { type: "spring", stiffness: 260, damping: 20 },
                      borderColor: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                      backgroundColor: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      border: "2px solid #282828",
                      borderRadius: 10,
                      cursor: "pointer",
                      padding: "16px 28px",
                      fontFamily: "'Courier New', Courier, monospace",
                      fontSize: "16px",
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      background: "none",
                      position: "relative",
                      overflow: "visible",
                    }}
                  >
                    {/* Icon + particles */}
                    <div style={{ position: "relative", width: 18, height: 18, flexShrink: 0 }}>
                      {particles.map((p) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                          animate={{
                            opacity: 0,
                            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
                            scale: 0,
                          }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            width: p.size,
                            height: p.size,
                            borderRadius: "50%",
                            backgroundColor: "#20500C",
                            transform: "translate(-50%, -50%)",
                            pointerEvents: "none",
                          }}
                        />
                      ))}

                      <motion.svg
                        width="18"
                        height="18"
                        viewBox="0 0 20 20"
                        fill="none"
                        animate={iconControls}
                        style={{ display: "block" }}
                      >
                        <motion.path
                          d="M5 3h10a1 1 0 0 1 1 1v12.5l-6-3.5-6 3.5V4a1 1 0 0 1 1-1Z"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                          animate={{
                            fill: isSaved ? "#20500C" : "rgba(0,0,0,0)",
                            stroke: isSaved ? "#20500C" : "#282828",
                          }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </motion.svg>
                    </div>

                    {/* Text — perspective flip */}
                    <div style={{ position: "relative", perspective: 400, overflow: "hidden" }}>
                      <AnimatePresence mode="wait" initial={false}>
                        {!isSaved ? (
                          <motion.span
                            key="save-text"
                            initial={{ rotateX: -90, opacity: 0 }}
                            animate={{ rotateX: 0, opacity: 1 }}
                            exit={{ rotateX: 90, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            style={{ display: "block", color: "#1A1A1A", whiteSpace: "nowrap", transformOrigin: "center center" }}
                          >
                            Save to my bucket list
                          </motion.span>
                        ) : (
                          <motion.span
                            key="saved-text"
                            initial={{ rotateX: -90, opacity: 0 }}
                            animate={{ rotateX: 0, opacity: 1 }}
                            exit={{ rotateX: 90, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            style={{ display: "block", color: "#20500C", whiteSpace: "nowrap", transformOrigin: "center center" }}
                          >
                            Saved
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                </div>
                )}

              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
