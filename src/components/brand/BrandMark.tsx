import { useId } from "react";
import { BRAND, markGeometry, type Strand } from "@/lib/brand";

type Props = {
  width: number;
  /** "color" for dark/neutral backgrounds, "white" for use on the brand gradient. */
  tone?: "color" | "white";
  className?: string;
};

function strandPath(strand: Strand, box: { width: number; height: number }) {
  const { width: w, height: h } = strand;
  const [tl, tr, br, bl] = strand.radii;
  const cx = box.width / 2 + strand.cx;
  const cy = box.height / 2 + strand.cy;
  const x = cx - w / 2;
  const y = cy - h / 2;
  const d = [
    `M ${x + tl} ${y}`,
    `H ${x + w - tr}`,
    `A ${tr} ${tr} 0 0 1 ${x + w} ${y + tr}`,
    `V ${y + h - br}`,
    `A ${br} ${br} 0 0 1 ${x + w - br} ${y + h}`,
    `H ${x + bl}`,
    `A ${bl} ${bl} 0 0 1 ${x} ${y + h - bl}`,
    `V ${y + tl}`,
    `A ${tl} ${tl} 0 0 1 ${x + tl} ${y}`,
    "Z",
  ].join(" ");
  return { d, transform: `rotate(${strand.rotate} ${cx} ${cy})` };
}

export function BrandMark({ width, tone = "color", className }: Props) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const g = markGeometry(width);
  const left = strandPath(g.left, g);
  const right = strandPath(g.right, g);
  const { colors } = BRAND;

  const leftFill = tone === "white" ? "rgba(255,255,255,0.94)" : `url(#${id}l)`;
  const rightFill = tone === "white" ? "rgba(255,255,255,0.7)" : `url(#${id}r)`;
  const overlapFill = tone === "white" ? "#FFFFFF" : colors.overlap;

  return (
    <svg
      width={g.width}
      height={g.height}
      viewBox={`0 0 ${g.width} ${g.height}`}
      className={className}
      aria-label={BRAND.name}
      role="img"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor={colors.roseTop} />
          <stop offset="1" stopColor={colors.rose} />
        </linearGradient>
        <linearGradient id={`${id}r`} x1="1" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor={colors.violetTop} />
          <stop offset="1" stopColor={colors.violet} />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <path {...left} />
        </clipPath>
      </defs>
      <path {...left} fill={leftFill} />
      <path {...right} fill={rightFill} />
      {/* The clip lives on a group so the strand's own rotation doesn't rotate the clip. */}
      <g clipPath={`url(#${id}c)`}>
        <path {...right} fill={overlapFill} />
      </g>
    </svg>
  );
}
