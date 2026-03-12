"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
// AnimatePresence + useAnimationControls used in FilterChip
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import StoryBottomSheet from "./StoryBottomSheet";
import type { Story, Category, TailDir } from "../lib/storyTypes";
import { CATEGORY_COLOR } from "../lib/storyTypes";

export type { Story };

// ── Bubble placement ───────────────────────────────────────────────────────────
// Positions are computed at module load via a phyllotaxis spiral so bubbles
// never overlap. The same function is used when new stories are added.

const PLACE_CX = 1500;
const PLACE_CY = 1300;
const BUBBLE_GAP = 14;   // min clear gap between bubble edges (px)
const BUBBLE_ROT_PAD = 8; // extra padding per side to absorb rotation wiggle

type PlacedRect = { x: number; y: number; w: number; h: number };

function bubbleRect(b: PlacedRect) {
  return {
    x1: b.x - BUBBLE_ROT_PAD,
    y1: b.y - BUBBLE_ROT_PAD,
    x2: b.x + b.w + BUBBLE_ROT_PAD,
    y2: b.y + b.h + 12 + BUBBLE_ROT_PAD, // +12 for tail
  };
}

function collidesWithAny(placed: PlacedRect[], candidate: PlacedRect): boolean {
  const c = bubbleRect(candidate);
  for (const p of placed) {
    const pr = bubbleRect(p);
    const clear =
      c.x2 + BUBBLE_GAP < pr.x1 ||
      c.x1 > pr.x2 + BUBBLE_GAP ||
      c.y2 + BUBBLE_GAP < pr.y1 ||
      c.y1 > pr.y2 + BUBBLE_GAP;
    if (!clear) return true;
  }
  return false;
}

/**
 * Find the nearest free slot on a golden-angle spiral centred at (cx, cy).
 * Call this whenever a new story is submitted — pass all existing placed rects
 * and the new bubble's dimensions to get a guaranteed non-overlapping position.
 */
export function findNextBubblePosition(
  placed: PlacedRect[],
  w: number,
  h: number,
  cx = PLACE_CX,
  cy = PLACE_CY,
): { x: number; y: number } {
  const golden = 2.39996; // golden angle in radians
  for (let i = 0; i < 4000; i++) {
    const r = 60 + 100 * Math.sqrt(i);
    const θ = i * golden;
    const x = Math.round(cx + r * Math.cos(θ) - w / 2);
    const y = Math.round(cy + r * Math.sin(θ) - h / 2);
    if (!collidesWithAny(placed, { x, y, w, h })) return { x, y };
  }
  return { x: cx - w / 2, y: cy - h / 2 };
}

