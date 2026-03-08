"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

// ── Types ──────────────────────────────────────────────────────────────────────
type TailDir = "bl" | "bc" | "br";
type Category = "Adventure" | "Learning" | "Connecting" | "Going wild" | "Going solo";

interface Story {
  id: number;
  title: string;
  category: Category;
  x: number;
  y: number;
  rotation: number;
  bobDuration: number;
  bobDelay: number;
  tailDir: TailDir;
  seed: number;
  w: number;
  h: number;
}

// ── Story data ─────────────────────────────────────────────────────────────────
// Bubbles clustered in a ~1000×900px zone centered around (1500, 1200)
// so at 1x zoom ~4-5 bubbles are visible per screen and panning reveals more
const STORIES: Story[] = [
  { id: 1,  title: "the night I ate alone in Tokyo",               category: "Going solo",  x: 1080, y: 960,  rotation: -2,   bobDuration: 3.2, bobDelay: 0,    tailDir: "bc", seed: 42, w: 220, h: 90  },
  { id: 2,  title: "I took a pottery class knowing nothing",        category: "Learning",    x: 1360, y: 830,  rotation: 1.5,  bobDuration: 2.8, bobDelay: 0.4,  tailDir: "br", seed: 17, w: 240, h: 96  },
  { id: 3,  title: "solo train ride across Scotland",               category: "Adventure",   x: 1650, y: 1000, rotation: -1,   bobDuration: 3.6, bobDelay: 0.8,  tailDir: "bl", seed: 93, w: 220, h: 90  },
  { id: 4,  title: "said yes to a stranger's dinner invite",        category: "Connecting",  x: 1220, y: 1150, rotation: 2.5,  bobDuration: 3.0, bobDelay: 0.2,  tailDir: "bc", seed: 55, w: 240, h: 96  },
  { id: 5,  title: "learned to surf at 32",                         category: "Learning",    x: 1510, y: 1220, rotation: -2.5, bobDuration: 3.4, bobDelay: 1.0,  tailDir: "br", seed: 78, w: 200, h: 82  },
  { id: 6,  title: "the jazz bar I almost didn't enter",            category: "Going wild",  x: 1780, y: 880,  rotation: 1,    bobDuration: 2.6, bobDelay: 0.6,  tailDir: "bl", seed: 31, w: 240, h: 96  },
  { id: 7,  title: "drove with no destination for 6 hours",         category: "Adventure",   x: 1920, y: 1100, rotation: -1.5, bobDuration: 3.8, bobDelay: 1.4,  tailDir: "bc", seed: 64, w: 240, h: 96  },
  { id: 8,  title: "cooked a full meal from a foreign cookbook",    category: "Learning",    x: 1060, y: 1310, rotation: 2,    bobDuration: 3.1, bobDelay: 0.3,  tailDir: "br", seed: 19, w: 240, h: 96  },
  { id: 9,  title: "watched sunrise from a rooftop alone",          category: "Going solo",  x: 1360, y: 1420, rotation: -0.5, bobDuration: 2.9, bobDelay: 1.2,  tailDir: "bc", seed: 87, w: 240, h: 96  },
  { id: 10, title: "joined a dance class mid-season",               category: "Learning",    x: 1660, y: 1360, rotation: 1.5,  bobDuration: 3.5, bobDelay: 0.5,  tailDir: "bl", seed: 44, w: 220, h: 90  },
  { id: 11, title: "ate at a Michelin star restaurant solo",         category: "Going solo",  x: 1890, y: 1290, rotation: -2,   bobDuration: 3.3, bobDelay: 0.9,  tailDir: "bc", seed: 62, w: 240, h: 96  },
  { id: 12, title: "hitchhiked for the first time",                 category: "Adventure",   x: 1120, y: 1540, rotation: 1,    bobDuration: 2.7, bobDelay: 1.6,  tailDir: "br", seed: 28, w: 220, h: 90  },
  { id: 13, title: "spent a weekend with no phone",                 category: "Going solo",  x: 1430, y: 1600, rotation: -1.5, bobDuration: 3.7, bobDelay: 0.7,  tailDir: "bl", seed: 73, w: 220, h: 90  },
  { id: 14, title: "took an improv comedy class",                   category: "Learning",    x: 1720, y: 1550, rotation: 2.5,  bobDuration: 3.0, bobDelay: 0.1,  tailDir: "bc", seed: 11, w: 200, h: 82  },
  { id: 15, title: "walked across my city in one day",              category: "Adventure",   x: 1960, y: 1470, rotation: -1,   bobDuration: 3.2, bobDelay: 1.1,  tailDir: "br", seed: 96, w: 220, h: 90  },
  { id: 16, title: "camped alone for the first time",               category: "Adventure",   x: 1090, y: 1730, rotation: 1.5,  bobDuration: 2.8, bobDelay: 0.4,  tailDir: "bl", seed: 39, w: 220, h: 90  },
  { id: 17, title: "learned to say no to everything for a month",   category: "Going solo",  x: 1370, y: 1810, rotation: -2.5, bobDuration: 3.6, bobDelay: 1.3,  tailDir: "bc", seed: 82, w: 240, h: 96  },
  { id: 18, title: "went to a concert alone",                       category: "Going wild",  x: 1650, y: 1760, rotation: 2,    bobDuration: 3.1, bobDelay: 0.8,  tailDir: "br", seed: 57, w: 200, h: 82  },
  { id: 19, title: "moved to a city where I knew nobody",           category: "Connecting",  x: 1880, y: 1670, rotation: -1,   bobDuration: 2.9, bobDelay: 1.5,  tailDir: "bl", seed: 25, w: 240, h: 96  },
  { id: 20, title: "spent New Year's Eve completely alone",          category: "Going solo",  x: 1250, y: 1670, rotation: 1,    bobDuration: 3.4, bobDelay: 0.2,  tailDir: "bc", seed: 68, w: 240, h: 96  },
];

