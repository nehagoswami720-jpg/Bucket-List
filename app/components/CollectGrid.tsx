"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StoryBottomSheet from "./StoryBottomSheet";
import type { DBStory } from "../lib/storyTypes";

// ── Paperclip ──────────────────────────────────────────────────────────────────
function PaperclipSVG() {
  return (
    <svg width="38" height="72" viewBox="0 0 38 72" fill="none" style={{ transform: "rotate(-8deg)" }}>
      <path
        d="M 19,4 Q 32,4 32,16 L 32,54 Q 32,68 19,68 Q 6,68 6,54 L 6,18 Q 6,8 19,8 Q 30,8 30,18 L 30,54 Q 30,62 19,62 Q 10,62 10,54 L 10,20"
        stroke="#282828" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" fill="none"
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
        stroke="#2C2416" strokeWidth="1.4" fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

// ── Hand-drawn checkbox ────────────────────────────────────────────────────────
function Checkbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      style={{ position: "relative", width: 18, height: 18, flexShrink: 0, cursor: "pointer" }}
    >
      <AnimatePresence>
        {checked && (
          <motion.div
            key="pulse"
            initial={{ scale: 0.6, opacity: 0.5 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              backgroundColor: "#282828", pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={checked ? { scale: [1, 1.28, 0.92, 1.06, 1] } : { scale: [1, 0.88, 1] }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: 18, height: 18 }}
      >
        <svg viewBox="0 0 16 16" width="18" height="18" style={{ display: "block" }}>
          <motion.path
            d="M 1.5,2 Q 1,1.5 2,1.2 L 13.5,1 Q 14.5,1.2 14.8,2 L 15,13.5 Q 14.8,15 13.5,14.8 L 2,15 Q 1,14.8 1.2,13.5 Z"
            fill={checked ? "#282828" : "none"}
            stroke="#2C2416" strokeWidth="1.4" strokeLinejoin="round"
            animate={{ fill: checked ? "#282828" : "rgba(0,0,0,0)" }}
            transition={{ duration: 0.18 }}
          />
          <AnimatePresence>
            {checked && (
              <motion.path
                key="check"
                d="M 3,8 L 6.5,12 L 13,4"
                stroke="#ffffff" strokeWidth="1.9" fill="none"
                strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                exit={{ pathLength: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </AnimatePresence>
        </svg>
      </motion.div>
    </div>
  );
}

// ── Story row ──────────────────────────────────────────────────────────────────
function StoryRow({
  story,
  index,
  isDone,
  onToggleDone,
  onTap,
}: {
  story: DBStory;
  index: number;
  isDone: boolean;
  onToggleDone: () => void;
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
        animate={{ opacity: isDone ? 0.5 : 1 }}
        transition={{ duration: 0.3 }}
        style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
      >
        {/* Row number */}
        <span style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 11, lineHeight: "18px",
          width: 14, textAlign: "right", flexShrink: 0, color: "#9C9C9C",
        }}>
          {index + 1}
        </span>

        {/* Checkbox — marks done */}
        <Checkbox checked={isDone} onToggle={onToggleDone} />

        {/* Title + strikethrough — tappable to read */}
        <motion.div
          onClick={onTap}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          style={{ position: "relative", flex: 1, cursor: "pointer", WebkitTapHighlightColor: "transparent" } as React.CSSProperties}
        >
          <span style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 14,
            color: isDone ? "#A09890" : "#282828",
            lineHeight: 1.5,
            display: "block",
            transition: "color 0.3s ease",
          }}>
            {story.title}
          </span>

          <AnimatePresence>
            {isDone && (
              <motion.div
                key="strike"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0, originX: 1, transition: { duration: 0.18, ease: "easeIn" } }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: "absolute", top: "50%", left: 0, right: 0,
                  height: 1.5, backgroundColor: "#20500C",
                  transformOrigin: "left center", pointerEvents: "none", borderRadius: 1,
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function CollectGrid({
  savedStories,
  doneIds,
  onSaveToggle,
  onToggleDone,
  onStoryOpen,
}: {
  savedStories: DBStory[];
  doneIds: Set<string>;
  onSaveToggle: (story: DBStory) => void;
  onToggleDone: (storyId: string) => void;
  onStoryOpen?: (open: boolean) => void;
}) {
  const [selectedStory, setSelectedStory] = useState<DBStory | null>(null);

  function openStory(story: DBStory) { setSelectedStory(story); onStoryOpen?.(true); }
  function closeStory()              { setSelectedStory(null);  onStoryOpen?.(false); }

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      {/* Scrollable screen */}
      <div style={{
        position: "fixed", inset: 0,
        backgroundColor: "#F5F0E8",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      } as React.CSSProperties}>

        <div style={{
          minHeight: "100%",
          paddingTop: 56, paddingBottom: 110,
          paddingLeft: 20, paddingRight: 20,
          boxSizing: "border-box",
          maxWidth: 390, margin: "0 auto",
        }}>
          {/* Paper stack */}
          <div style={{ position: "relative", paddingTop: 20 }}>

            {/* Paperclip */}
            <motion.div
              initial={{ y: -24, opacity: 0, rotate: -20 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.75 }}
              style={{ position: "absolute", top: 0, left: 16, zIndex: 10, pointerEvents: "none" }}
            >
              <PaperclipSVG />
            </motion.div>

            {/* Back paper 2 */}
            <motion.div
              initial={{ scaleY: 0, transformOrigin: "top center" }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
              style={{
                position: "absolute", inset: 0,
                backgroundColor: "#EEEBE4", borderRadius: 4,
                transform: "rotate(1.8deg)", boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              }}
            />

            {/* Back paper 1 */}
            <motion.div
              initial={{ scaleY: 0, transformOrigin: "top center" }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.04 }}
              style={{
                position: "absolute", inset: 0,
                backgroundColor: "#F2EFE8", borderRadius: 4,
                transform: "rotate(-1.4deg)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            />

            {/* Main paper */}
            <motion.div
              initial={{ clipPath: "inset(0 0 100% 0 round 4px)" }}
              animate={{ clipPath: "inset(0 0 0% 0 round 4px)" }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "relative", zIndex: 1,
                backgroundColor: "#FFFFFF", borderRadius: 4,
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
                  fontSize: 22, fontWeight: 700, color: "#2C2416",
                  margin: "0 0 6px", letterSpacing: "-0.02em", lineHeight: 1.2,
                }}>
                  your bucket list
                </h1>
                <WobblyUnderline />
              </motion.div>

              {/* Stories or empty */}
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
                        isDone={doneIds.has(story.id)}
                        onToggleDone={() => onToggleDone(story.id)}
                        onTap={() => openStory(story)}
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
                      fontSize: 14, fontStyle: "italic", color: "#B0A898",
                      textAlign: "center", marginTop: 8, lineHeight: 1.7,
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

      {/* Story reader */}
      <StoryBottomSheet
        story={selectedStory}
        isSaved={selectedStory ? true : false}
        onSaveToggle={() => selectedStory && onSaveToggle(selectedStory)}
        onClose={closeStory}
      />
    </div>
  );
}
