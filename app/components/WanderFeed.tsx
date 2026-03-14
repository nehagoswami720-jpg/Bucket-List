"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
// AnimatePresence + useAnimationControls used in FilterChip
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import StoryBottomSheet from "./StoryBottomSheet";
import WanderEmptyState from "./WanderEmptyState";
import type { Story, DBStory, Category, TailDir } from "../lib/storyTypes";
import { CATEGORY_COLOR } from "../lib/storyTypes";
import { fetchStories } from "../lib/api";
import { supabase } from "../lib/supabase";

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

const FILTERS = ["All", "Adventure", "Learning", "Connecting", "Going wild", "Going solo"];

// ── DB story → canvas story ─────────────────────────────────────────────────────
// Deterministically derives all visual/canvas props from the story UUID so the
// same story always renders at the same position with the same motion.
function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const ROTATIONS   = [-2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5];
const TAIL_DIRS   = ["bl", "bc", "br"] as TailDir[];
const BUBBLE_SIZES = [{ w: 200, h: 82 }, { w: 220, h: 90 }, { w: 240, h: 96 }];

function dbToCanvasStory(db: DBStory, placed: PlacedRect[]): Story {
  const h  = hashStr(db.id);
  const sz = BUBBLE_SIZES[h % BUBBLE_SIZES.length];
  const { x, y } = findNextBubblePosition(placed, sz.w, sz.h);
  return {
    ...db,
    x, y,
    rotation:    ROTATIONS[h % ROTATIONS.length],
    bobDuration: 2.6 + (h % 15) * 0.1,
    bobDelay:    (h % 16) * 0.1,
    tailDir:     TAIL_DIRS[h % 3],
    seed:        h % 100,
    w: sz.w,
    h: sz.h,
  };
}

