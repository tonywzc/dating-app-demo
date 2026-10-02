// Small line icons used across the main app (SF Symbols-like, 24pt grid).

type IconProps = { size?: number; className?: string; strokeWidth?: number };

const line = (size: number, strokeWidth: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
});

export function ChevronLeft({ size = 22, className, strokeWidth = 2.4 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth, className)}>
      <path d="M15 4l-8 8 8 8" />
    </svg>
  );
}

export function ChevronRight({ size = 14, className, strokeWidth = 2.4 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth, className)}>
      <path d="M9 4l8 8-8 8" />
    </svg>
  );
}

export function CloseIcon({ size = 14, className, strokeWidth = 2.4 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth, className)}>
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

export function PlusIcon({ size = 20, className, strokeWidth = 2.4 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth, className)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CheckIcon({ size = 14, className, strokeWidth = 2.8 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth, className)}>
      <path d="M4.5 12.5l5 5 10-11" />
    </svg>
  );
}

export function CameraIcon({ size = 22, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth, className)}>
      <path d="M3 8.5A2.5 2.5 0 015.5 6h1.7l1.3-2h7l1.3 2h1.7A2.5 2.5 0 0121 8.5v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 17.5z" />
      <circle cx="12" cy="13" r="3.8" />
    </svg>
  );
}

export function ImageIcon({ size = 22, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth, className)}>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="M21 15.5l-5-5L5.5 20" />
    </svg>
  );
}

export function SendIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3.5c.4 0 .8.2 1.1.5l6 6a1.5 1.5 0 01-2.2 2.1l-3.4-3.4V19a1.5 1.5 0 01-3 0V8.7L7.1 12.1A1.5 1.5 0 014.9 10l6-6c.3-.3.7-.5 1.1-.5z" />
    </svg>
  );
}

export function GearIcon({ size = 22, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth, className)}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
    </svg>
  );
}

export function CalendarIcon({ size = 20, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth, className)}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function PinIcon({ size = 16, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth, className)}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function MicIcon({ size = 20, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth, className)}>
      <rect x="8.5" y="2.5" width="7" height="12" rx="3.5" />
      <path d="M5 11a7 7 0 0014 0M12 18v3.5" />
    </svg>
  );
}

export function SparkleIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5c.4 0 .7.3.8.7l1 4.4a4 4 0 003 3l4.4 1c.4.1.7.4.7.8s-.3.7-.7.8l-4.4 1a4 4 0 00-3 3l-1 4.4c-.1.4-.4.7-.8.7s-.7-.3-.8-.7l-1-4.4a4 4 0 00-3-3l-4.4-1c-.4-.1-.7-.4-.7-.8s.3-.7.7-.8l4.4-1a4 4 0 003-3l1-4.4c.1-.4.4-.7.8-.7z" />
    </svg>
  );
}

export function ChatBubbleIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.6 1.4 4.9 3.6 6.5-.2 1.4-.9 2.6-1.9 3.4 2.2 0 4-.8 5.3-1.8.9.2 2 .4 3 .4 5.5 0 10-3.8 10-8.5S17.5 3 12 3z" />
    </svg>
  );
}

export function ShieldCheckIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path fill="#3B82F6" d="M12 2l2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 22l-2.4-1.8-3 .2-.9-2.9-2.5-1.7 1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2z" />
      <path d="M8 12.2l2.7 2.6L16 9.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LocateIcon({ size = 20, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth, className)}>
      <path d="M3 11l18-8-8 18-2-8z" />
    </svg>
  );
}

export function BookIcon({ size = 18, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth, className)}>
      <path d="M12 6.5C10.5 5 8 4.5 4 4.5v14c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-14c-4 0-6.5.5-8 2zM12 6.5v14" />
    </svg>
  );
}

// ---------- Tab bar ----------

export function TodayTabIcon({ active, size = 26 }: { active: boolean; size?: number }) {
  // A single card with Muse's spark: one person, chosen for you.
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <rect x="5" y="3.5" width="18" height="21" rx="4.5" fill={active ? "currentColor" : "none"} />
      <path
        d="M14 9.2c.3 0 .5.2.6.5l.5 2.1c.2.7.7 1.2 1.4 1.4l2.1.5c.3.1.5.3.5.6s-.2.5-.5.6l-2.1.5c-.7.2-1.2.7-1.4 1.4l-.5 2.1c-.1.3-.3.5-.6.5s-.5-.2-.6-.5l-.5-2.1c-.2-.7-.7-1.2-1.4-1.4l-2.1-.5c-.3-.1-.5-.3-.5-.6s.2-.5.5-.6l2.1-.5c.7-.2 1.2-.7 1.4-1.4l.5-2.1c.1-.3.3-.5.6-.5z"
        fill={active ? "#0B0A10" : "currentColor"}
        stroke="none"
      />
    </svg>
  );
}

export function NearbyTabIcon({ active, size = 26 }: { active: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M14 24.5s-7.5-6.4-7.5-12.2a7.5 7.5 0 0115 0c0 5.8-7.5 12.2-7.5 12.2z" fill={active ? "currentColor" : "none"} />
      <circle cx="14" cy="12.2" r="2.8" fill={active ? "#0B0A10" : "none"} stroke={active ? "none" : "currentColor"} />
    </svg>
  );
}

export function ChatsTabIcon({ active, size = 26 }: { active: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path
        d="M14 4.5c-5.8 0-10.5 3.9-10.5 8.8 0 2.7 1.4 5.1 3.7 6.7-.2 1.5-1 2.8-2 3.6 2.3 0 4.2-.8 5.5-1.9 1 .3 2.1.4 3.3.4 5.8 0 10.5-3.9 10.5-8.8S19.8 4.5 14 4.5z"
        fill={active ? "currentColor" : "none"}
      />
    </svg>
  );
}

export function YouTabIcon({ active, size = 26 }: { active: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="14" cy="9.5" r="4.8" fill={active ? "currentColor" : "none"} />
      <path d="M4.8 24c.8-4.6 4.6-7.6 9.2-7.6s8.4 3 9.2 7.6" fill={active ? "currentColor" : "none"} strokeLinejoin="round" />
    </svg>
  );
}
