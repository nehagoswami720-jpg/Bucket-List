"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
  style,
  onComplete,
}: TypewriterProps) {
  const textArray  = Array.isArray(text) ? text : [text];
  const [textArrayIndex, setTextArrayIndex] = useState(0);
  const currentText = textArray[textArrayIndex] || "";

  // chars: array of revealed characters with stable keys
  const [chars, setChars]     = useState<{ id: number; char: string }[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const charIdRef = useRef(0);

  useEffect(() => {
    if (!currentText) return;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (chars.length < currentText.length) {
          const nextChar = currentText[chars.length];
          setChars((prev) => [...prev, { id: ++charIdRef.current, char: nextChar }]);
        } else if (loop) {
          setTimeout(() => setIsDeleting(true), delay);
        } else {
          onComplete?.();
        }
      } else {
        if (chars.length > 0) {
          setChars((prev) => prev.slice(0, -1));
        } else {
          setIsDeleting(false);
          setTextArrayIndex((prev) => (prev + 1) % textArray.length);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [chars, isDeleting, currentText, loop, speed, deleteSpeed, delay]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span className={className} style={style}>
      {chars.map(({ id, char }) =>
        char === "\n" ? (
          <br key={id} />
        ) : (
          <span key={id}>{char}</span>
        )
      )}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.55, repeat: Infinity, repeatType: "reverse" }}
        style={{ display: "inline" }}
      >
        {cursor}
      </motion.span>
    </span>
  );
}
