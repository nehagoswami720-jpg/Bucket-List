"use client";

import { useRef, useEffect, useState, useCallback, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StoryFormData } from "../lib/api";
import type { Category } from "../lib/storyTypes";

const MAX       = 280;
const MAX_TITLE = 80;
const TOTAL     = 5;

const QUESTIONS = [
  "What's something you tried that you wish someone had told you sooner, and what do you remember most about that moment?",
  "What made this experience worth it?",
  "If a friend texted you right now asking how to try this, what would you tell them? (Optional)",
  "Almost done. Just a few things so the right person stumbles onto this.",
  "Give your story a title. Make it one they can't ignore.",
];

const PLACEHOLDERS = [
  { lines: ["could be a trip, a skill, a meal, a", "moment. the part you always tell", "first when someone asks..."] },
  { lines: ["the thing you didn't expect to feel..."] },
  { lines: ["make it easy for them to start..."] },
  { lines: ["choose what your story is about.", "pick what fits. more than one is fine."] },
  { lines: ["e.g. the night I ate alone in Tokyo..."] },
];

const CATEGORIES = [
  { name: "Adventure",   desc: "new places, unfamiliar situations" },
  { name: "Learning",    desc: "skills, classes, first times" },
  { name: "Connecting",  desc: "strangers, unexpected bonds" },
  { name: "Going wild",  desc: "absurd, once-in-a-lifetime" },
  { name: "Going solo",  desc: "just you and your own company" },
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

// ─── Category Card ───────────────────────────────────────────────────────────
function CategoryCard({
  cat,
  selected,
  onToggle,
}: {
  cat: { name: string; desc: string };
  selected: boolean;
  onToggle: () => void;
}) {
  const [cardRipples, setCardRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const cardRippleId = useRef(0);

  return (
    <motion.button
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const id = ++cardRippleId.current;
        setCardRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
        setTimeout(() => setCardRipples((r) => r.filter((rp) => rp.id !== id)), 600);
        onToggle();
      }}
      animate={{ borderColor: selected ? "#464646" : "#CECECE" }}
      transition={{ duration: 0.2 }}
      whileTap={{ scale: 0.97 }}
      style={{
        backgroundColor: "transparent",
        borderRadius: 8,
        border: "2px solid #CECECE",
        padding: "16px 18px",
        cursor: "pointer",
        textAlign: "left",
        display: "block",
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ripple */}
      {cardRipples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ scale: 0, opacity: 0.22 }}
          animate={{ scale: 12, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            position: "absolute",
            left: r.x - 20,
            top: r.y - 20,
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.08)",
            pointerEvents: "none",
          }}
        />
      ))}

      <div style={{
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: "20px",
        fontWeight: 600,
        letterSpacing: "-0.04em",
        color: "#202020",
      }}>{cat.name}</div>
      <div style={{
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: "16px",
        fontWeight: 600,
        letterSpacing: "-0.04em",
        color: "#6D6D6D",
        marginTop: 4,
      }}>{cat.desc}</div>
    </motion.button>
  );
}

