"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StoryBottomSheet from "./StoryBottomSheet";
import type { Story } from "../lib/storyTypes";

// ── Paperclip SVG ──────────────────────────────────────────────────────────────
function PaperclipSVG() {
  return (
    <svg width="38" height="72" viewBox="0 0 38 72" fill="none" style={{ transform: "rotate(-8deg)" }}>
      <path
        d="M 19,4 Q 32,4 32,16 L 32,54 Q 32,68 19,68 Q 6,68 6,54 L 6,18 Q 6,8 19,8 Q 30,8 30,18 L 30,54 Q 30,62 19,62 Q 10,62 10,54 L 10,20"
        stroke="#282828"
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// ── Wobbly underline ───────────────────────────────────────────────────────────
function WobblyUnderline() {
  return (
    <svg width="180" height="8" viewBox="0 0 180 8" style={{ display: "block" }}>
      <motion.path
        d="M 2,5 Q 30,2 60,5 Q 90,8 120,4 Q 150,1 178,5"
        stroke="#2C2416"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

// ── Story row ──────────────────────────────────────────────────────────────────
function StoryRow({
  story,
  index,
  onTap,
}: {
  story: Story;
  index: number;
  onTap: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      style={{ paddingTop: index === 0 ? 0 : 16 }}
    >
      <motion.div
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        onClick={onTap}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
        } as React.CSSProperties}
      >
        {/* Row number */}
        <span
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 11,
            lineHeight: "18px",
            width: 14,
            textAlign: "right",
            flexShrink: 0,
            color: "#9C9C9C",
          }}
        >
          {index + 1}
        </span>

        {/* Title */}
        <span
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 14,
            color: "#202126",
            lineHeight: 1.5,
            flex: 1,
          }}
        >
          {story.title}
        </span>

      </motion.div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function CollectGrid({
  savedStories,
  onSaveToggle,
  onStoryOpen,
}: {
  savedStories: Story[];
  onSaveToggle: (story: Story) => void;
  onStoryOpen?: (open: boolean) => void;
}) {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const savedIds = new Set(savedStories.map((s) => s.id));

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      {/* Scrollable screen */}
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#F5F0E8",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      } as React.CSSProperties}>

        <div style={{
          minHeight: "100%",
          paddingTop: 56,
          paddingBottom: 110,
          paddingLeft: 20,
          paddingRight: 20,
          boxSizing: "border-box",
          maxWidth: 390,
          margin: "0 auto",
        }}>

          {/* Paper stack */}
          <div style={{ position: "relative", paddingTop: 20 }}>

            {/* Paperclip */}
            <motion.div
              initial={{ y: -24, opacity: 0, rotate: -20 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.75 }}
              style={{
                position: "absolute",
                top: 0,
                left: 16,
                zIndex: 10,
                pointerEvents: "none",
              }}
            >
              <PaperclipSVG />
            </motion.div>

            {/* Back paper 2 */}
            <motion.div
              initial={{ scaleY: 0, transformOrigin: "top center" }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "#EEEBE4",
                borderRadius: 4,
                transform: "rotate(1.8deg)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              }}
            />

            {/* Back paper 1 */}
            <motion.div
              initial={{ scaleY: 0, transformOrigin: "top center" }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.04 }}
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "#F2EFE8",
                borderRadius: 4,
                transform: "rotate(-1.4deg)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            />

            {/* Main paper */}
            <motion.div
              initial={{ clipPath: "inset(0 0 100% 0 round 4px)" }}
              animate={{ clipPath: "inset(0 0 0% 0 round 4px)" }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "relative",
                zIndex: 1,
                backgroundColor: "#FFFFFF",
                borderRadius: 4,
                boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
                backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 27px, #F0EDE8 27px, #F0EDE8 28px)",
                backgroundPosition: "0 110px",
                padding: "56px 24px 48px",
              }}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}
              >
                <h1 style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#2C2416",
                  margin: "0 0 6px",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}>
                  your bucket list
                </h1>
                <WobblyUnderline />
              </motion.div>

              {/* Stories or empty state */}
              <AnimatePresence mode="wait">
                {savedStories.length > 0 ? (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {savedStories.map((story, i) => (
                      <StoryRow
                        key={story.id}
                        story={story}
                        index={i}
                        onTap={() => { setSelectedStory(story); onStoryOpen?.(true); }}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35, delay: 0.55 }}
                  >
                    <p style={{
                      fontFamily: "'Courier New', Courier, monospace",
                      fontSize: 14,
                      fontStyle: "italic",
                      color: "#B0A898",
                      textAlign: "center",
                      marginTop: 8,
                      lineHeight: 1.7,
                    }}>
                      nothing saved yet.<br />
                      explore wander to find stories worth trying.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Story reader sheet */}
      <StoryBottomSheet
        story={selectedStory}
        isSaved={selectedStory ? savedIds.has(selectedStory.id) : false}
        onSaveToggle={() => selectedStory && onSaveToggle(selectedStory)}
        onClose={() => { setSelectedStory(null); onStoryOpen?.(false); }}
      />
    </div>
  );
}