const FILTERS = ["All", "Adventure", "Learning", "Connecting", "Going wild", "Going solo"];

// ── SVG bubble path ─────────────────────────────────────────────────────────────
function getBubblePath(w: number, h: number, tailDir: TailDir): string {
  const r = 10;
  const tw = 14;
  const th = 12;

  if (tailDir === "bc") {
    const tx = w / 2;
    return [
      `M ${r},0`, `Q 0,0 0,${r}`,
      `L 0,${h - r}`, `Q 0,${h} ${r},${h}`,
      `L ${tx - tw / 2},${h}`, `L ${tx},${h + th}`, `L ${tx + tw / 2},${h}`,
      `L ${w - r},${h}`, `Q ${w},${h} ${w},${h - r}`,
      `L ${w},${r}`, `Q ${w},0 ${w - r},0`, `Z`,
    ].join(" ");
  }
  if (tailDir === "bl") {
    const tx = r + 12;
    return [
      `M ${r},0`, `Q 0,0 0,${r}`,
      `L 0,${h - r}`, `Q 0,${h} ${r},${h}`,
      `L ${tx},${h}`, `L ${tx - 7},${h + th}`, `L ${tx + tw},${h}`,
      `L ${w - r},${h}`, `Q ${w},${h} ${w},${h - r}`,
      `L ${w},${r}`, `Q ${w},0 ${w - r},0`, `Z`,
    ].join(" ");
  }
  // br
  const tx = w - r - 12;
  return [
    `M ${r},0`, `Q 0,0 0,${r}`,
    `L 0,${h - r}`, `Q 0,${h} ${r},${h}`,
    `L ${tx - tw},${h}`, `L ${tx + 7},${h + th}`, `L ${tx},${h}`,
    `L ${w - r},${h}`, `Q ${w},${h} ${w},${h - r}`,
    `L ${w},${r}`, `Q ${w},0 ${w - r},0`, `Z`,
  ].join(" ");
}

