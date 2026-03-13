"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "./BottomNav";
import WanderFeed from "./WanderFeed";
import CollectGrid from "./CollectGrid";
import CollectEmptyState from "./CollectEmptyState";
import StorySheet from "./StorySheet";
import StoryBottomSheet from "./StoryBottomSheet";
import AuthSheet from "./AuthSheet";
import { useAuth } from "../lib/authContext";
import {
  fetchSavesWithStories,
  saveStory,
  unsaveStory,
  submitStory,
  toggleDone,
} from "../lib/api";
import type { DBStory } from "../lib/storyTypes";
import type { StoryFormData } from "../lib/api";

type Tab = "Wander" | "Collect";

const PENDING_STORY_KEY = "wander_pending_save";

function getPendingStory(): DBStory | null {
  try {
    const json = localStorage.getItem(PENDING_STORY_KEY);
    return json ? JSON.parse(json) : null;
  } catch { return null; }
}

function setPendingStory(story: DBStory) {
  localStorage.setItem(PENDING_STORY_KEY, JSON.stringify(story));
}

function clearPendingStory() {
  localStorage.removeItem(PENDING_STORY_KEY);
}

export default function MainScreen() {
  const { user }                                    = useAuth();
  const [activeTab, setActiveTab]                   = useState<Tab>("Wander");
  const [showStorySheet, setShowStorySheet]         = useState(false);
  const [storySheetOpen, setStorySheetOpen]         = useState(false);
  const [showAuthSheet, setShowAuthSheet]           = useState(false);
  const [savedStories, setSavedStories]             = useState<DBStory[]>([]);
  const [doneIds, setDoneIds]                       = useState<Set<string>>(new Set());
  const [storiesRefreshKey, setStoriesRefreshKey]   = useState(0);
  const [postAuthStory, setPostAuthStory]           = useState<DBStory | null>(null);
  const [submittedStory, setSubmittedStory]         = useState<DBStory | null>(null);
  const [myStoryIds, setMyStoryIds]                 = useState<Set<string>>(() => {
    try {
      const ids = JSON.parse(localStorage.getItem("wander_my_stories") || "[]");
      return new Set(ids as string[]);
    } catch { return new Set(); }
  });


  const pendingActionRef = useRef<(() => void) | null>(null);

  const savedStoryIds = useMemo(() => new Set(savedStories.map((s) => s.id)), [savedStories]);

  // If saved list drops to zero, ensure the bottom sheet / nav state is reset
  useEffect(() => {
    if (savedStories.length === 0) setStorySheetOpen(false);
  }, [savedStories.length]);

  // Load saves from Supabase whenever user logs in
  useEffect(() => {
    if (!user) {
      setSavedStories([]);
      setDoneIds(new Set());
      return;
    }
    fetchSavesWithStories(user.id).then((rows) => {
      setSavedStories(rows.map((r) => r.story));
      setDoneIds(new Set(rows.filter((r) => r.is_done).map((r) => r.story.id)));
    });
  }, [user]);

  // After sign-in: close AuthSheet, recover any pending save from sessionStorage
  useEffect(() => {
    if (!user) return;

    setShowAuthSheet(false);

    const story = getPendingStory();
    if (story) {
      clearPendingStory();
      performSave(story).then(() => {
        setPostAuthStory(story);
        setStorySheetOpen(true);
      });
      return;
    }


    if (pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      action();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save / unsave ───────────────────────────────────────────────────────────
  async function performSave(story: DBStory) {
    if (!user) return;
    const alreadySaved = savedStoryIds.has(story.id);
    if (alreadySaved) {
      await unsaveStory(user.id, story.id);
      setSavedStories((prev) => prev.filter((s) => s.id !== story.id));
      setDoneIds((prev) => { const next = new Set(prev); next.delete(story.id); return next; });
    } else {
      try {
        await saveStory(user.id, story.id);
      } catch (e) {
        console.warn("saveStory failed:", e);
      }
      setSavedStories((prev) => [...prev, story]);
    }
  }

  function handleSaveToggle(story: DBStory) {
    if (!user) {
      setPendingStory(story);
      pendingActionRef.current = () => performSave(story);
      setShowAuthSheet(true);
      return;
    }
    performSave(story);
  }

  // ── Done toggle ─────────────────────────────────────────────────────────────
  async function handleToggleDone(storyId: string) {
    if (!user) return;
    const nowDone = !doneIds.has(storyId);
    setDoneIds((prev) => {
      const next = new Set(prev);
      nowDone ? next.add(storyId) : next.delete(storyId);
      return next;
    });
    await toggleDone(user.id, storyId, nowDone);
  }

  // ── Story submit — no auth required ────────────────────────────────────────
  async function handleSubmit(data: StoryFormData): Promise<void> {
    const story = await submitStory(data);
    // Track as own story
    setMyStoryIds((prev) => new Set([...prev, story.id]));
    try {
      const ids = JSON.parse(localStorage.getItem("wander_my_stories") || "[]") as string[];
      localStorage.setItem("wander_my_stories", JSON.stringify([...ids, story.id]));
    } catch {}
    // Add to canvas immediately (pending in DB, won't appear via feed fetch)
    setSubmittedStory(story);
  }


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        position: "fixed", inset: 0,
        backgroundColor: "#EDEAE5",
        width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "Wander" && (
          <motion.div
            key="wander"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ width: "100%" }}
          >
            <WanderFeed
              onStart={() => setShowStorySheet(true)}
              onStoryOpen={setStorySheetOpen}
              savedStoryIds={savedStoryIds}
              onSaveToggle={handleSaveToggle}
              refreshKey={storiesRefreshKey}
              submittedStory={submittedStory}
              myStoryIds={myStoryIds}
            />
          </motion.div>
        )}

        {activeTab === "Collect" && (
          <motion.div
            key="collect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ width: "100%" }}
          >
            {savedStories.length === 0
              ? <CollectEmptyState />
              : (
                <CollectGrid
                  savedStories={savedStories}
                  doneIds={doneIds}
                  onSaveToggle={handleSaveToggle}
                  onToggleDone={handleToggleDone}
                  onStoryOpen={setStorySheetOpen}
                />
              )
            }
          </motion.div>
        )}
      </AnimatePresence>

      {!storySheetOpen && (
        <BottomNav active={activeTab} onSwitch={setActiveTab} onShare={() => setShowStorySheet(true)} />
      )}

      <StorySheet
        open={showStorySheet}
        onClose={() => { setShowStorySheet(false); }}
        onSubmit={handleSubmit}
      />

      {/* Post-auth story sheet — opens automatically after magic link redirect */}
      <StoryBottomSheet
        story={postAuthStory}
        isSaved={postAuthStory ? true : false}
        onSaveToggle={() => postAuthStory && handleSaveToggle(postAuthStory)}
        onClose={() => { setPostAuthStory(null); setStorySheetOpen(false); }}
      />

      <AuthSheet open={showAuthSheet} onClose={() => setShowAuthSheet(false)} />
    </motion.div>
  );
}
