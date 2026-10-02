"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import type { Person, StoryChapter } from "@/lib/app-data";
import type { Media } from "@/lib/mock-data";
import { InstagramGlyph } from "@/components/ui/InstagramGlyph";
import { MediaTile } from "@/components/photos/MediaTile";
import { Photo } from "@/components/ui/Photo";
import { ImageIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { PhotoViewer, type ViewerState } from "@/components/ui/PhotoViewer";
import { usePress } from "@/lib/usePress";

/** `body` gets the chapter's number, which depends on which chapters this person has. */
type Chapter = { id: string; title: string; body: (n: number) => ReactNode };

export const SERIF = { fontFamily: '"New York", ui-serif, Georgia, "Times New Roman", serif' };

/**
 * One person, told like a short book: why we introduced you, then their story from
 * the roots up (where they're from, growing up, turning points, now), what they're
 * looking for, and the details. Swipe left and right, or tap the chapter marks.
 */
export function ProfileBook({
  person,
  variant,
  label,
  topRight,
  topLeft,
  bottomSpace,
  showMutuals = true,
  onScrolled,
}: {
  /** Whether the current page is scrolled past its top (to shrink overlays). */
  onScrolled?: (scrolled: boolean) => void;
  /** Show mutual friends and vouches (the person's own privacy setting). */
  showMutuals?: boolean;
  person: Person;
  /** `self` is your own profile, as others see it (no "why we introduced you"). */
  variant: "today" | "view" | "self";
  label: ReactNode;
  topLeft?: ReactNode;
  topRight?: ReactNode;
  /** CSS length kept clear at the bottom of each page (for action bars and the tab bar). */
  bottomSpace: string;
}) {
  const [viewer, setViewer] = useState<ViewerState>(null);
  const chapters = useMemo(
    () => buildChapters(person, variant, showMutuals, (photos, index) => setViewer({ photos, index })),
    [person, variant, showMutuals],
  );
  const [[index, dir], setPage] = useState<[number, number]>([0, 0]);
  const chapter = chapters[Math.min(index, chapters.length - 1)];

  // Tap the left or right edge of a page to turn it (like Stories). Edge taps win over photo taps.
  const tapStart = useRef<{ x: number; y: number; side: -1 | 1 } | null>(null);
  const edgeDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    tapStart.current = x <= 0.25 ? { x: e.clientX, y: e.clientY, side: -1 } : x >= 0.75 ? { x: e.clientX, y: e.clientY, side: 1 } : null;
    // Photos under an edge never start their own tap or long press. (The page's swipe still works.)
    if (tapStart.current) e.stopPropagation();
  };
  const edgeUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = tapStart.current;
    tapStart.current = null;
    if (!start || Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) return;
    e.stopPropagation();
    go(index + start.side);
  };

  const go = (next: number) => {
    if (next < 0 || next >= chapters.length || next === index) return;
    setPage([next, next > index ? 1 : -1]);
  };

  // Arrow keys turn pages on desktop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea")) return;
      if (e.key === "ArrowRight") setPage(([i]) => (i < chapters.length - 1 ? [i + 1, 1] : [i, 0]));
      if (e.key === "ArrowLeft") setPage(([i]) => (i > 0 ? [i - 1, -1] : [i, 0]));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chapters.length]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0A0810]" style={{ perspective: 1400 }}>
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={chapter.id}
          custom={dir}
          variants={PAGE}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 260, damping: 32 }}
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={{ left: index < chapters.length - 1 ? 0.7 : 0.15, right: index > 0 ? 0.7 : 0.15 }}
          onDragEnd={(_, info) => {
            const swipe = info.offset.x + info.velocity.x * 0.2;
            if (swipe < -70) go(index + 1);
            else if (swipe > 70) go(index - 1);
          }}
          className="absolute inset-0 origin-left bg-[#0A0810]"
          style={{ touchAction: "pan-y", boxShadow: "-24px 0 50px rgba(0,0,0,0.55)" }}
          onPointerDownCapture={edgeDown}
          onPointerUpCapture={edgeUp}
        >
          <div
            className="no-scrollbar h-full overflow-y-auto"
            style={{ paddingBottom: bottomSpace }}
            onScroll={onScrolled ? (e) => onScrolled(e.currentTarget.scrollTop > 60) : undefined}
          >
            {chapter.body(index)}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Header: label and chapter marks */}
      <div className="pt-safe pointer-events-none absolute inset-x-0 top-0 z-10">
        <div
          className="absolute inset-x-0 top-0 h-[130px]"
          style={{ background: chapter.id === "cover" ? "linear-gradient(rgba(0,0,0,0.5), transparent)" : "linear-gradient(#0A0810 60%, transparent)" }}
        />
        <div className="relative flex min-h-[44px] items-center gap-2 px-4">
          {topLeft && <div className="pointer-events-auto">{topLeft}</div>}
          <div className="flex min-w-0 flex-1 items-center gap-2">{label}</div>
          {topRight && <div className="pointer-events-auto">{topRight}</div>}
        </div>
        <div className="pointer-events-auto relative mt-2 flex gap-[5px] px-4">
          {chapters.map((c, i) => (
            <button key={c.id} type="button" aria-label={c.title} onClick={() => go(i)} className="flex h-[20px] flex-1 items-center">
              <span className="h-[3px] w-full overflow-hidden rounded-full bg-white/25">
                <motion.span className="block h-full rounded-full bg-white" initial={false} animate={{ width: i <= index ? "100%" : "0%" }} transition={{ duration: 0.3 }} />
              </span>
            </button>
          ))}
        </div>
      </div>
      <PhotoViewer state={viewer} onClose={() => setViewer(null)} />
    </div>
  );
}

