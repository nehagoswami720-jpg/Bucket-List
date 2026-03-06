export default function PushpinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/*
        Map-pin / teardrop shape — visual centre sits at ~y=7 which is
        close to the SVG geometric centre (y=8), so it aligns cleanly
        with adjacent text in a flex row.
      */}
      <path d="M8 0.5 C11.5 0.5 14 3 14 6 C14 9.5 11 12 9 13 L8 15.5 L7 13 C5 12 2 9.5 2 6 C2 3 4.5 0.5 8 0.5 Z" />
      {/* Shine highlight */}
      <ellipse
        cx="5.8" cy="3.8"
        rx="1.4" ry="0.9"
        transform="rotate(-35,5.8,3.8)"
        fill="rgba(255,255,255,0.28)"
      />
    </svg>
  );
}
