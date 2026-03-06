"use client";

import { useRef, useEffect, useState, useCallback, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MAX   = 200;
const TOTAL = 5;

const QUESTIONS = [
  "What's something you tried that you wish someone had told you about sooner?",
  "Where did it happen, and what made the setting unforgettable?",
  "What's one thing you'd tell a stranger who wants to try this?",
  "What surprised you the most about the experience?",
  "Give it a title — what would you call this story?",
];

const PLACEHOLDERS = [
  { lines: ["could be a trip, a skill, a meal, a", "moment, anything you lived and", "loved..."] },
  { lines: ["a city, a trail, a kitchen, a rooftop,", "a table in the middle of nowhere..."] },
  { lines: ["don't overthink it.", "just say it like you would to a friend..."] },
  { lines: ["something you didn't see coming,", "a feeling, a moment, a detail..."] },
  { lines: ["keep it short.", "make it yours..."] },
];

const questionFont: React.CSSProperties = {
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: "22px",
  fontWeight: 400,
  letterSpacing: "-0.02em",
  color: "#202020",
  lineHeight: 1.25,
  margin: 0,
  maxWidth: "300px",
};

const courierBase: React.CSSProperties = {
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "16px",
  letterSpacing: "-0.04em",
  lineHeight: 1.55,
};

// ─── Progress Bar ────────────────────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ padding: "0 24px", marginTop: 24 }}>

      {/* Journey dots + connecting lines */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {Array.from({ length: TOTAL }, (_, i) => {
          const completed = i < step;
          const active    = i === step;
          const upcoming  = i > step;

          return (
            <Fragment key={i}>
              {/* Connecting line between dots */}
              {i > 0 && (
                <div style={{
                  flex: 1,
                  height: 1.5,
                  borderRadius: 99,
                  backgroundColor: "rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  position: "relative",
                }}>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: completed ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 30, delay: 0.05 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "#282828",
                      transformOrigin: "left",
                      borderRadius: 99,
                    }}
                  />
                </div>
              )}

              {/* Dot */}
              <div style={{ position: "relative", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* Pulsing ring on active dot */}
                {active && (
                  <motion.div
                    animate={{ scale: [1, 2.2, 1], opacity: [0.35, 0, 0.35] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      position: "absolute",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      border: "1.5px solid #282828",
                    }}
                  />
                )}

                <motion.div
                  animate={{
                    width:  active ? 10 : completed ? 8 : 6,
                    height: active ? 10 : completed ? 8 : 6,
                    backgroundColor: upcoming ? "rgba(0,0,0,0.13)" : "#282828",
                    scale: active ? [1, 1.15, 1] : 1,
                  }}
                  transition={{
                    width:  { type: "spring", stiffness: 340, damping: 26 },
                    height: { type: "spring", stiffness: 340, damping: 26 },
                    backgroundColor: { duration: 0.3 },
                    scale: active ? { duration: 0.6, ease: "easeOut" } : {},
                  }}
                  style={{ borderRadius: "50%", flexShrink: 0 }}
                />
              </div>
            </Fragment>
          );
        })}
      </div>

      {/* Step counter — right-aligned */}
      <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 3 }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={step}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.22 }}
            style={{ ...courierBase, fontSize: "12px", color: "#202020", fontWeight: 600 }}
          >
            {step + 1}
          </motion.span>
        </AnimatePresence>
        <span style={{ ...courierBase, fontSize: "12px", color: "#9a9a9a" }}>of {TOTAL}</span>
      </div>
    </div>
  );
}

