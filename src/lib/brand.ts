// Brand constants and the geometry of the mark.
//
// The mark is a heart woven from two strands ("two people"). Each strand is a
// rounded bar that leans in from one side; they cross at the base, and the
// diamond where they overlap is drawn in its own color: the part of the story
// that belongs to both of them. The same geometry drives the SVG mark and the
// splash animation, so the photo stacks morph into exactly the final shapes.

export const BRAND = {
  name: "Twine",
  tagline: "Meet someone worth remembering.",
  colors: {
    roseTop: "#FF8AA2",
    rose: "#FF3F6E",
    violetTop: "#A98BFF",
    violet: "#6A4BFF",
    overlap: "#C94BD8",
    ink: "#0B0A10",
  },
} as const;

// Strand proportions: length relative to width, and softness of the tip.
const STRAND_LENGTH = 1.72;
const TIP_RADIUS = 0.16;

export type Strand = {
  /** Strand center, relative to the center of the mark's bounding box. */
  cx: number;
  cy: number;
  width: number;
  height: number;
  /** Degrees, clockwise (CSS/SVG convention), about the strand's center. */
  rotate: number;
  /** Corner radii before rotation: top-left, top-right, bottom-right, bottom-left. */
  radii: [number, number, number, number];
};

export type MarkGeometry = {
  width: number;
  height: number;
  left: Strand;
  right: Strand;
};

/** Geometry of the mark scaled so its bounding box is `width` wide. */
export function markGeometry(width: number): MarkGeometry {
  const s = Math.SQRT1_2;
  const unitW = 2 * s * (STRAND_LENGTH - 1) + 1;
  const unitH = s * STRAND_LENGTH + 0.5;
  const w = width / unitW;
  const h = STRAND_LENGTH * w;
  const tip = TIP_RADIUS * w;

  // Both strands pivot on the tip of the heart; offset by half the box height
  // so coordinates are relative to the box center.
  const cx = (s * (h - w)) / 2;
  const cy = (-s * (w + h)) / 2 + (unitH * w) / 2;

  return {
    width,
    height: unitH * w,
    left: { cx: -cx, cy, width: w, height: h, rotate: -45, radii: [w / 2, w / 2, 0, tip] },
    right: { cx, cy, width: w, height: h, rotate: 45, radii: [w / 2, w / 2, tip, 0] },
  };
}
