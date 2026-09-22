/** Fades scrolling content out under the status bar, like iOS scroll edges. */
export function TopFade({ color }: { color: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[calc(var(--safe-top)+16px)]"
      style={{ background: `linear-gradient(${color} 55%, transparent)` }}
    />
  );
}