// ─── Main sheet ──────────────────────────────────────────────────────────────
export default function StorySheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep]           = useState(0);
  const [answers, setAnswers]     = useState<string[]>(Array(TOTAL).fill(""));
  const [value, setValue]         = useState("");
  const [keyboardHeight, setKbH]  = useState(0);
  const textareaRef               = useRef<HTMLTextAreaElement>(null);
  const atLimit                   = value.length >= MAX;
  const isEmpty                   = value.length === 0;
  const isLastStep                = step === TOTAL - 1;

  const handleViewport = useCallback(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    setKbH(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    vv.addEventListener("resize", handleViewport);
    vv.addEventListener("scroll", handleViewport);
    return () => {
      vv.removeEventListener("resize", handleViewport);
      vv.removeEventListener("scroll", handleViewport);
    };
  }, [handleViewport]);

  useEffect(() => {
    if (!open) {
      setValue("");
      setStep(0);
      setAnswers(Array(TOTAL).fill(""));
      setKbH(0);
      return;
    }
    return;
  }, [open]);

  function handleNext() {
    const saved = [...answers];
    saved[step] = value;
    setAnswers(saved);

    if (isLastStep) {
      onClose();
      return;
    }

    setStep((s) => s + 1);
    setValue(saved[step + 1] ?? "");
  }

  if (!open) return null;

  const placeholder = PLACEHOLDERS[step];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.35)", zIndex: 60 }}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0, bottom: 0.3 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 80 || info.velocity.y > 500) onClose();
        }}
        transition={{ duration: 0.72, ease: [0.32, 0.72, 0, 1] }}
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0, top: "7%",
          backgroundColor: "#EDEAE5",
          borderRadius: "26px 26px 0 0",
          zIndex: 61,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          cursor: "grab",
        }}
      >
        {/* Pill */}
        <div
          onClick={onClose}
          style={{
            display: "flex", justifyContent: "center",
            paddingTop: 14, paddingBottom: 10, flexShrink: 0,
            cursor: "pointer", touchAction: "none",
          }}
        >
          <motion.div
            whileHover={{ scaleX: 1.2, backgroundColor: "rgba(0,0,0,0.3)" }}
            whileTap={{ scaleX: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{ width: 38, height: 4, borderRadius: 99, backgroundColor: "rgba(0,0,0,0.18)" }}
          />
        </div>

        {/* Progress bar */}
        <ProgressBar step={step} />

        {/* Scrollable content */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "0 24px 120px",
          boxSizing: "border-box",
          overflowY: "auto",
          touchAction: "pan-y",
        }}>
          {/* Question — animates on step change */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`q-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              style={{ ...questionFont, marginTop: 48 }}
            >
              {QUESTIONS[step]}
            </motion.p>
          </AnimatePresence>

          {/* Input area */}
          <div style={{ marginTop: 16, position: "relative" }}>
            <AnimatePresence>
              {isEmpty && (
                <motion.div
                  key={`ph-${step}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    ...courierBase,
                    color: "#6D6D6D",
                    fontWeight: 600,
                    pointerEvents: "none",
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    userSelect: "none",
                  }}
                >
                  {placeholder.lines.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < placeholder.lines.length - 1 && <br />}
                    </span>
                  ))}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.55, repeat: Infinity, repeatType: "reverse" }}
                    style={{ marginLeft: 1 }}
                  >
                    |
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                if (e.target.value.length <= MAX) setValue(e.target.value);
              }}
              rows={5}
              style={{
                ...courierBase,
                color: "#202020",
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                padding: 0,
                caretColor: "#202020",
                boxSizing: "border-box",
                ...(isEmpty ? { caretColor: "transparent", color: "transparent" } : {}),
              }}
            />

            <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
              <motion.span
                animate={atLimit ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  ...courierBase,
                  fontSize: "14px",
                  color: atLimit ? "#e03b3b" : "#7D7D7D",
                  fontWeight: atLimit ? 700 : 400,
                  transition: "color 0.2s ease",
                }}
              >
                {value.length}/{MAX}
              </motion.span>
            </div>
          </div>

          <div style={{ flex: 1 }} />
        </div>

        {/* CTA — fixed above keyboard */}
        <div style={{
          position: "fixed",
          left: 0, right: 0,
          bottom: keyboardHeight,
          padding: keyboardHeight > 0 ? "12px 16px 16px" : "20px 16px 44px",
          backgroundColor: "#EDEAE5",
          display: "flex",
          justifyContent: "center",
          zIndex: 62,
          transition: "bottom 0.25s ease, padding 0.25s ease",
        }}>
          <button
            onClick={handleNext}
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              letterSpacing: "-0.02em",
              width: "100%",
              maxWidth: "280px",
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
            {isLastStep ? "Submit story" : "Keep going"}
          </button>
        </div>
      </motion.div>
    </>
  );
}
