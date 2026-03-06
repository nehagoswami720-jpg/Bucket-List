"use client";

import { useState } from "react";
import SplashScreen from "./components/SplashScreen";
import MainScreen from "./components/MainScreen";

export default function Home() {
  const [screen, setScreen] = useState<"splash" | "main">("splash");

  return screen === "splash" ? (
    <SplashScreen onStartExploring={() => setScreen("main")} />
  ) : (
    <MainScreen />
  );
}
