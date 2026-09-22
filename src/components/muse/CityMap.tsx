"use client";

import { motion } from "motion/react";
import { BRAND } from "@/lib/brand";

// A city-level map of San Francisco (Esri dark gray canvas, © OpenStreetMap contributors)
// with soft glows for where people who could be a good fit tend to be. Glows sit on
// whole neighborhoods, never exact spots, and there is no "you are here" pin.

const TILE_SERVER = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas";
// Base map, then place names on top.
const LAYERS = ["World_Dark_Gray_Base", "World_Dark_Gray_Reference"];
const ZOOM = 12;
const TILES_X = [654, 655, 656];
const TILES_Y = [1582, 1583, 1584];
const SCALE = 0.72;
const TILE = 256 * SCALE;
const HEIGHT = 210;
// Frames the whole city at a comfortable distance (tile-block pixels, unscaled).
const FOCUS = { x: 292, y: 305 };

// Neighborhood centers in tile-block pixels (Mission, SoMa, Castro, Haight, ...).
const GLOWS: [number, number][] = [
  [305, 360], [332, 291], [246, 356], [208, 326], [115, 286], [86, 385], [252, 396], [240, 201], [319, 190],
  [302, 238], [246, 242], [304, 429], [348, 359], [380, 367], [261, 492], [249, 455], [156, 352], [42, 404],
  [197, 256], [278, 301], [374, 323], [307, 271], [328, 234], [156, 433], [211, 389], [71, 297], [203, 341],
];

export function CityMap({ city }: { city: string }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: HEIGHT }}>
      <div
        className="absolute"
        style={{
          left: `calc(50% - ${FOCUS.x * SCALE}px)`,
          top: HEIGHT / 2 - FOCUS.y * SCALE,
          width: TILE * TILES_X.length,
          height: TILE * TILES_Y.length,
        }}
      >
        {LAYERS.map((layer) =>
          TILES_Y.map((y, row) =>
            TILES_X.map((x, col) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${layer}-${x}-${y}`}
                src={`${TILE_SERVER}/${layer}/MapServer/tile/${ZOOM}/${y}/${x}`}
                alt=""
                draggable={false}
                className="absolute"
                style={{ left: col * TILE, top: row * TILE, width: TILE, height: TILE, opacity: layer === LAYERS[1] ? 0.6 : 1 }}
              />
            )),
          ),
        )}

        {GLOWS.map(([x, y], i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: x * SCALE - 9,
              top: y * SCALE - 9,
              width: 18,
              height: 18,
              background: `radial-gradient(closest-side, ${i % 3 === 0 ? BRAND.colors.violetTop : BRAND.colors.roseTop}, transparent)`,
            }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0.35, 0.9, 0.35], scale: [0.8, 1.15, 0.8] }}
            transition={{ duration: 3 + (i % 5) * 0.6, repeat: Infinity, delay: 0.4 + (i % 9) * 0.25, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Brand tint and a fade into the card */}
      <div className="pointer-events-none absolute inset-0 mix-blend-soft-light" style={{ background: `linear-gradient(135deg, ${BRAND.colors.rose}55, ${BRAND.colors.violet}55)` }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70px] bg-gradient-to-t from-[#15131C] to-transparent" />

      <span className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-[5px] text-[12px] font-semibold text-white/85 backdrop-blur-md">{city}</span>
      <span className="absolute bottom-1 right-3 text-[9px] text-white/35">Esri &middot; &copy; OpenStreetMap</span>
    </div>
  );
}
