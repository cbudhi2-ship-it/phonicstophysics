/**
 * "The Journey" mark — a coral dot climbing a dotted teal path past
 * milestones to a gold star. Rendered inline as SVG so it stays crisp
 * and can be themed / animated.
 */
export function JourneyMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      role="img"
      aria-label="Phonics to Physics journey mark"
    >
      <path
        d="M40,124 C60,120 74,100 84,84 S110,52 122,42"
        fill="none"
        stroke="#2E9C8E"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray="0.1 15"
      />
      <circle cx="80" cy="90" r="5.5" fill="#2E9C8E" />
      <circle cx="103" cy="63" r="5.5" fill="#2E9C8E" />
      <circle cx="40" cy="124" r="9" fill="#F08A3E" />
      <g transform="translate(124,40)" fill="#F4B740">
        <path d="M0,-17 L5.2,-5.2 L17,-3.4 L8,5 L10,17 L0,11.2 L-10,17 L-8,5 L-17,-3.4 L-5.2,-5.2 Z" />
      </g>
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white">
        <JourneyMark size={30} />
      </span>
      <span className="leading-[1.05]">
        <b className="block font-serif text-[18px] font-bold">
          Phonics <span className="text-teal">to</span> Physics
        </b>
        <small className="block font-sans text-[9px] tracking-[2px] text-muted">
          SMALL STEPS, BIG RESULTS
        </small>
      </span>
    </span>
  );
}
