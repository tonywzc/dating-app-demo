"use client";

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { BRAND } from "@/lib/brand";
import { MY_AREA, type NearbyEvent, type Person } from "@/lib/app-data";
import { Photo } from "@/components/ui/Photo";
import { CalendarIcon, ChatBubbleIcon } from "@/components/ui/icons";
import { BrandMark } from "@/components/brand/BrandMark";
import { HeartIcon } from "@/components/photos/StoryScan";

// San Francisco at zoom 13 (Esri dark gray canvas, © OpenStreetMap contributors). Positions in
// app-data are pixels on this 6 × 5 tile grid.
const TILE_SERVER = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas";
const LAYERS = ["World_Dark_Gray_Base", "World_Dark_Gray_Reference"];
const ZOOM = 13;
const TILE = 256;
const TILES_X = [1307, 1308, 1309, 1310, 1311, 1312];
const TILES_Y = [3164, 3165, 3166, 3167, 3168];
export const MAP_W = TILE * TILES_X.length;
export const MAP_H = TILE * TILES_Y.length;

const LONG_PRESS_MS = 420;
const MOVE_SLOP = 8;

export type MapFilter = "all" | "interested" | "active" | "twine" | "blind";

export type Point = { x: number; y: number };

function visiblePerson(p: Person, filter: MapFilter) {
  if (filter === "twine" || filter === "blind") return false;
  if (filter === "interested") return p.nearby?.status === "interested" || p.nearby?.status === "chat";
  if (filter === "active") return Boolean(p.nearby?.activeNow) || p.nearby?.status === "chat";
  return true;
}

function visibleEvent(e: NearbyEvent, filter: MapFilter) {
  if (filter === "twine") return e.kind === "event" && !e.hosting;
  if (filter === "blind") return e.kind === "blind";
  return filter === "all";
}

/** Tap, or press and hold, without fighting the map's drag. */
function usePress(onTap: () => void, onHold?: () => void) {
  const state = useRef<{ x: number; y: number; timer?: ReturnType<typeof setTimeout>; held: boolean; moved: boolean } | null>(null);
  const clear = () => {
    if (state.current?.timer) clearTimeout(state.current.timer);
  };
  return {
    onPointerDown: (e: ReactPointerEvent) => {
      clear();
      state.current = { x: e.clientX, y: e.clientY, held: false, moved: false };
      if (onHold)
        state.current.timer = setTimeout(() => {
          if (state.current && !state.current.moved) {
            state.current.held = true;
            onHold();
          }
        }, LONG_PRESS_MS);
    },
    onPointerMove: (e: ReactPointerEvent) => {
      const s = state.current;
      if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > MOVE_SLOP) {
        s.moved = true;
        clear();
      }
    },
    onPointerUp: () => {
      const s = state.current;
      clear();
      if (s && !s.moved && !s.held) onTap();
      state.current = null;
    },
    onPointerCancel: () => {
      clear();
      state.current = null;
    },
    onPointerLeave: () => {
      if (state.current) state.current.moved = true;
      clear();
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };
}

