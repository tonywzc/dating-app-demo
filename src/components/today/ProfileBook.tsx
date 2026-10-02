"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import type { Person } from "@/lib/app-data";
import type { Muse } from "@/lib/mock-data";
import { MuseAvatar } from "@/components/muse/MuseAvatar";
import { MediaTile } from "@/components/photos/MediaTile";
import { Photo } from "@/components/ui/Photo";
import { CheckIcon, ShieldCheckIcon, SparkleIcon } from "@/components/ui/icons";

export type ChapterId = "cover" | "world" | "words" | "shaped" | "looking" | "details" | "notes";

/** `body` gets the chapter's number, which depends on which chapters this person has. */
type Chapter = { id: ChapterId; title: string; body: (n: number) => ReactNode };

const SERIF = { fontFamily: '"New York", ui-serif, Georgia, "Times New Roman", serif' };

/**
 * One person, told like a short book. Each chapter is a page; swipe left and right
 * (or tap the chapter marks) to turn them. Chapters with nothing to say are left out.
 */
export function ProfileBook({
  person,
  muse,
  variant,
  label,
  topRight,
  topLeft,
  bottomSpace,
  onChapter,
  onUseOpener,
}: {
  person: Person;
  muse: Muse;
  /** `self` is your own profile, as others see it (no "why you two", no Muse's notes). */
  variant: "today" | "view" | "self";
  label: ReactNode;
  topLeft?: ReactNode;
  topRight?: ReactNode;
  /** CSS length kept clear at the bottom of each page (for action bars and the tab bar). */
  bottomSpace: string;
  onChapter?: (id: ChapterId) => void;
  onUseOpener?: (text: string) => void;
}) {
  const chapters = useMemo(() => buildChapters(person, muse, variant, onUseOpener), [person, muse, variant, onUseOpener]);
  const [[index, dir], setPage] = useState<[number, number]>([0, 0]);
  const chapter = chapters[Math.min(index, chapters.length - 1)];

  const go = (next: number) => {
    if (next < 0 || next >= chapters.length || next === index) return;
    setPage([next, next > index ? 1 : -1]);
  };

  useEffect(() => onChapter?.(chapter.id), [chapter.id, onChapter]);

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
            {chapter.body(index + 1)}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Header: label, chapter marks, chapter name */}
      <div className="pt-safe pointer-events-none absolute inset-x-0 top-0 z-10">
        <div
          className="absolute inset-x-0 top-0 h-[150px]"
          style={{ background: chapter.id === "cover" ? "linear-gradient(rgba(0,0,0,0.55), transparent)" : "linear-gradient(#0A0810 55%, transparent)" }}
        />
        <div className="relative flex items-center gap-2 px-4 pt-1">
          {topLeft && <div className="pointer-events-auto">{topLeft}</div>}
          <div className="flex min-w-0 flex-1 items-center gap-2">{label}</div>
          {topRight && <div className="pointer-events-auto">{topRight}</div>}
        </div>
        <div className="pointer-events-auto relative mt-3 flex gap-[5px] px-4">
          {chapters.map((c, i) => (
            <button key={c.id} type="button" aria-label={c.title} onClick={() => go(i)} className="flex h-[14px] flex-1 items-center">
              <span className="h-[3px] w-full overflow-hidden rounded-full bg-white/25">
                <motion.span className="block h-full rounded-full bg-white" initial={false} animate={{ width: i <= index ? "100%" : "0%" }} transition={{ duration: 0.3 }} />
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex items-center justify-between px-4 pt-[2px] text-[12px] font-medium text-white/70">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={chapter.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>
              {chapter.title}
            </motion.span>
          </AnimatePresence>
          <span className="tabular-nums text-white/45">
            {index + 1} / {chapters.length}
          </span>
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

function buildChapters(p: Person, muse: Muse, variant: "today" | "view" | "self", onUseOpener?: (text: string) => void): Chapter[] {
  const self = variant === "self";
  const list: (Chapter | false)[] = [
    { id: "cover", title: self ? "Cover" : "Why you two", body: () => <Cover p={p} muse={muse} variant={variant} /> },
    (p.moments.length > 0 || p.interests.length > 0) && { id: "world", title: `${p.name}'s world`, body: (n) => <World p={p} n={n} /> },
    p.quotes.length > 0 && { id: "words", title: `In ${p.name}'s words`, body: (n) => <Words p={p} muse={muse} n={n} /> },
    Boolean(p.roots.story) && { id: "shaped", title: `What shaped ${p.name}`, body: (n) => <Shaped p={p} n={n} /> },
    Boolean(p.lookingFor) && { id: "looking", title: "Looking for", body: (n) => <Looking p={p} n={n} /> },
    p.facts.length + p.lifestyle.length > 1 && { id: "details", title: "The details", body: (n) => <Details p={p} n={n} /> },
    !self && p.worthTalkingAbout.length > 0 && {
      id: "notes",
      title: `${muse.name}'s notes`,
      body: () => <Notes p={p} muse={muse} onUseOpener={onUseOpener} />,
    },
  ];
  return list.filter(Boolean) as Chapter[];
}

function ChapterHead({ n, title, kicker }: { n: number; title: string; kicker?: string }) {
  return (
    <div className="px-6 pt-[calc(var(--safe-top)+100px)]">
      <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#FF8AA2]">Chapter {n}</div>
      <h2 className="mt-2 text-[34px] leading-[38px] tracking-[-0.01em]" style={SERIF}>
        {title}
      </h2>
      {kicker && <p className="mt-3 text-[16px] leading-[23px] text-white/65">{kicker}</p>}
    </div>
  );
}

function Chip({ children, tint = false }: { children: ReactNode; tint?: boolean }) {
  return (
    <span
      className="rounded-full px-3 py-[6px] text-[14px] text-white/90"
      style={{ background: tint ? `linear-gradient(135deg, ${BRAND.colors.rose}38, ${BRAND.colors.violet}38)` : "rgba(255,255,255,0.08)" }}
    >
      {children}
    </span>
  );
}

function Cover({ p, muse, variant }: { p: Person; muse: Muse; variant: "today" | "view" | "self" }) {
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
          <div className="mt-1 text-[15px] text-white/75">
            {p.neighborhood}
            {variant !== "self" && <> &middot; {p.distance}</>}
          </div>
        </div>
      </div>

      <div className="px-5">
        {variant === "self" ? (
          <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.05] p-5">
            <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.07em] text-white/45">
              <MuseAvatar muse={muse} size={18} mood="idle" />
              {muse.name}&apos;s take
            </div>
            <p className="mt-3 text-[18px] leading-[26px] text-white/90" style={SERIF}>
              &ldquo;{p.essence}&rdquo;
            </p>
          </div>
        ) : (
          <div className="rounded-[26px] p-[1px]" style={{ background: `linear-gradient(160deg, ${BRAND.colors.roseTop}99, rgba(255,255,255,0.06) 45%, ${BRAND.colors.violet}99)` }}>
            <div className="rounded-[25px] bg-[#15121C] p-5">
              <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/55">
                <MuseAvatar muse={muse} size={20} mood="idle" />
                Why {muse.name} thinks you&apos;ll click
              </div>
              <p className="mt-3 text-[17px] leading-[25px] text-white/92">{p.why}</p>
              <div className="mt-4 flex flex-wrap gap-[6px]">
                {p.overlaps.map((o) => (
                  <Chip key={o} tint>
                    {o}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}
        <SwipeHint name={p.name} />
      </div>
    </div>
  );
}

function SwipeHint({ name }: { name: string }) {
  return (
    <div className="mt-5 flex items-center justify-center gap-2 text-[13px] font-medium text-white/45">
      Swipe to turn the page and get to know {name}
      <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
        &rarr;
      </motion.span>
    </div>
  );
}

function World({ p, n }: { p: Person; n: number }) {
  return (
    <div>
      <ChapterHead n={n} title={`${p.name}'s world`} kicker={p.essence} />
      {p.moments.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-[10px] px-5">
          {p.moments.map((m, i) => (
            <div key={m.id} className={i === 0 ? "col-span-2" : ""}>
              <div className={`relative overflow-hidden rounded-[20px] ${i === 0 ? "aspect-[4/3]" : "aspect-[3/4]"}`}>
                <MediaTile media={m} className="h-full w-full" showCaption={false} showSource={false} />
              </div>
              <div className="mt-2 px-1 text-[14px] font-medium leading-[19px] text-white/85">{m.caption}</div>
            </div>
          ))}
        </div>
      )}
      {p.interests.length > 0 && (
        <div className="mt-6 px-6">
          <div className="text-[12px] font-medium uppercase tracking-[0.07em] text-white/45">Into</div>
          <div className="mt-3 flex flex-wrap gap-[6px]">
            {p.interests.map((i) => (
              <Chip key={i}>{i}</Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Words({ p, muse, n }: { p: Person; muse: Muse; n: number }) {
  return (
    <div>
      <ChapterHead n={n} title={`In ${p.name}'s words`} />
      <div className="mt-2 px-6">
        {p.quotes.map((q, i) => (
          <motion.div key={q.q} className="border-b border-white/[0.08] py-6 last:border-b-0" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}>
            <div className="text-[13px] font-medium uppercase leading-[18px] tracking-[0.05em] text-white/45">{q.q}</div>
            <p className="mt-3 text-[22px] leading-[31px] text-white" style={SERIF}>
              &ldquo;{q.a}&rdquo;
            </p>
          </motion.div>
        ))}
        <div className="mt-2 flex items-center gap-2 text-[13px] text-white/45">
          <MuseAvatar muse={muse} size={18} mood="idle" />
          From {p.name}&apos;s conversations with {muse.name}, shared with permission
        </div>
      </div>
    </div>
  );
}

function Shaped({ p, n }: { p: Person; n: number }) {
  const [first, ...rest] = p.roots.story;
  return (
    <div>
      <ChapterHead n={n} title={`What shaped ${p.name}`} />
      {p.roots.photo && (
        <div className="mx-5 mt-6 overflow-hidden rounded-[24px]">
          <Photo src={p.roots.photo} className="aspect-[4/3] w-full" />
        </div>
      )}
      <p className="mt-6 px-6 text-[20px] leading-[31px] text-white/90" style={SERIF}>
        <span className="float-left mr-2 mt-[6px] text-[58px] leading-[48px] text-[#FF8AA2]" style={SERIF}>
          {first}
        </span>
        {rest.join("")}
      </p>
    </div>
  );
}

function Looking({ p, n }: { p: Person; n: number }) {
  return (
    <div>
      <ChapterHead n={n} title="Looking for" />
      <div className="mx-5 mt-6 rounded-[24px] p-5" style={{ background: `linear-gradient(140deg, ${BRAND.colors.rose}2a, ${BRAND.colors.violet}2a)` }}>
        <div className="text-[12px] font-medium uppercase tracking-[0.07em] text-white/55">{p.name} is here for</div>
        <p className="mt-2 text-[28px] leading-[34px]" style={SERIF}>
          {p.lookingFor}
        </p>
      </div>
      {p.hopingToMeet.length > 0 && (
        <div className="mt-6 px-6">
          <div className="text-[12px] font-medium uppercase tracking-[0.07em] text-white/45">Hoping to meet someone who&apos;s</div>
          <div className="mt-3 space-y-[10px]">
            {p.hopingToMeet.map((h) => (
              <div key={h} className="flex items-center gap-3 text-[18px]">
                <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-[#FF8AA2]" />
                {h}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Details({ p, n }: { p: Person; n: number }) {
  return (
    <div>
      <ChapterHead n={n} title="The details" />
      <div className="mx-5 mt-6 overflow-hidden rounded-[22px] border border-white/[0.07] bg-white/[0.04]">
        {[...p.facts, ...p.lifestyle].map((f) => (
          <div key={f.label} className="flex items-baseline justify-between gap-4 border-b border-white/[0.07] px-4 py-[13px] last:border-b-0">
            <span className="text-[15px] text-white/50">{f.label}</span>
            <span className="text-right text-[16px]">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Notes({ p, muse, onUseOpener }: { p: Person; muse: Muse; onUseOpener?: (text: string) => void }) {
  return (
    <div>
      <div className="px-6 pt-[calc(var(--safe-top)+100px)]">
        <div className="flex items-center gap-3">
          <MuseAvatar muse={muse} size={44} mood="idle" />
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#FF8AA2]">Last chapter</div>
            <h2 className="text-[30px] leading-[34px]" style={SERIF}>
              {muse.name}&apos;s notes
            </h2>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3 px-5">
        <NoteCard title="Where you'll click">
          <div className="space-y-[10px]">
            {p.overlaps.map((o) => (
              <div key={o} className="flex items-center gap-3 text-[16px]">
                <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#34C759]/20 text-[#5BE07F]">
                  <CheckIcon size={12} />
                </span>
                {o}
              </div>
            ))}
          </div>
        </NoteCard>
        <NoteCard title="Worth talking about">
          <div className="space-y-3">
            {p.worthTalkingAbout.map((w) => (
              <p key={w} className="text-[16px] leading-[23px] text-white/85">
                {w}
              </p>
            ))}
          </div>
        </NoteCard>
        {p.firstDate && (
          <NoteCard title="A first date I'd suggest">
            <p className="text-[17px] leading-[24px]" style={SERIF}>
              {p.firstDate}
            </p>
          </NoteCard>
        )}
        {p.opener && (
          <NoteCard title="If you're not sure what to say">
            <p className="text-[17px] leading-[24px]" style={SERIF}>
              &ldquo;{p.opener}&rdquo;
            </p>
            {onUseOpener && (
              <button
                type="button"
                onClick={() => onUseOpener(p.opener)}
                className="mt-3 flex items-center gap-[6px] rounded-full bg-white/10 px-3 py-[7px] text-[14px] font-semibold active:bg-white/20"
              >
                <SparkleIcon size={13} className="text-[#FF8AA2]" />
                Use this in my note
              </button>
            )}
          </NoteCard>
        )}
      </div>
      <p className="mt-6 px-6 text-center text-[15px] leading-[22px] text-white/55" style={SERIF}>
        That&apos;s {p.name}, for now. The rest of the story is yours to write.
      </p>
    </div>
  );
}

function NoteCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.05] p-5">
      <div className="mb-3 text-[12px] font-medium uppercase tracking-[0.07em] text-white/45">{title}</div>
      {children}
    </div>
  );
}
