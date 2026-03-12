"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

export default function AuthSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  async function handleEmailSignIn() {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      setError("Something went wrong. Try again.");
    } else {
      setSent(true);
    }
  }

  function handleClose() {
    onClose();
    // Reset after exit animation
    setTimeout(() => {
      setSent(false);
      setEmail("");
      setError("");
    }, 400);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="auth-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.32)",
              backdropFilter: "blur(3px)",
              WebkitBackdropFilter: "blur(3px)",
              zIndex: 300,
            }}
          />

          {/* Sheet */}
          <motion.div
            key="auth-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            style={{
              position: "fixed",
              bottom: 0, left: 0, right: 0,
              backgroundColor: "#F5F0E8",
              borderRadius: "26px 26px 0 0",
              zIndex: 301,
              padding: "32px 28px 52px",
              boxSizing: "border-box",
            }}
          >
            <AnimatePresence mode="wait">
              {!sent ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 style={{
                    fontFamily: "Helvetica, Arial, sans-serif",
                    fontSize: 22, fontWeight: 700,
                    color: "#202020", margin: "0 0 8px",
                    letterSpacing: "-0.02em",
                  }}>
                    join wander
                  </h2>
                  <p style={{
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: 14, color: "#6D6D6D",
                    margin: "0 0 28px", lineHeight: 1.55,
                  }}>
                    sign in to save stories to your bucket list.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Google */}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      onClick={handleGoogleSignIn}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        gap: 10, height: 52,
                        backgroundColor: "#282828", color: "#FFFFFF",
                        border: "none", borderRadius: 12,
                        fontFamily: "'Courier New', Courier, monospace",
                        fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em",
                        cursor: "pointer",
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2582h2.9087C16.6582 14.0527 17.64 11.8018 17.64 9.2045z" fill="#4285F4"/>
                        <path d="M9 18c2.43 0 4.4673-.8064 5.9564-2.1818l-2.9087-2.2582c-.8063.54-1.8373.8591-3.0477.8591-2.3454 0-4.3309-1.5845-5.0386-3.7136H.9573v2.3318C2.4382 15.9836 5.4818 18 9 18z" fill="#34A853"/>
                        <path d="M3.9614 10.71c-.18-.54-.2827-1.1182-.2827-1.71s.1027-1.17.2827-1.71V4.9582H.9573A8.9963 8.9963 0 0 0 0 9c0 1.4523.3477 2.8227.9573 4.0418L3.9614 10.71z" fill="#FBBC05"/>
                        <path d="M9 3.5773c1.3227 0 2.5077.4554 3.4405 1.35l2.5813-2.5814C13.4627.8918 11.4255 0 9 0 5.4818 0 2.4382 2.0164.9573 4.9582L3.9614 7.29C4.6691 5.1609 6.6545 3.5773 9 3.5773z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </motion.button>

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1, height: 1, backgroundColor: "#E0DDD8" }} />
                      <span style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: 12, color: "#B0A898" }}>or</span>
                      <div style={{ flex: 1, height: 1, backgroundColor: "#E0DDD8" }} />
                    </div>

                    {/* Email */}
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEmailSignIn()}
                      style={{
                        height: 52, borderRadius: 12,
                        border: "1.5px solid #CECECE",
                        backgroundColor: "#FDFBF7",
                        padding: "0 16px",
                        fontFamily: "'Courier New', Courier, monospace",
                        fontSize: 15, color: "#202020",
                        outline: "none",
                        boxSizing: "border-box",
                        width: "100%",
                      }}
                    />

                    {error && (
                      <p style={{
                        fontFamily: "'Courier New', Courier, monospace",
                        fontSize: 13, color: "#e03b3b", margin: 0,
                      }}>
                        {error}
                      </p>
                    )}

                    <motion.button
                      onClick={handleEmailSignIn}
                      disabled={loading || !email.trim()}
                      animate={{ opacity: email.trim() ? 1 : 0.45 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        height: 52, borderRadius: 12,
                        border: "1.5px solid #282828",
                        backgroundColor: "transparent",
                        fontFamily: "'Courier New', Courier, monospace",
                        fontSize: 15, fontWeight: 700,
                        color: "#282828", letterSpacing: "-0.02em",
                        cursor: email.trim() ? "pointer" : "default",
                      }}
                    >
                      {loading ? "sending..." : "send magic link"}
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <h2 style={{
                    fontFamily: "Helvetica, Arial, sans-serif",
                    fontSize: 22, fontWeight: 700,
                    color: "#202020", margin: "0 0 8px",
                    letterSpacing: "-0.02em",
                  }}>
                    check your email
                  </h2>
                  <p style={{
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: 14, color: "#6D6D6D",
                    margin: "0 0 28px", lineHeight: 1.55,
                  }}>
                    we sent a link to <strong>{email}</strong>.<br />
                    tap it to sign in — then come back here.
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setSent(false); setEmail(""); }}
                    style={{
                      fontFamily: "'Courier New', Courier, monospace",
                      fontSize: 13, color: "#6D6D6D",
                      background: "none", border: "none",
                      cursor: "pointer", textDecoration: "underline",
                      padding: 0,
                    }}
                  >
                    use a different email
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