// ── Story bubble ───────────────────────────────────────────────────────────────
function StoryBubble({
  story,
  activeFilter,
  onTap,
}: {
  story: Story;
  activeFilter: string;
  onTap: (s: Story) => void;
}) {
  const th = 12; // tail height
  const svgH = story.h + th;
  const path = getBubblePath(story.w, story.h, story.tailDir);
  const visible = activeFilter === "All" || story.category === activeFilter;

  return (
    /* rotation wrapper — plain div so Framer Motion transforms don't conflict */
    <div
      style={{
        position: "absolute",
        left: story.x,
        top: story.y,
        transform: `rotate(${story.rotation}deg)`,
        transformOrigin: "center center",
      }}
    >
      {/* bob animation */}
      <motion.div
        animate={{ y: [0, 3, 0, -3, 0] }}
        transition={{
          duration: story.bobDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: story.bobDelay,
          repeatType: "loop",
        }}
      >
        {/* opacity layer for category filter */}
        <motion.div
          animate={{ opacity: visible ? 1 : 0.18 }}
          transition={{ duration: 0.3 }}
        >
          {/* tap interaction */}
          <motion.div
            whileTap={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            onClick={() => onTap(story)}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            {/* Wobbly SVG bubble */}
            <svg
              width={story.w}
              height={svgH}
              viewBox={`0 0 ${story.w} ${svgH}`}
              overflow="visible"
              style={{ display: "block" }}
            >
              <defs>
                <filter
                  id={`w${story.id}`}
                  x="-8%" y="-8%"
                  width="116%" height="116%"
                >
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.032"
                    numOctaves="3"
                    seed={story.seed}
                    result="noise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale="2.8"
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                </filter>
              </defs>
              <path
                d={path}
                fill="#FFFFFF"
                stroke="#1C1C1C"
                strokeWidth="2"
                strokeLinejoin="round"
                filter={`url(#w${story.id})`}
              />
            </svg>

            {/* Title text — overlaid on bubble body (not tail) */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: story.w,
                height: story.h,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 12px",
                boxSizing: "border-box",
                pointerEvents: "none",
              }}
            >
              <p
                style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: "14px",
                  color: "#202126",
                  textAlign: "center",
                  margin: 0,
                  lineHeight: 1.45,
                  wordBreak: "break-word",
                }}
              >
                {story.title}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Story bottom sheet ─────────────────────────────────────────────────────────