function buildCanvasStories(dbStories: DBStory[]): Story[] {
  const placed: PlacedRect[] = [];
  return dbStories.map((db) => {
    const story = dbToCanvasStory(db, placed);
    placed.push({ x: story.x, y: story.y, w: story.w, h: story.h });
    return story;
  });
}

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
  isOwn = false,
}: {
  story: Story;
  activeFilters: string[];
  onTap: (s: Story) => void;
  isOwn?: boolean;
}) {
  const th = 12; // tail height
  const svgH = story.h + th;
  const path = getBubblePath(story.w, story.h, story.tailDir);
  const visible = activeFilters.includes("All") || story.category.some((c) => activeFilters.includes(c));

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
                fill={isOwn ? "#FFF8E8" : "#FFFFFF"}
                stroke={isOwn ? "#C49A28" : "#1C1C1C"}
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
                  color: CATEGORY_COLOR[story.category[0]],
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
  refreshKey,
  submittedStory,
  myStoryIds,
}: {
  onStart?: () => void;
  onStoryOpen?: (open: boolean) => void;
  savedStoryIds?: Set<string>;
  onSaveToggle?: (story: DBStory) => void;
  refreshKey?: number;
  submittedStory?: DBStory | null;
  myStoryIds?: Set<string>;
}) {
  const [stories, setStories]             = useState<Story[]>([]);
  const [loading, setLoading]             = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>(["All"]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  // Fetch stories from Supabase
  async function loadStories() {
    setLoading(true);
    try {
      const dbStories = await fetchStories();
      setStories(buildCanvasStories(dbStories));
    } catch (e) {
      console.error("failed to load stories:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStories(); }, [refreshKey]);

  // Realtime — add new published stories from other users as they come in
  useEffect(() => {
    const channel = supabase
      .channel("stories-inserts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "stories", filter: "status=eq.published" },
        (payload) => {
          const incoming = payload.new as DBStory;
          setStories((prev) => {
            if (prev.find((s) => s.id === incoming.id)) return prev;
            const placed = prev.map((s) => ({ x: s.x, y: s.y, w: s.w, h: s.h }));
            return [...prev, dbToCanvasStory(incoming, placed)];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Add just-submitted story to canvas and pan to it so user lands on their bubble
  useEffect(() => {
    if (!submittedStory) return;
    setStories((prev) => {
      if (prev.find((s) => s.id === submittedStory.id)) return prev;
      const placed = prev.map((s) => ({ x: s.x, y: s.y, w: s.w, h: s.h }));
      const newStory = dbToCanvasStory(submittedStory, placed);
      // Pan to the new bubble after a short delay so it's rendered before we move
      setTimeout(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight - 70 - 82;
        const cx = newStory.x + newStory.w / 2;
        const cy = newStory.y + newStory.h / 2;
        transformRef.current?.setTransform(-(cx - vw / 2), -(cy - vh / 2), 1, 600, "easeOut");
      }, 150);
      return [...prev, newStory];
    });
  }, [submittedStory]);

  function toggleFilter(f: string) {
    if (f === "All") { setActiveFilters(["All"]); return; }
    setActiveFilters((prev) => {
      const withoutAll = prev.filter((x) => x !== "All");
      const already = withoutAll.includes(f);
      const next = already ? withoutAll.filter((x) => x !== f) : [...withoutAll, f];
      return next.length === 0 ? ["All"] : next;
    });
  }

  function openStory(story: Story) { setSelectedStory(story); onStoryOpen?.(true); }
  function closeStory()             { setSelectedStory(null);  onStoryOpen?.(false); }

  // Drop user at a random spot within the bubble cluster on first load
  useEffect(() => {
    if (stories.length === 0) return;
    const canvasX = 1200 + Math.random() * 600;
    const canvasY = 1000 + Math.random() * 500;
    const vw = window.innerWidth;
    const vh = window.innerHeight - 70 - 82;
    transformRef.current?.setTransform(-(canvasX - vw / 2), -(canvasY - vh / 2), 1, 0);
  }, [stories.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // While fetching, show a subtle loading state
  if (loading) return (
    <div style={{
      position: "fixed", inset: 0,
      backgroundColor: "#F5F0E8",
      backgroundImage: "radial-gradient(circle, #E0D5C5 1.2px, transparent 1.2px)",
      backgroundSize: "24px 24px",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2], y: [0, -6, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
            style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#282828" }}
          />
        ))}
      </div>
    </div>
  );

  if (stories.length === 0) {
    return <WanderEmptyState onStart={onStart} />;
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2,
      backgroundColor: "#F5F0E8",
      backgroundImage: "radial-gradient(circle, #E0D5C5 1.2px, transparent 1.2px)",
      backgroundSize: "24px 24px",
    }}>

      {/* ── Filter chips ─────────────────────────────────────────────────── */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, paddingTop: 16, zIndex: 4 }}>
        <div style={{
          display: "flex", flexDirection: "row", gap: 10,
          paddingLeft: 16, paddingRight: 16, paddingBottom: 12,
          overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none",
        } as React.CSSProperties}>
          {FILTERS.map((f) => (
            <FilterChip key={f} label={f} selected={activeFilters.includes(f)} onSelect={() => toggleFilter(f)} />
          ))}
        </div>
      </div>

      {/* ── Infinite pan canvas ──────────────────────────────────────────── */}
      <div style={{
        position: "absolute", top: 70, left: 0, right: 0, bottom: 82,
        overflow: "hidden", touchAction: "none", backgroundColor: "#F5F0E8",
      }}>
        <TransformWrapper
          ref={transformRef}
          initialScale={1} minScale={0.3} maxScale={2.5}
          limitToBounds={false}
          pinch={{ disabled: false }}
          wheel={{ disabled: false, smoothStep: 0.001 }}
          doubleClick={{ disabled: true }}
          panning={{ velocityDisabled: false }}
        >
          <TransformComponent wrapperStyle={{
            width: "100%", height: "100%",
            backgroundColor: "#F5F0E8",
            backgroundImage: "radial-gradient(circle, #E0D5C5 1.2px, transparent 1.2px)",
            backgroundSize: "24px 24px",
            backgroundAttachment: "local",
          }}>
            <div style={{ width: 3000, height: 3000, position: "relative" }}>
              {stories.map((story) => (
                <StoryBubble key={story.id} story={story} activeFilters={activeFilters} onTap={openStory} isOwn={myStoryIds?.has(story.id) ?? false} />
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
        isOwnStory={selectedStory ? (myStoryIds?.has(selectedStory.id) ?? false) : false}
      />
    </div>
  );
}
