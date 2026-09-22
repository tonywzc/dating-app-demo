export type StatusTone = "light" | "dark";

/** iOS status bar. `light` = white glyphs (for dark screens). */
export function StatusBar({ tone }: { tone: StatusTone }) {
  const color = tone === "light" ? "#fff" : "#000";
  return (
    <div
      className="sim-chrome pointer-events-none absolute inset-x-0 top-0 z-50 flex h-[54px] items-center justify-between pt-[5px] transition-colors duration-300"
      style={{ color }}
    >
      <div className="flex w-[150px] justify-center pl-[14px] text-[17px] font-semibold tracking-[-0.02em]">
        9:41
      </div>
      <div className="flex w-[150px] items-center justify-center gap-[7px] pr-[14px]">
        <Signal color={color} />
        <Wifi color={color} />
        <Battery color={color} />
      </div>
    </div>
  );
}

function Signal({ color }: { color: string }) {
  return (
    <svg width="19" height="12" viewBox="0 0 19 12" fill={color}>
      <rect x="0" y="7.5" width="3.2" height="4.5" rx="1" />
      <rect x="5" y="5" width="3.2" height="7" rx="1" />
      <rect x="10" y="2.5" width="3.2" height="9.5" rx="1" />
      <rect x="15" y="0" width="3.2" height="12" rx="1" />
    </svg>
  );
}

function Wifi({ color }: { color: string }) {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill={color}>
      <path d="M8.5 2.3c2.4 0 4.6.9 6.3 2.5.1.1.3.1.4 0l1.2-1.2c.1-.1.1-.3 0-.4C14.3 1.2 11.5 0 8.5 0S2.7 1.2.6 3.2c-.1.1-.1.3 0 .4l1.2 1.2c.1.1.3.1.4 0 1.7-1.6 3.9-2.5 6.3-2.5z" />
      <path d="M8.5 6c1.3 0 2.6.5 3.6 1.4.1.1.3.1.4 0l1.2-1.2c.1-.1.1-.3 0-.4-1.4-1.3-3.2-2-5.2-2s-3.8.7-5.2 2c-.1.1-.1.3 0 .4l1.2 1.2c.1.1.3.1.4 0C5.9 6.5 7.2 6 8.5 6z" />
      <path d="M11 9.1c.1-.1.1-.3 0-.4-.7-.6-1.6-.9-2.5-.9s-1.8.3-2.5.9c-.1.1-.1.3 0 .4l2.3 2.3c.1.1.3.1.4 0L11 9.1z" />
    </svg>
  );
}

function Battery({ color }: { color: string }) {
  return (
    <svg width="27" height="13" viewBox="0 0 27 13">
      <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke={color} strokeOpacity="0.4" />
      <rect x="2" y="2" width="20" height="9" rx="2.5" fill={color} />
      <path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill={color} fillOpacity="0.45" />
    </svg>
  );
}