/** A pannable city map with the people and plans near you. */
export function NearbyMap({
  people,
  events,
  filter,
  focus,
  interactive = true,
  onTapPerson,
  onHoldPerson,
  onTapEvent,
}: {
  people: Person[];
  events: NearbyEvent[];
  filter: MapFilter;
  /** Pan to this point when it changes. */
  focus?: Point & { nonce: number };
  interactive?: boolean;
  onTapPerson?: (p: Person) => void;
  onHoldPerson?: (p: Person) => void;
  onTapEvent?: (e: NearbyEvent) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ w: 402, h: 874 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setView({ w, h });
      // Start over your own neighborhood, a little above center so the bottom cards don't cover it.
      if (x.get() === 0 && y.get() === 0) {
        x.set(Math.min(0, Math.max(w - MAP_W, w / 2 - MY_AREA.x)));
        y.set(Math.min(0, Math.max(h - MAP_H, h * 0.42 - MY_AREA.y)));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [x, y]);

  const nonce = focus?.nonce;
  useEffect(() => {
    if (!focus) return;
    const spring = { type: "spring", stiffness: 160, damping: 26 } as const;
    animate(x, Math.min(0, Math.max(view.w - MAP_W, view.w / 2 - focus.x)), spring);
    animate(y, Math.min(0, Math.max(view.h - MAP_H, view.h * 0.42 - focus.y)), spring);
    // Only when a new focus is requested.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden bg-[#1B1B1F]">
      <motion.div
        className={`absolute left-0 top-0 ${interactive ? "cursor-grab active:cursor-grabbing" : ""}`}
        style={{ x, y, width: MAP_W, height: MAP_H, touchAction: "none" }}
        drag={interactive}
        dragConstraints={{ left: view.w - MAP_W, right: 0, top: view.h - MAP_H, bottom: 0 }}
        dragElastic={0.08}
        dragTransition={{ power: 0.25, timeConstant: 220 }}
      >
        {LAYERS.map((layer) =>
          TILES_Y.map((ty, row) =>
            TILES_X.map((tx, col) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${layer}-${tx}-${ty}`}
                src={`${TILE_SERVER}/${layer}/MapServer/tile/${ZOOM}/${ty}/${tx}`}
                alt=""
                draggable={false}
                className="pointer-events-none absolute select-none"
                style={{ left: col * TILE, top: row * TILE, width: TILE, height: TILE, opacity: layer === LAYERS[1] ? 0.7 : 1 }}
              />
            )),
          ),
        )}
        {/* Brand tint */}
        <div className="pointer-events-none absolute inset-0 mix-blend-soft-light" style={{ background: `linear-gradient(135deg, ${BRAND.colors.rose}55, ${BRAND.colors.violet}55)` }} />

        {/* Your area: a soft circle, never a pin */}
        <div className="pointer-events-none absolute" style={{ left: MY_AREA.x - 70, top: MY_AREA.y - 70, width: 140, height: 140 }}>
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(closest-side, rgba(10,132,255,0.32), rgba(10,132,255,0.08) 70%, transparent)" }}
            animate={{ scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="absolute left-1/2 top-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[#0A84FF] shadow-[0_0_12px_rgba(10,132,255,0.8)]" />
        </div>

        {events.map((e) => (
          <EventPin key={e.id} event={e} hidden={!visibleEvent(e, filter)} onTap={() => onTapEvent?.(e)} />
        ))}
        {people.map((p) => (
          <PersonPin key={p.id} person={p} hidden={!visiblePerson(p, filter)} onTap={() => onTapPerson?.(p)} onHold={() => onHoldPerson?.(p)} />
        ))}
      </motion.div>
      <span className="pointer-events-none absolute bottom-[2px] right-3 z-[1] text-[9px] text-white/35">Esri &middot; &copy; OpenStreetMap</span>
    </div>
  );
}

const RING = `conic-gradient(from 200deg, ${BRAND.colors.roseTop}, ${BRAND.colors.rose}, ${BRAND.colors.overlap}, ${BRAND.colors.violet}, ${BRAND.colors.roseTop})`;

function PersonPin({ person, hidden, onTap, onHold }: { person: Person; hidden: boolean; onTap: () => void; onHold: () => void }) {
  const press = usePress(onTap, onHold);
  const { x, y, status, activeNow } = person.nearby!;
  const size = 52;
  return (
    <motion.div
      className="absolute select-none [-webkit-touch-callout:none]"
      style={{ left: x - size / 2, top: y - size / 2, width: size, height: size, pointerEvents: hidden ? "none" : "auto" }}
      initial={false}
      animate={{ opacity: hidden ? 0 : 1, scale: hidden ? 0.5 : 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      <motion.button
        type="button"
        aria-label={`${person.name}, ${person.age}`}
        whileTap={{ scale: 1.12 }}
        className="relative block h-full w-full cursor-pointer rounded-full"
        {...press}
      >
        {status === "interested" && (
          <motion.span
            className="absolute -inset-[5px] rounded-full"
            style={{ background: RING }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
        )}
        {status === "chat" && (
          <motion.span
            className="absolute -inset-[4px] rounded-full border-[3px] border-[#34C759]"
            animate={{ boxShadow: ["0 0 0 0 rgba(52,199,89,0.55)", "0 0 0 10px rgba(52,199,89,0)"] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        )}
        <span className={`absolute inset-0 overflow-hidden rounded-full border-[2.5px] ${status === "none" ? "border-white/85" : "border-[#0B0A10]"} shadow-[0_6px_16px_rgba(0,0,0,0.5)]`}>
          <Photo src={person.avatar} alt={person.name} initial={person.name[0]} className="pointer-events-none h-full w-full" />
        </span>
        {status === "interested" && (
          <span className="absolute -right-[6px] -top-[6px] flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#FF3F6E] ring-2 ring-[#0B0A10]">
            <HeartIcon size={11} color="#fff" />
          </span>
        )}
        {status === "chat" && (
          <span className="absolute -right-[6px] -top-[6px] flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#34C759] text-white ring-2 ring-[#0B0A10]">
            <ChatBubbleIcon size={11} />
          </span>
        )}
        {activeNow && status !== "chat" && (
          <span className="absolute -bottom-[2px] -right-[2px] h-[14px] w-[14px] rounded-full border-2 border-[#0B0A10] bg-[#34C759]" />
        )}
      </motion.button>
      <span className="pointer-events-none absolute left-1/2 top-[calc(100%+4px)] -translate-x-1/2 whitespace-nowrap rounded-full bg-black/55 px-[7px] py-[1px] text-[11px] font-semibold text-white backdrop-blur">
        {person.name}
      </span>
    </motion.div>
  );
}

function EventPin({ event, hidden, onTap }: { event: NearbyEvent; hidden: boolean; onTap: () => void }) {
  const press = usePress(onTap);
  const blind = event.kind === "blind";
  return (
    <motion.div
      className="absolute select-none"
      style={{ left: event.x - 22, top: event.y - 22, pointerEvents: hidden ? "none" : "auto" }}
      initial={false}
      animate={{ opacity: hidden ? 0 : 1, scale: hidden ? 0.5 : 1 }}
    >
      <motion.button type="button" aria-label={event.title} whileTap={{ scale: 1.1 }} className="relative block cursor-pointer" {...press}>
        <span
          className="flex h-[44px] w-[44px] items-center justify-center rounded-[14px] border-2 border-white/90 shadow-[0_6px_16px_rgba(0,0,0,0.5)]"
          style={{ background: blind ? `linear-gradient(140deg, ${BRAND.colors.violetTop}, ${BRAND.colors.violet})` : `linear-gradient(140deg, ${BRAND.colors.roseTop}, ${BRAND.colors.rose})` }}
        >
          {blind ? <MaskGlyph /> : event.hosting ? <CalendarIcon size={20} className="text-white" /> : <BrandMark width={22} tone="white" />}
        </span>
        <span className="absolute left-1/2 top-[calc(100%+4px)] -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-[7px] py-[1px] text-[11px] font-semibold text-white backdrop-blur">
          {event.title}
        </span>
      </motion.button>
    </motion.div>
  );
}

/** A masquerade mask, for blind dates. */
export function MaskGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
      <path d="M2.5 8.5c0-1 .8-1.6 1.7-1.3 2.2.7 4.5 1 7.8 1s5.6-.3 7.8-1c.9-.3 1.7.3 1.7 1.3 0 4.2-2.3 7.5-5.4 7.5-1.8 0-2.8-1-3.4-2.2-.2-.4-.5-.6-.7-.6s-.5.2-.7.6c-.6 1.2-1.6 2.2-3.4 2.2-3.1 0-5.4-3.3-5.4-7.5zm4.3 1.3c-.9 0-1.6.6-1.6 1.3s.9 1.4 2 1.4 1.8-.6 1.8-1.2c0-.8-1.2-1.5-2.2-1.5zm10.4 0c-1 0-2.2.7-2.2 1.5 0 .6.7 1.2 1.8 1.2s2-.7 2-1.4-.7-1.3-1.6-1.3z" />
    </svg>
  );
}
