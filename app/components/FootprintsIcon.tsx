export default function FootprintsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      {/*
        Right foot — bottom-left quadrant.
        translate(1, 10) then rotate(-25): verified all content stays within 0-20 on both axes.
      */}
      <g transform="translate(1,10) rotate(-25)">
        {/* Foot pad: wide ball, tapers to rounded heel */}
        <path d="M3.5 1.5 C1.2 1.5 0 3.5 0 5.5 C0 8 0.8 10 2.2 10.8 C3 11.3 4.2 11.3 5 10.8 C6.4 10 7 8 7 5.5 C7 3.5 5.8 1.5 3.5 1.5 Z" />
        {/* Toes — graduated sizes, fanning out */}
        <ellipse cx="0.9"  cy="1.0"  rx="0.95" ry="1.2"  transform="rotate(15,0.9,1.0)"  />
        <ellipse cx="2.7"  cy="0.3"  rx="1.0"  ry="1.25" transform="rotate(5,2.7,0.3)"   />
        <ellipse cx="4.6"  cy="0.5"  rx="0.9"  ry="1.15" transform="rotate(-5,4.6,0.5)"  />
        <ellipse cx="6.1"  cy="1.3"  rx="0.75" ry="0.95" transform="rotate(-15,6.1,1.3)" />
        <ellipse cx="7.0"  cy="2.6"  rx="0.6"  ry="0.8"  transform="rotate(-25,7.0,2.6)" />
      </g>

      {/*
        Left foot — top-right quadrant.
        translate(9, 2.5) then rotate(-25): verified toes clear y=0 with ~0.2px margin.
      */}
      <g transform="translate(9,2.5) rotate(-25)">
        <path d="M3.5 1.5 C1.2 1.5 0 3.5 0 5.5 C0 8 0.8 10 2.2 10.8 C3 11.3 4.2 11.3 5 10.8 C6.4 10 7 8 7 5.5 C7 3.5 5.8 1.5 3.5 1.5 Z" />
        <ellipse cx="0.9"  cy="1.0"  rx="0.95" ry="1.2"  transform="rotate(15,0.9,1.0)"  />
        <ellipse cx="2.7"  cy="0.3"  rx="1.0"  ry="1.25" transform="rotate(5,2.7,0.3)"   />
        <ellipse cx="4.6"  cy="0.5"  rx="0.9"  ry="1.15" transform="rotate(-5,4.6,0.5)"  />
        <ellipse cx="6.1"  cy="1.3"  rx="0.75" ry="0.95" transform="rotate(-15,6.1,1.3)" />
        <ellipse cx="7.0"  cy="2.6"  rx="0.6"  ry="0.8"  transform="rotate(-25,7.0,2.6)" />
      </g>
    </svg>
  );
}
