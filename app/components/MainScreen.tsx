"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "./BottomNav";
import WanderFeed from "./WanderFeed";
import WanderEmptyState from "./WanderEmptyState";
import CollectEmptyState from "./CollectEmptyState";
import StorySheet from "./StorySheet";

type Tab = "Wander" | "Collect";

export default function MainScreen() {
  const [activeTab, setActiveTab]       = useState<Tab>("Wander");
  const [showStorySheet, setShowStorySheet] = useState(false);
  const [storySheetOpen, setStorySheetOpen] = useState(false);
  // TODO: replace with real data check once backend is wired
  const hasStories = true;

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
            {/* TODO: replace `hasStories` with real data check once backend is wired */}
            {hasStories
              ? <WanderFeed onStart={() => setShowStorySheet(true)} onStoryOpen={setStorySheetOpen} />
              : <WanderEmptyState onStart={() => setShowStorySheet(true)} />
            }
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
            <CollectEmptyState />
          </motion.div>
        )}
      </AnimatePresence>

      {!storySheetOpen && (
        <BottomNav active={activeTab} onSwitch={setActiveTab} onShare={() => setShowStorySheet(true)} />
      )}

      <StorySheet open={showStorySheet} onClose={() => setShowStorySheet(false)} />
    </motion.div>
  );
}
