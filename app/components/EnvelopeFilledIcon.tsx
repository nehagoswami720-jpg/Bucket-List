export default function EnvelopeFilledIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.8)}
      viewBox="0 0 20 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Filled body */}
      <path
        d="M0.8 3 Q0.8 1 2.5 1 L17.5 1 Q19.2 1 19.2 3 L19.2 13.5 Q19.2 15 17.5 15 L2.5 15 Q0.8 15 0.8 13.5 Z"
        fill="currentColor"
      />
      {/* Flap triangle — subtle white highlight for depth */}
      <path
        d="M0.8 3 L10 9.2 L19.2 3 Z"
        fill="rgba(255,255,255,0.18)"
      />
      {/* Flap crease line */}
      <path
        d="M0.8 3 Q5.5 7.2 10 9.2 Q14.5 7.2 19.2 3"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
