"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
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
  const btnControls = useAnimationControls();

  // Bounce the button when it transitions from disabled → enabled
  useEffect(() => {
    if (email.trim()) {
      btnControls.start({
        backgroundColor: "#282828",
        scale: [1, 1.05, 0.97, 1.02, 1],
        transition: { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] },
      });
    } else {
      btnControls.start({
        backgroundColor: "#C0BAB2",
        scale: 1,
        transition: { duration: 0.2 },
      });
    }
  }, [!!email.trim()]); // eslint-disable-line react-hooks/exhaustive-deps

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
              backgroundColor: "#FFF3E5",
              borderRadius: "26px 26px 0 0",
              zIndex: 301,
              padding: "32px 28px 52px",
              boxSizing: "border-box",
            }}
          >
            {/* Close button */}
            <motion.button
              onClick={handleClose}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              style={{
                position: "absolute", top: 18, right: 20,
                width: 32, height: 32, borderRadius: "50%",
                border: "none", backgroundColor: "rgba(0,0,0,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", padding: 0, outline: "none",
                WebkitTapHighlightColor: "transparent",
              } as React.CSSProperties}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="#282828" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </motion.button>

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
                    fontSize: 20, fontWeight: 700,
                    color: "#202020", margin: "0 0 4px",
                    letterSpacing: "-0.02em",
                  }}>
                    Want to create your bucket list?
                  </h2>
                  <p style={{
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: 16, fontWeight: 600, color: "#6D6D6D",
                    margin: "0 0 24px", lineHeight: 1.3,
                    letterSpacing: "-0.02em",
                  }}>
                    sign up to save stories to your bucket list.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

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
                        fontSize: 13, color: "#e03b3b", margin: "8px 0 0",
                      }}>
                        {error}
                      </p>
                    )}

                    <motion.button
                      onClick={handleEmailSignIn}
                      disabled={loading || !email.trim()}
                      initial={{ backgroundColor: "#C0BAB2" }}
                      animate={btnControls}
                      whileTap={email.trim() ? { scale: 0.95 } : {}}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      style={{
                        height: 52, borderRadius: 14,
                        border: "none", marginTop: 32,
                        fontFamily: "'Courier New', Courier, monospace",
                        fontSize: 18, fontWeight: 700,
                        color: "#ffffff", letterSpacing: "-0.02em",
                        cursor: email.trim() ? "pointer" : "default",
                        width: "100%",
                        outline: "none",
                        WebkitTapHighlightColor: "transparent",
                      } as React.CSSProperties}
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
                    fontSize: 20, fontWeight: 700,
                    color: "#202020", margin: "0 0 4px",
                    letterSpacing: "-0.02em",
                  }}>
                    check your email
                  </h2>
                  <p style={{
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: 16, fontWeight: 600, color: "#6D6D6D",
                    margin: "0 0 24px", lineHeight: 1.3,
                    letterSpacing: "-0.02em",
                  }}>
                    we sent a link to <strong>{email}</strong>.<br />
                    tap it to sign in — then come back here.
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setSent(false); setEmail(""); }}
                    style={{
                      fontFamily: "'Courier New', Courier, monospace",
                      fontSize: 15, fontWeight: 700, color: "#3F5A49",
                      background: "none", border: "none",
                      cursor: "pointer", textDecoration: "underline",
                      padding: 0, letterSpacing: "-0.02em",
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