// ── Story data ─────────────────────────────────────────────────────────────────
// Positions are computed by buildStories() — edit only the metadata here.
const STORIES_BASE = [
  { id: 1,  title: "the night I ate alone in Tokyo",               category: "Going solo"  as Category, rotation: -2,   bobDuration: 3.2, bobDelay: 0,    tailDir: "bc" as TailDir, seed: 42, w: 220, h: 90  },
  { id: 2,  title: "I took a pottery class knowing nothing",        category: "Learning"    as Category, rotation: 1.5,  bobDuration: 2.8, bobDelay: 0.4,  tailDir: "br" as TailDir, seed: 17, w: 240, h: 96  },
  { id: 3,  title: "solo train ride across Scotland",               category: "Adventure"   as Category, rotation: -1,   bobDuration: 3.6, bobDelay: 0.8,  tailDir: "bl" as TailDir, seed: 93, w: 220, h: 90  },
  { id: 4,  title: "said yes to a stranger's dinner invite",        category: "Connecting"  as Category, rotation: 2.5,  bobDuration: 3.0, bobDelay: 0.2,  tailDir: "bc" as TailDir, seed: 55, w: 240, h: 96  },
  { id: 5,  title: "learned to surf at 32",                         category: "Learning"    as Category, rotation: -2.5, bobDuration: 3.4, bobDelay: 1.0,  tailDir: "br" as TailDir, seed: 78, w: 200, h: 82  },
  { id: 6,  title: "the jazz bar I almost didn't enter",            category: "Going wild"  as Category, rotation: 1,    bobDuration: 2.6, bobDelay: 0.6,  tailDir: "bl" as TailDir, seed: 31, w: 240, h: 96  },
  { id: 7,  title: "drove with no destination for 6 hours",         category: "Adventure"   as Category, rotation: -1.5, bobDuration: 3.8, bobDelay: 1.4,  tailDir: "bc" as TailDir, seed: 64, w: 240, h: 96  },
  { id: 8,  title: "cooked a full meal from a foreign cookbook",    category: "Learning"    as Category, rotation: 2,    bobDuration: 3.1, bobDelay: 0.3,  tailDir: "br" as TailDir, seed: 19, w: 240, h: 96  },
  { id: 9,  title: "watched sunrise from a rooftop alone",          category: "Going solo"  as Category, rotation: -0.5, bobDuration: 2.9, bobDelay: 1.2,  tailDir: "bc" as TailDir, seed: 87, w: 240, h: 96  },
  { id: 10, title: "joined a dance class mid-season",               category: "Learning"    as Category, rotation: 1.5,  bobDuration: 3.5, bobDelay: 0.5,  tailDir: "bl" as TailDir, seed: 44, w: 220, h: 90  },
  { id: 11, title: "ate at a Michelin star restaurant solo",         category: "Going solo"  as Category, rotation: -2,   bobDuration: 3.3, bobDelay: 0.9,  tailDir: "bc" as TailDir, seed: 62, w: 240, h: 96  },
  { id: 12, title: "hitchhiked for the first time",                 category: "Adventure"   as Category, rotation: 1,    bobDuration: 2.7, bobDelay: 1.6,  tailDir: "br" as TailDir, seed: 28, w: 220, h: 90  },
  { id: 13, title: "spent a weekend with no phone",                 category: "Going solo"  as Category, rotation: -1.5, bobDuration: 3.7, bobDelay: 0.7,  tailDir: "bl" as TailDir, seed: 73, w: 220, h: 90  },
  { id: 14, title: "took an improv comedy class",                   category: "Learning"    as Category, rotation: 2.5,  bobDuration: 3.0, bobDelay: 0.1,  tailDir: "bc" as TailDir, seed: 11, w: 200, h: 82  },
  { id: 15, title: "walked across my city in one day",              category: "Adventure"   as Category, rotation: -1,   bobDuration: 3.2, bobDelay: 1.1,  tailDir: "br" as TailDir, seed: 96, w: 220, h: 90  },
  { id: 16, title: "camped alone for the first time",               category: "Adventure"   as Category, rotation: 1.5,  bobDuration: 2.8, bobDelay: 0.4,  tailDir: "bl" as TailDir, seed: 39, w: 220, h: 90  },
  { id: 17, title: "learned to say no to everything for a month",   category: "Going solo"  as Category, rotation: -2.5, bobDuration: 3.6, bobDelay: 1.3,  tailDir: "bc" as TailDir, seed: 82, w: 240, h: 96  },
  { id: 18, title: "went to a concert alone",                       category: "Going wild"  as Category, rotation: 2,    bobDuration: 3.1, bobDelay: 0.8,  tailDir: "br" as TailDir, seed: 57, w: 200, h: 82  },
  { id: 19, title: "moved to a city where I knew nobody",           category: "Connecting"  as Category, rotation: -1,   bobDuration: 2.9, bobDelay: 1.5,  tailDir: "bl" as TailDir, seed: 25, w: 240, h: 96  },
  { id: 20, title: "spent New Year's Eve completely alone",          category: "Going solo"  as Category, rotation: 1,    bobDuration: 3.4, bobDelay: 0.2,  tailDir: "bc" as TailDir, seed: 68, w: 240, h: 96  },
  { id: 21, title: "ran a half marathon with zero training",         category: "Adventure"   as Category, rotation: -1.5, bobDuration: 3.1, bobDelay: 0.7,  tailDir: "bl" as TailDir, seed: 14, w: 220, h: 90  },
  { id: 22, title: "tried stand-up comedy at an open mic",           category: "Going wild"  as Category, rotation: 2,    bobDuration: 2.7, bobDelay: 1.1,  tailDir: "bc" as TailDir, seed: 36, w: 240, h: 96  },
  { id: 23, title: "learned to make sourdough from scratch",         category: "Learning"    as Category, rotation: -2,   bobDuration: 3.5, bobDelay: 0.3,  tailDir: "br" as TailDir, seed: 51, w: 220, h: 90  },
  { id: 24, title: "booked a flight the night before",               category: "Going wild"  as Category, rotation: 1.5,  bobDuration: 3.3, bobDelay: 0.9,  tailDir: "bl" as TailDir, seed: 79, w: 200, h: 82  },
  { id: 25, title: "volunteered abroad for a month",                 category: "Connecting"  as Category, rotation: -1,   bobDuration: 2.9, bobDelay: 0.5,  tailDir: "bc" as TailDir, seed: 23, w: 200, h: 82  },
  { id: 26, title: "finished a book in a single sitting",            category: "Going solo"  as Category, rotation: 2.5,  bobDuration: 3.6, bobDelay: 1.4,  tailDir: "br" as TailDir, seed: 88, w: 220, h: 90  },
  { id: 27, title: "took a silent retreat for three days",           category: "Going solo"  as Category, rotation: -2.5, bobDuration: 3.0, bobDelay: 0.6,  tailDir: "bl" as TailDir, seed: 47, w: 240, h: 96  },
  { id: 28, title: "cold-emailed someone I admired — they replied",  category: "Connecting"  as Category, rotation: 1,    bobDuration: 2.8, bobDelay: 1.2,  tailDir: "bc" as TailDir, seed: 61, w: 240, h: 96  },
  { id: 29, title: "cycled across a country I'd never visited",      category: "Adventure"   as Category, rotation: -1.5, bobDuration: 3.4, bobDelay: 0.1,  tailDir: "br" as TailDir, seed: 33, w: 220, h: 90  },
  { id: 30, title: "threw a dinner party for strangers",             category: "Connecting"  as Category, rotation: 2,    bobDuration: 3.2, bobDelay: 0.8,  tailDir: "bl" as TailDir, seed: 95, w: 240, h: 96  },
];