// ─── Mic Button ──────────────────────────────────────────────────────────────
function MicButton({
  isRecording,
  onToggle,
}: {
  isRecording: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      {/* Soundwave bars while recording */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            key="waves"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              left: 48,
              display: "flex",
              alignItems: "center",
              gap: 3,
              height: 22,
              pointerEvents: "none",
            }}
          >
            {[0.4, 0.9, 0.6, 1.0, 0.5].map((delay, i) => (
              <motion.span
                key={i}
                animate={{ scaleY: [0.25, 1, 0.25] }}
                transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut", delay: delay * 0.35 }}
                style={{
                  display: "block",
                  width: 2.5,
                  height: 18,
                  borderRadius: 99,
                  backgroundColor: "#8B1A1A",
                  transformOrigin: "center",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.88 }}
        animate={{
          backgroundColor: isRecording ? "rgba(139,26,26,0.12)" : "rgba(63,90,73,0.1)",
        }}
        transition={{ duration: 0.3 }}
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
      <motion.span
        animate={isRecording ? { scale: [1, 1.18, 1] } : { scale: 1 }}
        transition={isRecording ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
          {/* Hand-drawn mic body */}
          <path
            d="M5.8,1.4 C5.2,1.5 4.8,2.1 4.7,2.8 L4.6,10.8 C4.7,12.9 6.6,14.4 9.1,14.3 C11.5,14.2 13.2,12.6 13.3,10.5 L13.2,2.6 C13.1,1.9 12.6,1.3 11.9,1.2 C10.8,1.0 8.2,1.0 5.8,1.4 Z"
            fill={isRecording ? "#8B1A1A" : "#3F5A49"}
            stroke={isRecording ? "#8B1A1A" : "#3F5A49"}
            strokeWidth="0.3"
            strokeLinejoin="round"
          />
          {/* Hand-drawn arc */}
          <path
            d="M1.4,10.2 C1.5,14.7 4.9,17.9 9.0,17.8 C13.1,17.7 16.4,14.4 16.5,10.0"
            stroke={isRecording ? "#8B1A1A" : "#3F5A49"}
            strokeWidth="1.7"
            strokeLinecap="round"
            fill="none"
          />
          {/* Stand */}
          <path
            d="M9.0,17.9 C9.1,19.2 8.9,20.4 9.0,21.4"
            stroke={isRecording ? "#8B1A1A" : "#3F5A49"}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </motion.span>
      </motion.button>
    </div>
  );
}

// ─── Progress Bar ────────────────────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ padding: "0 24px" }}>

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
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: StoryFormData) => Promise<void>;
}) {
  const [step, setStep]           = useState(0);
  const [answers, setAnswers]     = useState<string[]>(Array(TOTAL).fill(""));
  const [value, setValue]         = useState("");
  const [keyboardHeight, setKbH]  = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [ripples, setRipples]     = useState<{ id: number; x: number; y: number }[]>([]);
  const [sheetDraggable, setSheetDraggable] = useState(true);
  const [submitting, setSubmitting]         = useState(false);
  const [submitted, setSubmitted]           = useState(false);
  const [isRecording, setIsRecording]                 = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [speechSupported, setSpeechSupported]         = useState(false);
  const [settledWords, setSettledWords]               = useState<{ id: number; text: string }[]>([]);
  const [interimText, setInterimText]                 = useState("");
  const rippleId                  = useRef(0);
  const textareaRef               = useRef<HTMLTextAreaElement>(null);
  const scrollRef                 = useRef<HTMLDivElement>(null);
  const wordDisplayRef            = useRef<HTMLDivElement>(null);
  const recognitionRef            = useRef<any>(null);
  const baseTextRef               = useRef("");
  const finalTranscriptRef        = useRef("");
  const isRecordingRef            = useRef(false);
  const wordIdRef                 = useRef(0);
  const micSessionRef             = useRef(0);
  const isLastStep                = step === TOTAL - 1;
  const isCategoryStep            = step === TOTAL - 2;
  const charLimit                 = isLastStep ? MAX_TITLE : MAX;
  const atLimit                   = value.length >= charLimit;
  const isEmpty                   = value.length === 0;

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
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const supported = !!SR;
    console.log(supported ? "Speech API supported" : "Speech API not supported", {
      SpeechRecognition: !!(window as any).SpeechRecognition,
      webkitSpeechRecognition: !!(window as any).webkitSpeechRecognition,
      userAgent: navigator.userAgent,
    });
    setSpeechSupported(supported);
  }, []);

  useEffect(() => {
    if (!open) {
      if (isRecordingRef.current && recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        setIsRecording(false);
        isRecordingRef.current = false;
      }
      setValue("");
      setStep(0);
      setAnswers(Array(TOTAL).fill(""));
      setSelectedCategories([]);
      setKbH(0);
      setSubmitting(false);
      setSubmitted(false);
      return;
    }
    return;
  }, [open]);

  // Auto-close after success screen
  useEffect(() => {
    if (!submitted) return;
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop recording when step changes (only needed if still actively recording)
  useEffect(() => {
    if (isRecordingRef.current) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      isRecordingRef.current = false;
      setSettledWords([]);
      setInterimText("");
      baseTextRef.current = "";
      finalTranscriptRef.current = "";
    }
  }, [step]);

  async function handleNext() {
    micSessionRef.current++;
    setSettledWords([]);
    setInterimText("");
    const saved = [...answers];
    saved[step] = value;
    setAnswers(saved);

    if (isLastStep) {
      setSubmitting(true);
      try {
        await onSubmit?.({
          moment:   saved[0],
          worth_it: saved[1],
          advice:   saved[2].trim() || null,
          category: (selectedCategories[0] ?? "Adventure") as Category,
          title:    saved[4],
        });
        setSubmitted(true);
      } catch {
        // stay on step so user can retry
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setDirection(1);
    setStep((s) => s + 1);
    setValue(saved[step + 1] ?? "");
  }

  function toggleCategory(name: string) {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  function handleBack() {
    if (step === 0) return;
    micSessionRef.current++;
    setSettledWords([]);
    setInterimText("");
    const saved = [...answers];
    saved[step] = value;
    setAnswers(saved);
    setDirection(-1);
    setStep((s) => s - 1);
    setValue(saved[step - 1] ?? "");
  }

  function handleMicToggle() {
    console.log("mic tapped", { isRecording: isRecordingRef.current });

    if (isRecordingRef.current) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      isRecordingRef.current = false;
      setSettledWords([]);
      setInterimText("");
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    console.log("SR available:", !!SR, { SpeechRecognition: !!(window as any).SpeechRecognition, webkitSpeechRecognition: !!(window as any).webkitSpeechRecognition });
    if (!SR) {
      setSpeechSupported(false); // hides mic button
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    const supportedLocales = ["en-GB", "en-AU", "en-US"];
    const browserLang = navigator.language || "en-US";
    recognition.lang = supportedLocales.find((l) => browserLang.startsWith(l)) ?? "en-US";

    baseTextRef.current = value;
    finalTranscriptRef.current = "";
    const sessionId = ++micSessionRef.current;
    setSettledWords([]);
    setInterimText("");

    recognition.onresult = (event: any) => {
      if (micSessionRef.current !== sessionId) return;
      let newFinalText = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          newFinalText += event.results[i][0].transcript;
        } else {
          interim = event.results[i][0].transcript;
        }
      }
      if (newFinalText.trim()) {
        const newWords = newFinalText.trim().split(/\s+/).filter(Boolean);
        finalTranscriptRef.current += newFinalText;
        setSettledWords((prev) => [
          ...prev,
          ...newWords.map((text) => ({ id: ++wordIdRef.current, text })),
        ]);
      }
      setInterimText(interim);
      // Keep value in sync for submission
      const base = baseTextRef.current;
      const needsSep = base.length > 0 && !base.endsWith(" ");
      const full = base + (needsSep ? " " : "") + finalTranscriptRef.current + interim;
      setValue(full.slice(0, MAX));
      // Scroll word display to bottom
      setTimeout(() => {
        if (wordDisplayRef.current) {
          wordDisplayRef.current.scrollTop = wordDisplayRef.current.scrollHeight;
        }
      }, 0);
    };

    recognition.onerror = (event: any) => {
      console.log("recognition error:", event.error);
      setIsRecording(false);
      isRecordingRef.current = false;
      setSettledWords([]);
      setInterimText("");
    };

    recognition.onend = () => {
      if (isRecordingRef.current) {
        setIsRecording(false);
        isRecordingRef.current = false;
        setSettledWords([]);
        setInterimText("");
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      console.log("recognition started");
      setIsRecording(true);
      isRecordingRef.current = true;
      setMicPermissionDenied(false);
    } catch (e) {
      console.log("recognition start error:", e);
    }
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
        drag={sheetDraggable ? "y" : false}
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

        {/* Back button — 16px below pill */}
        <div style={{ height: 28, marginTop: 16, paddingLeft: 16, flexShrink: 0, display: "flex", alignItems: "center" }}>
          <AnimatePresence>
            {step > 0 && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileTap={{ scale: 0.92 }}
                onClick={handleBack}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: "#202020",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
                  <path d="M15 19L8 12L15 5" stroke="#202020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{
                  fontFamily: "Helvetica, Arial, sans-serif",
                  fontSize: "17px",
                  fontWeight: 400,
                  letterSpacing: "-0.03em",
                  color: "#202020",
                }}>Back</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar — 32px below back button */}
        <div style={{ marginTop: 32, flexShrink: 0 }}>
          <ProgressBar step={step} />
        </div>

        {/* Success screen */}
        {submitted && (
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 40px",
            textAlign: "center",
            gap: 16,
          }}>
            <motion.p
              initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              style={{
                fontFamily: "Helvetica, Arial, sans-serif",
                fontSize: 28, fontWeight: 700, color: "#202020",
                margin: 0, letterSpacing: "-0.03em", lineHeight: 1.2,
              }}
            >
              your story is out there.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: 16, fontWeight: 600, color: "#6D6D6D",
                margin: 0, letterSpacing: "-0.02em", lineHeight: 1.5,
              }}
            >
              it'll find the right person.
            </motion.p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.65 }}
              style={{
                width: 32, height: 2, borderRadius: 99,
                backgroundColor: "#282828", transformOrigin: "center",
              }}
            />
          </div>
        )}

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          onPointerDown={(e) => e.stopPropagation()}
          onScroll={() => {
            const el = scrollRef.current;
            if (!el) return;
            setSheetDraggable(el.scrollTop === 0);
          }}
          style={{
            flex: 1,
            display: submitted ? "none" : "flex",
            flexDirection: "column",
            padding: isCategoryStep ? "0 24px 160px" : "0 24px 180px",
            boxSizing: "border-box",
            overflowY: "auto",
            touchAction: "pan-y",
          }}
        >
          {/* Question + input — animate together as a unit on step change */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: direction * 48, filter: "blur(8px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: direction * -48, filter: "blur(8px)" }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Question */}
              <p style={{ ...questionFont, marginTop: 20 }}>{QUESTIONS[step]}</p>

              {isCategoryStep ? (
                /* ── Category selection (step 5) ── */
                <>
                  <p style={{
                    ...courierBase,
                    fontSize: "16px",
                    color: "#6D6D6D",
                    fontWeight: 600,
                    margin: 0,
                    marginTop: 10,
                    lineHeight: 1.55,
                  }}>
                    {PLACEHOLDERS[step].lines.map((line, i) => (
                      <span key={i}>{line}{i < PLACEHOLDERS[step].lines.length - 1 && <br />}</span>
                    ))}
                  </p>

                  <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 16 }}>
                    {CATEGORIES.map((cat) => (
                      <CategoryCard
                        key={cat.name}
                        cat={cat}
                        selected={selectedCategories.includes(cat.name)}
                        onToggle={() => toggleCategory(cat.name)}
                      />
                    ))}
                  </div>
                </>
              ) : (
                /* ── Text input (steps 1–4) ── */
                <div style={{ marginTop: 16, position: "relative" }}>
                  <AnimatePresence>
                    {isEmpty && !isRecording && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          ...courierBase,
                          color: "#6D6D6D",
                          fontWeight: 500,
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

                  {/* Word-by-word animated display while recording */}
                  {isRecording ? (
                    <div
                      ref={wordDisplayRef}
                      style={{
                        ...courierBase,
                        color: "#555555",
                        fontWeight: 600,
                        minHeight: `calc(5 * 1.55 * 16px)`,
                        overflowY: "auto",
                        lineHeight: 1.55,
                      }}
                    >
                      {/* Pre-existing typed text */}
                      {baseTextRef.current && (
                        <span>{baseTextRef.current} </span>
                      )}
                      {/* Settled words — animate in one by one */}
                      {settledWords.map((word) => (
                        <motion.span
                          key={word.id}
                          initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                          style={{ display: "inline" }}
                        >
                          {word.text}{" "}
                        </motion.span>
                      ))}
                      {/* Interim — faint, no animation */}
                      {interimText && (
                        <span style={{ opacity: 0.35 }}>{interimText}</span>
                      )}
                    </div>
                  ) : (
                    <textarea
                      ref={textareaRef}
                      value={value}
                      onChange={(e) => {
                        if (e.target.value.length <= charLimit) setValue(e.target.value);
                      }}
                      rows={5}
                      style={{
                        ...courierBase,
                        color: "#555555",
                        fontWeight: 600,
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
                  )}

                  {/* Mic + char count — 8px below textarea */}
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    {!isLastStep && speechSupported
                      ? <MicButton isRecording={isRecording} onToggle={handleMicToggle} />
                      : <div style={{ width: 44 }} />
                    }
                    <motion.span
                      animate={atLimit ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        ...courierBase,
                        fontSize: "13px",
                        color: atLimit ? "#e03b3b" : "#9a9a9a",
                        fontWeight: atLimit ? 700 : 400,
                      }}
                    >
                      {value.length}/{charLimit}
                    </motion.span>
                  </div>

                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div style={{ flex: 1 }} />
        </div>

        {/* Fixed bottom area — mic + CTA always above keyboard */}
        <div style={{
          position: "fixed",
          left: 0, right: 0,
          bottom: keyboardHeight,
          display: submitted ? "none" : undefined,
          backgroundColor: "#EDEAE5",
          zIndex: 62,
          transition: "bottom 0.25s ease",
        }}>

          <div style={{
            padding: keyboardHeight > 0 ? "12px 16px 16px" : "20px 16px 44px",
            display: "flex",
            justifyContent: "center",
          }}>
          <motion.button
            disabled={submitting || (isCategoryStep && selectedCategories.length === 0) || (!isCategoryStep && isEmpty)}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const id = ++rippleId.current;
              setRipples((r) => [
                ...r,
                { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
              ]);
              setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 700);
              handleNext();
            }}
            whileTap={{ scale: 0.96 }}
            whileHover={{ filter: "brightness(1.12)" }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
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
            {submitting ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                <span>sharing</span>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                    style={{ display: "inline-block" }}
                  >.</motion.span>
                ))}
              </span>
            ) : isLastStep ? "Share my story" : isCategoryStep ? "Almost done" : "Keep going"}
          </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
