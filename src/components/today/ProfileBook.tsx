"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import type { Person, StoryChapter } from "@/lib/app-data";
import { MediaTile } from "@/components/photos/MediaTile";
import { Photo } from "@/components/ui/Photo";
import { ShieldCheckIcon } from "@/components/ui/icons";

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
}: {
  person: Person;
  /** `self` is your own profile, as others see it (no "why we introduced you"). */
  variant: "today" | "view" | "self";
  label: ReactNode;
  topLeft?: ReactNode;
  topRight?: ReactNode;
  /** CSS length kept clear at the bottom of each page (for action bars and the tab bar). */
  bottomSpace: string;
}) {
  const chapters = useMemo(() => buildChapters(person, variant), [person, variant]);
  const [[index, dir], setPage] = useState<[number, number]>([0, 0]);
  const chapter = chapters[Math.min(index, chapters.length - 1)];

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
        >
          <div className="no-scrollbar h-full overflow-y-auto" style={{ paddingBottom: bottomSpace }}>
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
    </div>
  );
}

const PAGE = {
  enter: (dir: number) => ({ x: dir >= 0 ? "100%" : "-28%", rotateY: dir >= 0 ? -8 : 0, opacity: dir >= 0 ? 1 : 0.4, zIndex: dir >= 0 ? 2 : 0 }),
  center: { x: 0, rotateY: 0, opacity: 1, zIndex: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? "-28%" : "100%", rotateY: dir >= 0 ? 0 : -8, opacity: dir >= 0 ? 0.4 : 1, zIndex: dir >= 0 ? 0 : 2 }),
};

// ---------- Chapters ----------

function buildChapters(p: Person, variant: "today" | "view" | "self"): Chapter[] {
  const list: (Chapter | false)[] = [
    { id: "cover", title: variant === "self" ? "Cover" : "Why you two", body: () => <Cover p={p} variant={variant} /> },
    ...p.story.map((c) => ({ id: c.id, title: c.title, body: (n: number) => <Story chapter={c} n={n} /> })),
    Boolean(p.lookingFor) && { id: "looking", title: "Looking for", body: (n: number) => <Looking p={p} n={n} /> },
    p.facts.length + p.lifestyle.length > 1 && { id: "details", title: "The details", body: (n: number) => <Details p={p} n={n} /> },
  ];
  return list.filter(Boolean) as Chapter[];
}

function ChapterHead({ n, title, headline }: { n: number; title: string; headline?: string }) {
  return (
    <div className="px-6 pt-[calc(var(--safe-top)+84px)]">
      <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#FF8AA2]">
        {n}. {title}
      </div>
      {headline && (
        <h2 className="mt-2 text-[32px] leading-[37px] tracking-[-0.01em]" style={SERIF}>
          {headline}
        </h2>
      )}
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

function Cover({ p, variant }: { p: Person; variant: "today" | "view" | "self" }) {
  return (
    <div>
      <div className="relative h-[470px] w-full">
        <Photo src={p.photo} alt={p.name} initial={p.name[0]} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0A0810]" />
        <div className="absolute inset-x-6 bottom-4">
          <div className="flex items-center gap-2">
            <h1 className="text-[44px] font-semibold leading-[46px] tracking-[-0.02em]" style={SERIF}>
              {p.name}
            </h1>
            <span className="mt-2 text-[28px] font-light text-white/85">{p.age}</span>
            {p.verified && <ShieldCheckIcon size={20} className="mt-2" />}
          </div>
          <div className="mt-1 text-[15px] text-white/75">{p.neighborhood}</div>
        </div>
      </div>

      <div className="px-5">
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
        <div className="mt-5 flex items-center justify-center gap-2 text-[14px] font-medium text-white/45">
          {p.name}&apos;s story
          <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
            &rarr;
          </motion.span>
        </div>
      </div>
    </div>
  );
}

function Story({ chapter, n }: { chapter: StoryChapter; n: number }) {
  return (
    <div>
      <ChapterHead n={n} title={chapter.title} headline={chapter.headline} />
      {chapter.photo && (
        <div className="mx-5 mt-6 overflow-hidden rounded-[24px]">
          <Photo src={chapter.photo} className="aspect-[4/3] w-full" />
        </div>
      )}
      {chapter.text && (
        <p className="mt-6 px-6 text-[19px] leading-[29px] text-white/88" style={SERIF}>
          {chapter.text}
        </p>
      )}
      {chapter.moments && chapter.moments.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-[10px] px-5">
          {chapter.moments.map((m) => (
            <div key={m.id}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-[20px]">
                <MediaTile media={m} className="h-full w-full" showCaption={false} showSource={false} />
              </div>
              <div className="mt-2 px-1 text-[14px] font-medium leading-[19px] text-white/80">{m.caption}</div>
            </div>
          ))}
        </div>
      )}
      {chapter.tags && (
        <div className="mt-6 flex flex-wrap gap-2 px-6">
          {chapter.tags.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
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

function Details({ p, n }: { p: Person; n: number }) {
  return (
    <div>
      <ChapterHead n={n} title="The details" />
      <div className="mx-5 mt-5 overflow-hidden rounded-[22px] border border-white/[0.07] bg-white/[0.04]">
        {[...p.facts, ...p.lifestyle].map((f) => (
          <div key={f.label} className="flex min-h-[52px] items-center justify-between gap-4 border-b border-white/[0.07] px-4 last:border-b-0">
            <span className="text-[15px] text-white/50">{f.label}</span>
            <span className="text-right text-[16px]">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