const PAGE = {
  enter: (dir: number) => ({ x: dir >= 0 ? "100%" : "-28%", rotateY: dir >= 0 ? -8 : 0, opacity: dir >= 0 ? 1 : 0.4, zIndex: dir >= 0 ? 2 : 0 }),
  center: { x: 0, rotateY: 0, opacity: 1, zIndex: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? "-28%" : "100%", rotateY: dir >= 0 ? 0 : -8, opacity: dir >= 0 ? 0.4 : 1, zIndex: dir >= 0 ? 0 : 2 }),
};

// ---------- Chapters ----------

type View = (photos: string[], index: number) => void;

function buildChapters(p: Person, variant: "today" | "view" | "self", showMutuals: boolean, view: View): Chapter[] {
  const list: (Chapter | false)[] = [
    { id: "cover", title: variant === "self" ? "Cover" : "Why you two", body: () => <Cover p={p} variant={variant} showMutuals={showMutuals} view={view} /> },
    ...p.story.map((c) => ({
      id: c.id,
      title: c.title,
      body: (n: number) => <Story chapter={c} n={n} instagram={c.id === "now" ? p.instagram : []} view={view} />,
    })),
    Boolean(p.lookingFor) && { id: "looking", title: "Looking for", body: (n: number) => <Looking p={p} n={n} /> },
    { id: "details", title: "The details", body: (n: number) => <Details p={p} n={n} self={variant === "self"} /> },
  ];
  return list.filter(Boolean) as Chapter[];
}

/** A photo you can tap, or press and hold, to see full screen. */
function Viewable({ photos, index, view, className, children }: { photos: string[]; index: number; view: View; className?: string; children: ReactNode }) {
  const open = () => view(photos, index);
  const press = usePress(open, open);
  return (
    <div role="button" tabIndex={0} aria-label="View photo" className={`cursor-zoom-in select-none [-webkit-touch-callout:none] ${className ?? ""}`} onKeyDown={(e) => e.key === "Enter" && open()} {...press}>
      {children}
    </div>
  );
}

function ChapterHead({ n, title, headline }: { n: number; title: string; headline?: string }) {
  return (
    <div className="px-6 pt-[calc(var(--safe-top)+84px)]">
      <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#FF8AA2]">{title}</div>
      {headline && (
        <h2 className="mt-2 text-[32px] leading-[37px] tracking-[-0.01em]" style={SERIF}>
          {headline}
        </h2>
      )}
      <span className="sr-only">Chapter {n}</span>
    </div>
  );
}

function Chip({ children, tint = false }: { children: ReactNode; tint?: boolean }) {
  return (
    <span
      className="rounded-full px-[14px] py-[8px] text-[15px] text-white/90"
      style={{ background: tint ? `linear-gradient(135deg, ${BRAND.colors.rose}38, ${BRAND.colors.violet}38)` : "rgba(255,255,255,0.08)" }}
    >
      {children}
    </span>
  );
}

function Cover({ p, variant, showMutuals, view }: { p: Person; variant: "today" | "view" | "self"; showMutuals: boolean; view: View }) {
  return (
    <div>
      <Viewable photos={p.photos} index={0} view={view} className="relative block h-[470px] w-full">
        <Photo src={p.photo} alt={p.name} initial={p.name[0]} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0A0810]" />
        {p.photos.length > 1 && (
          <span className="absolute right-4 top-[calc(var(--safe-top)+84px)] flex h-[32px] items-center gap-[6px] rounded-full bg-black/45 px-3 text-[14px] font-semibold backdrop-blur-md">
            <ImageIcon size={15} /> {p.photos.length}
          </span>
        )}
        <div className="absolute inset-x-6 bottom-4">
          <div className="flex items-center gap-2">
            <h1 className="text-[44px] font-semibold leading-[46px] tracking-[-0.02em]" style={SERIF}>
              {p.name}
            </h1>
            <span className="mt-2 text-[28px] font-light text-white/85">{p.age}</span>
            {p.verified && <ShieldCheckIcon size={20} className="mt-2" />}
          </div>
          <div className="mt-1 text-[15px] text-white/75">{p.neighborhood}</div>
          {showMutuals && p.mutuals && (
            <div className="mt-3 flex items-center gap-2">
              <span className="flex -space-x-2">
                {p.mutuals.avatars.slice(0, 3).map((a) => (
                  <Photo key={a} src={a} className="h-[26px] w-[26px] rounded-full ring-2 ring-black/60" />
                ))}
              </span>
              <span className="text-[14px] font-semibold">
                {p.mutuals.count} mutual {p.mutuals.count === 1 ? "friend" : "friends"}
                {p.mutuals.vouch && <span className="font-normal text-white/75"> &middot; {p.mutuals.vouch.from} vouched</span>}
              </span>
            </div>
          )}
        </div>
      </Viewable>

      <div className="space-y-3 px-5">
        <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.05] p-5">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/50">{variant === "self" ? "In short" : "Why we introduced you"}</div>
          <p className="mt-3 text-[18px] leading-[26px] text-white/92" style={SERIF}>
            {variant === "self" ? p.essence : p.why}
          </p>
          {variant !== "self" && (
            <div className="mt-4 flex flex-wrap gap-2">
              {p.overlaps.map((o) => (
                <Chip key={o} tint>
                  {o}
                </Chip>
              ))}
            </div>
          )}
        </div>
        {showMutuals && p.mutuals && <Mutuals m={p.mutuals} />}
        <div className="flex items-center justify-center gap-2 pt-2 text-[14px] font-medium text-white/45">
          {p.name}&apos;s story
          <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
            &rarr;
          </motion.span>
        </div>
      </div>
    </div>
  );
}

