"use client";

import { useState, useEffect, useRef } from "react";
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
  const [code,    setCode]    = useState("");
  const [verifying, setVerifying] = useState(false);
  const btnControls = useAnimationControls();
  const codeInputRef = useRef<HTMLInputElement>(null);

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

  // Focus code input when OTP step appears
  useEffect(() => {
    if (sent) setTimeout(() => codeInputRef.current?.focus(), 350);
  }, [sent]);

  async function handleEmailSignIn() {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      console.error("signInWithOtp error:", error);
      setError("Something went wrong. Try again.");
    } else {
      setSent(true);
    }
  }

  async function handleVerifyCode() {
    if (code.length < 6) return;
    setVerifying(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });
    setVerifying(false);
    if (error) {
      setError("Invalid or expired code. Try again.");
      setCode("");
    } else {
      onClose();
    }
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setSent(false);
      setEmail("");
      setCode("");
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
                /* ── Step 1: Email ── */
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
                    {loading ? "sending..." : "send code"}
                  </motion.button>
                </motion.div>
              ) : (
                /* ── Step 2: Enter 6-digit code ── */
                <motion.div
                  key="code"
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
                    we sent a code to <strong>{email}</strong>. enter it below.
                  </p>

                  <input
                    ref={codeInputRef}
                    type="number"
                    inputMode="numeric"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                      setCode(val);
                      if (val.length === 6) {
                        // auto-verify when 6 digits entered
                        setCode(val);
                      }
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
                    style={{
                      height: 52, borderRadius: 12,
                      border: "1.5px solid #CECECE",
                      backgroundColor: "#FDFBF7",
                      padding: "0 16px",
                      fontFamily: "'Courier New', Courier, monospace",
                      fontSize: 24, fontWeight: 700,
                      color: "#202020", letterSpacing: "0.2em",
                      outline: "none",
                      boxSizing: "border-box",
                      width: "100%",
                      textAlign: "center",
                    } as React.CSSProperties}
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
                    onClick={handleVerifyCode}
                    disabled={verifying || code.length < 6}
                    animate={{ backgroundColor: code.length >= 6 ? "#282828" : "#C0BAB2" }}
                    whileTap={code.length >= 6 ? { scale: 0.95 } : {}}
                    transition={{ duration: 0.2 }}
                    style={{
                      height: 52, borderRadius: 14,
                      border: "none", marginTop: 32,
                      fontFamily: "'Courier New', Courier, monospace",
                      fontSize: 18, fontWeight: 700,
                      color: "#ffffff", letterSpacing: "-0.02em",
                      cursor: code.length >= 6 ? "pointer" : "default",
                      width: "100%",
                      outline: "none",
                      WebkitTapHighlightColor: "transparent",
                    } as React.CSSProperties}
                  >
                    {verifying ? "verifying..." : "sign in"}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setSent(false); setEmail(""); setCode(""); setError(""); }}
                    style={{
                      fontFamily: "'Courier New', Courier, monospace",
                      fontSize: 15, fontWeight: 700, color: "#3F5A49",
                      background: "none", border: "none",
                      cursor: "pointer", textDecoration: "underline",
                      padding: 0, letterSpacing: "-0.02em",
                      marginTop: 16, display: "block",
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
