export function FromMeta({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <div
      className="flex flex-col items-center leading-tight"
      style={{ color: tone === "light" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)" }}
    >
      <span className="text-[12px]">from</span>
      <span
        className="text-[15px] font-semibold tracking-[0.01em]"
        style={{ color: tone === "light" ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.85)" }}
      >
        Meta
      </span>
    </div>
  );
}