/** "3 mutual friends, and Priya vouched for her." */
function Mutuals({ m }: { m: NonNullable<Person["mutuals"]> }) {
  return (
    <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.05] p-5">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-3">
          {m.avatars.map((a) => (
            <Photo key={a} src={a} className="h-[36px] w-[36px] rounded-full ring-[3px] ring-[#16131D]" />
          ))}
        </div>
        <span className="text-[16px] font-semibold">
          {m.count} mutual {m.count === 1 ? "friend" : "friends"}
        </span>
      </div>
      {m.vouch && (
        <div className="mt-4 border-t border-white/[0.08] pt-4">
          <p className="text-[17px] leading-[25px] text-white/90" style={SERIF}>
            &ldquo;{m.vouch.text}&rdquo;
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Photo src={m.vouch.avatar} className="h-[28px] w-[28px] rounded-full" />
            <span className="text-[14px] font-semibold">{m.vouch.from} vouched</span>
            <span className="text-[13px] text-white/45">&middot; {m.vouch.how}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Story({ chapter, n, instagram, view }: { chapter: StoryChapter; n: number; instagram: Media[]; view: View }) {
  const igPhotos = instagram.map((m) => m.src);
  return (
    <div>
      <ChapterHead n={n} title={chapter.title} headline={chapter.headline} />
      {chapter.photo && (
        <Viewable photos={[chapter.photo, ...igPhotos]} index={0} view={view} className="mx-5 mt-6 block overflow-hidden rounded-[24px]">
          <Photo src={chapter.photo} className="aspect-[4/3] w-full" />
        </Viewable>
      )}
      {chapter.text && (
        <p className="mt-5 px-6 text-[19px] leading-[29px] text-white/88" style={SERIF}>
          {chapter.text}
        </p>
      )}
      {instagram.length > 0 && (
        <>
          <div className="mt-7 flex items-center gap-2 px-6 text-[13px] font-semibold uppercase tracking-[0.07em] text-white/50">
            <InstagramGlyph size={15} /> From Instagram
          </div>
          <div className="mt-3 grid grid-cols-3 gap-[6px] px-5">
            {instagram.map((m, i) => (
              <Viewable key={m.id} photos={igPhotos} index={i} view={view} className="relative block aspect-[9/16] overflow-hidden rounded-[14px]">
                <MediaTile media={m} className="h-full w-full" showSource={false} showCaption />
              </Viewable>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Looking({ p, n }: { p: Person; n: number }) {
  return (
    <div>
      <ChapterHead n={n} title="Looking for" headline={p.lookingFor} />
      {p.hopingToMeet.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2 px-6">
          {p.hopingToMeet.map((h) => (
            <Chip key={h} tint>
              {h}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}

function Details({ p, n, self }: { p: Person; n: number; self: boolean }) {
  const rows = [...p.facts, ...p.lifestyle];
  return (
    <div>
      <ChapterHead n={n} title="The details" />
      {rows.length > 0 && (
        <div className="mx-5 mt-5 overflow-hidden rounded-[22px] border border-white/[0.07] bg-white/[0.04]">
          {rows.map((f) => (
            <div key={f.label} className="flex min-h-[52px] items-center justify-between gap-4 border-b border-white/[0.07] px-4 last:border-b-0">
              <span className="text-[15px] text-white/50">{f.label}</span>
              <span className="text-right text-[16px]">{f.value}</span>
            </div>
          ))}
        </div>
      )}
      {p.askAbout.length > 0 && (
        <div className="mt-7 px-6">
          <div className="text-[13px] font-semibold uppercase tracking-[0.07em] text-white/50">{self ? "Ask me about" : `Ask ${p.name} about`}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {p.askAbout.map((a) => (
              <Chip key={a} tint>
                {a}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