function buildStories(): Story[] {
  const placed: PlacedRect[] = [];
  return STORIES_BASE.map((s) => {
    const { x, y } = findNextBubblePosition(placed, s.w, s.h);
    placed.push({ x, y, w: s.w, h: s.h });
    return { ...s, x, y };
  });
}

const STORIES: Story[] = buildStories();

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
  activeFilters,
  onTap,
}: {
  story: Story;
  activeFilters: string[];
  onTap: (s: Story) => void;
}) {
  const th = 12; // tail height
  const svgH = story.h + th;
  const path = getBubblePath(story.w, story.h, story.tailDir);
  const visible = activeFilters.includes("All") || activeFilters.includes(story.category);

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
      {/* Primary float — Y with irregular peaks so it never feels mechanical */}
      <motion.div
        animate={{ y: [0, -5, -3, -7, -2, -5, 0] }}
        transition={{
          duration: story.bobDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: story.bobDelay,
          repeatType: "loop",
        }}
      >
        {/* Secondary drift — X + micro-rotation at a different cadence */}
        <motion.div
          animate={{
            x: [0, 2, 3, 1, -1.5, -2.5, 0],
            rotate: [0, 0.35, -0.2, 0.45, -0.25, 0.1, 0],
          }}
          transition={{
            duration: story.bobDuration * 1.45,
            repeat: Infinity,
            ease: "easeInOut",
            delay: story.bobDelay * 0.6 + 0.2,
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
              style={{ display: "block", filter: "drop-shadow(0px 4px 18px rgba(0,0,0,0.06))" }}
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
                  fontWeight: 700,
                  color: CATEGORY_COLOR[story.category],
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
        </motion.div> {/* end secondary drift */}
      </motion.div>
    </div>
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
export default function WanderFeed({
  onStart,
  onStoryOpen,
  savedStoryIds,
  onSaveToggle,
}: {
  onStart?: () => void;
  onStoryOpen?: (open: boolean) => void;
  savedStoryIds?: Set<number>;
  onSaveToggle?: (story: Story) => void;
}) {
  const [activeFilters, setActiveFilters] = useState<string[]>(["All"]);

  function toggleFilter(f: string) {
    if (f === "All") {
      setActiveFilters(["All"]);
      return;
    }
    setActiveFilters((prev) => {
      const withoutAll = prev.filter((x) => x !== "All");
      const already = withoutAll.includes(f);
      const next = already ? withoutAll.filter((x) => x !== f) : [...withoutAll, f];
      return next.length === 0 ? ["All"] : next;
    });
  }
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  function openStory(story: Story) {
    setSelectedStory(story);
    onStoryOpen?.(true);
  }

  function closeStory() {
    setSelectedStory(null);
    onStoryOpen?.(false);
  }

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
              selected={activeFilters.includes(f)}
              onSelect={() => toggleFilter(f)}
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
        }}
      >
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={0.3}
          maxScale={2.5}
          limitToBounds={false}
          pinch={{ disabled: false }}
          wheel={{ disabled: false, smoothStep: 0.001 }}
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
              backgroundAttachment: "local",
            }}
          >
            {/* 3000×3000 canvas */}
            <div
              style={{
                width: 3000,
                height: 3000,
                position: "relative",
              }}
            >
              {STORIES.map((story) => (
                <StoryBubble
                  key={story.id}
                  story={story}
                  activeFilters={activeFilters}
                  onTap={openStory}
                />
              ))}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>


      {/* ── Story bottom sheet ───────────────────────────────────────────── */}
      <StoryBottomSheet
        story={selectedStory}
        isSaved={selectedStory ? (savedStoryIds?.has(selectedStory.id) ?? false) : false}
        onSaveToggle={() => selectedStory && onSaveToggle?.(selectedStory)}
        onClose={closeStory}
      />
    </div>
  );
}
