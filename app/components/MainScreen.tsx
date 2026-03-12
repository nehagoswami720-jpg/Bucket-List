"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "./BottomNav";
import WanderFeed from "./WanderFeed";
import CollectGrid from "./CollectGrid";
import StorySheet from "./StorySheet";
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

export default function MainScreen() {
  const { user }                                    = useAuth();
  const [activeTab, setActiveTab]                   = useState<Tab>("Wander");
  const [showStorySheet, setShowStorySheet]         = useState(false);
  const [storySheetOpen, setStorySheetOpen]         = useState(false);
  const [showAuthSheet, setShowAuthSheet]           = useState(false);
  const [savedStories, setSavedStories]             = useState<DBStory[]>([]);
  const [doneIds, setDoneIds]                       = useState<Set<string>>(new Set());
  const [storiesRefreshKey, setStoriesRefreshKey]   = useState(0);

  // Stores an action to run after user signs in
  const pendingActionRef = useRef<(() => void) | null>(null);

  const savedStoryIds = useMemo(() => new Set(savedStories.map((s) => s.id)), [savedStories]);

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

  // After sign-in, execute any pending action (save / submit)
  useEffect(() => {
    if (user && pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      action();
    }
  }, [user]);

  // ── Save / unsave ───────────────────────────────────────────────────────────
  async function performSave(story: DBStory) {
    if (!user) return;
    const alreadySaved = savedStoryIds.has(story.id);
    if (alreadySaved) {
      await unsaveStory(user.id, story.id);
      setSavedStories((prev) => prev.filter((s) => s.id !== story.id));
      setDoneIds((prev) => { const next = new Set(prev); next.delete(story.id); return next; });
    } else {
      await saveStory(user.id, story.id);
      setSavedStories((prev) => [...prev, story]);
    }
  }

  function handleSaveToggle(story: DBStory) {
    if (!user) {
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

  // ── Story submit ────────────────────────────────────────────────────────────
  async function performSubmit(data: StoryFormData) {
    if (!user) return;
    try {
      await submitStory({ ...data, user_id: user.id });
      setShowStorySheet(false);
      setStoriesRefreshKey((k) => k + 1); // triggers WanderFeed re-fetch
    } catch (e) {
      console.error("submit failed:", e);
    }
  }

  function handleSubmit(data: StoryFormData) {
    if (!user) {
      pendingActionRef.current = () => performSubmit(data);
      setShowAuthSheet(true);
      return;
    }
    performSubmit(data);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#EDEAE5",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
            <CollectGrid
              savedStories={savedStories}
              doneIds={doneIds}
              onSaveToggle={handleSaveToggle}
              onToggleDone={handleToggleDone}
              onStoryOpen={setStorySheetOpen}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!storySheetOpen && (
        <BottomNav active={activeTab} onSwitch={setActiveTab} onShare={() => setShowStorySheet(true)} />
      )}

      <StorySheet
        open={showStorySheet}
        onClose={() => setShowStorySheet(false)}
        onSubmit={handleSubmit}
      />

      <AuthSheet open={showAuthSheet} onClose={() => setShowAuthSheet(false)} />
    </motion.div>
  );
}
