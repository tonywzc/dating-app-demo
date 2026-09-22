import { BRAND } from "@/lib/brand";
import { BrandMark } from "./BrandMark";

/** The home-screen app icon: the mark on an ink squircle. */
export function AppIcon({ size }: { size: number }) {
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.2237,
        background: `radial-gradient(120% 90% at 50% 0%, #2A2140 0%, ${BRAND.colors.ink} 70%)`,
        boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.14)",
      }}
    >
      <BrandMark width={size * 0.64} />
    </div>
  );
}
