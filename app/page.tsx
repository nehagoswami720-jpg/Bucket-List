"use client";

import { useState } from "react";
import SplashScreen from "./components/SplashScreen";
import MainScreen from "./components/MainScreen";
import { useAuth } from "./lib/authContext";

export default function Home() {
  const { user, loading } = useAuth();
  const [showedSplash, setShowedSplash] = useState(false);

  // Check if user has ever signed up on this device
  // Wait for Supabase session check — render nothing to avoid any flash
  if (loading) {
    return (
      <div style={{ position: "fixed", inset: 0, backgroundColor: "#EDEAE5" }} />
    );
  }

  // Signed-in user — skip onboarding
  if (user) {
    return <MainScreen />;
  }

  // Brand new user — show splash → welcome → main
  return showedSplash ? (
    <MainScreen />
  ) : (
    <SplashScreen onStartExploring={() => setShowedSplash(true)} />
  );
}