function StoryBottomSheet({
  story,
  onClose,
}: {
  story: Story | null;
  onClose: () => void;
}) {
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
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.28)",
              zIndex: 55,
            }}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 500) onClose();
            }}
            transition={{ duration: 0.52, ease: [0.32, 0.72, 0, 1] }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              height: "68vh",
              backgroundColor: "#F5F0E8",
              borderRadius: "20px 20px 0 0",
              zIndex: 56,
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
              overflowY: "auto",
            }}
          >
            {/* Drag handle */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: 14,
                paddingBottom: 6,
                flexShrink: 0,
                cursor: "pointer",
              }}
              onClick={onClose}
            >
              <motion.div
                whileHover={{ scaleX: 1.2, backgroundColor: "rgba(0,0,0,0.3)" }}
                style={{
                  width: 38,
                  height: 4,
                  borderRadius: 99,
                  backgroundColor: "rgba(0,0,0,0.18)",
                }}
              />
            </div>

            <div style={{ padding: "12px 24px 48px", flex: 1, display: "flex", flexDirection: "column" }}>
              {/* Category pill */}
              <div
                style={{
                  display: "inline-flex",
                  alignSelf: "flex-start",
                  backgroundColor: "rgba(0,0,0,0.07)",
                  borderRadius: 6,
                  padding: "3px 10px",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: "12px",
                    color: "#555",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {story.category}
                </span>
              </div>

              {/* Title */}
              <h2
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#202126",
                  lineHeight: 1.3,
                  margin: "0 0 20px",
                }}
              >
                {story.title}
              </h2>

              {/* Story body — placeholder */}
              <p
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "16px",
                  color: "#3a3530",
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
                ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                aliquip ex ea commodo consequat.
                <br /><br />
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
                non proident, sunt in culpa qui officia deserunt mollit anim id est
                laborum.
              </p>

              {/* Save / pushpin */}
              <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end", paddingTop: 24 }}>
                <motion.button
                  whileTap={{ scale: 0.88, rotate: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 8,
                    fontSize: 22,
                  }}
                >
                  📌
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Filter chip ────────────────────────────────────────────────────────────────
function FilterChip({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const controls = useAnimationControls();

  useEffect(() => {
    if (selected) {
      controls.start({
        scale: [1, 1.14, 0.97, 1],
        transition: { duration: 0.38, ease: [0.34, 1.56, 0.64, 1] },
      });
    }
  }, [selected, controls]);

  return (
    <motion.button
      animate={controls}
      whileTap={{ scale: 0.92 }}
      onClick={onSelect}
      style={{
        flexShrink: 0,
        fontFamily: "Helvetica, Arial, sans-serif",
        fontSize: 16,
        fontWeight: selected ? 700 : 400,
        color: selected ? "#E5E1DD" : "#202020",
        backgroundColor: selected ? "#282828" : "transparent",
        borderRadius: 8,
        border: "1px solid",
        borderColor: selected ? "transparent" : "#6D6D6D",
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 14,
        paddingRight: 14,
        cursor: "pointer",
        whiteSpace: "nowrap",
        outline: "none",
        WebkitTapHighlightColor: "transparent",
        transition: "background-color 0.12s ease, color 0.12s ease, border-color 0.12s ease",
      }}
    >
      {label}
    </motion.button>
  );
}

// ── Main WanderFeed ────────────────────────────────────────────────────────────
export default function WanderFeed({ onStart }: { onStart?: () => void }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  // Drop user at a random spot within the bubble cluster on each page load
  useEffect(() => {
    // Bubbles are clustered around x:1080–1950, y:860–1800
    const canvasX = 1200 + Math.random() * 600; // 1200–1800
    const canvasY = 1000 + Math.random() * 500; // 1000–1500
    const vw = window.innerWidth;
    const vh = window.innerHeight - 70 - 82;
    transformRef.current?.setTransform(
      -(canvasX - vw / 2),
      -(canvasY - vh / 2),
      1,
      0,
    );
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2,
      backgroundColor: "#F5F0E8",
      backgroundImage: "radial-gradient(circle, #E0D5C5 1.2px, transparent 1.2px)",
      backgroundSize: "24px 24px",
    }}>

      {/* ── Filter chips — fixed at top ──────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          paddingTop: 16,
          zIndex: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 10,
            paddingLeft: 16,
            paddingRight: 16,
            paddingBottom: 12,
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          } as React.CSSProperties}
        >
          {FILTERS.map((f) => (
            <FilterChip
              key={f}
              label={f}
              selected={activeFilter === f}
              onSelect={() => setActiveFilter(f)}
            />
          ))}
        </div>
      </div>

      {/* ── Infinite pan canvas ──────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 0,
          right: 0,
          bottom: 82,
          overflow: "hidden",
          touchAction: "none",
          backgroundColor: "#F5F0E8",
          backgroundImage: "radial-gradient(circle, #E0D5C5 1.2px, transparent 1.2px)",
          backgroundSize: "24px 24px",
        }}
      >
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={1}
          maxScale={1}
          limitToBounds={false}
          pinch={{ disabled: true }}
          wheel={{ disabled: true }}
          doubleClick={{ disabled: true }}
          panning={{ velocityDisabled: false }}
        >
          <TransformComponent
            wrapperStyle={{
              width: "100%",
              height: "100%",
              backgroundColor: "#F5F0E8",
              backgroundImage: "radial-gradient(circle, #E0D5C5 1.2px, transparent 1.2px)",
              backgroundSize: "24px 24px",
            }}
          >
            {/* 3000×3000 canvas */}
            <div
              style={{
                width: 3000,
                height: 3000,
                position: "relative",
                backgroundColor: "#F5F0E8",
                backgroundImage:
                  "radial-gradient(circle, #E0D5C5 1.2px, transparent 1.2px)",
                backgroundSize: "24px 24px",
              }}
            >
              {STORIES.map((story) => (
                <StoryBubble
                  key={story.id}
                  story={story}
                  activeFilter={activeFilter}
                  onTap={setSelectedStory}
                />
              ))}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>

      {/* ── Compose button — opens story submission sheet ───────────────── */}
      {onStart && (
        <motion.button
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          onClick={onStart}
          style={{
            position: "fixed",
            bottom: 110,
            right: 24,
            zIndex: 52,
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: "#282828",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M14.85 2.85a1.5 1.5 0 0 1 2.12 2.12l-9.5 9.5-2.83.71.71-2.83 9.5-9.5Z"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M13 4.5l2.5 2.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </motion.button>
      )}

      {/* ── Story bottom sheet ───────────────────────────────────────────── */}
      <StoryBottomSheet
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
      />
    </div>
  );
}
