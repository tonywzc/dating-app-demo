"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ARCHIVE_STORIES, CAMERA_ROLL_MEDIA, type Media, type Muse, type Story } from "@/lib/mock-data";
import { Button, TextButton } from "@/components/ui/Button";
import { InstagramGlyph } from "@/components/ui/InstagramGlyph";
import { TopFade } from "@/components/ui/TopFade";
import { MuseAvatar } from "@/components/muse/MuseAvatar";
import { MediaTile, PhotosAppGlyph } from "./MediaTile";
import { PhotoPicker } from "./PhotoPicker";
import { HeartIcon } from "./StoryScan";

/** A moment the user may add (from their story archive or camera roll), with Muse's title and the user's edit. */
export type Moment = {
  media: Media;
  likes?: number;
  postedAt?: string;
  /** Muse's generated title. */
  suggested: string;
  title: string;
  selected: boolean;
};

const ADD_LIMIT = 3;

export const toMoment = (m: Media | Story, selected = true): Moment => ({
  media: m,
  likes: "likes" in m ? m.likes : undefined,
  postedAt: "postedAt" in m ? m.postedAt : undefined,
  suggested: m.caption ?? "A good day",
  title: m.caption ?? "A good day",
  selected,
});

export function StoriesPick({
  muse,
  moments,
  onChange,
  onContinue,
  onSkip,
}: {
  muse: Muse;
  moments: Moment[];
  onChange: (moments: Moment[]) => void;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const [noteOpen, setNoteOpen] = useState(true);
  const [picking, setPicking] = useState<"camera" | "stories" | null>(null);

  const update = (id: string, patch: Partial<Moment>) =>
    onChange(moments.map((m) => (m.media.id === id ? { ...m, ...patch } : m)));
  const added = new Set(moments.map((m) => m.media.id));
  const selectedCount = moments.filter((m) => m.selected).length;

  const pickerItems = picking === "camera" ? CAMERA_ROLL_MEDIA : ARCHIVE_STORIES;

  return (
    <motion.div className="absolute inset-0 bg-[#0E0C14]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[360px]"
        style={{ background: "radial-gradient(80% 70% at 50% 0%, rgba(255,95,134,0.22), rgba(106,75,255,0.1) 55%, transparent)" }}
      />
      <TopFade color="#0E0C14" />

      <div className="no-scrollbar pt-safe relative h-full overflow-y-auto px-4 pb-[170px]">
        <h1 className="px-2 pt-6 text-[30px] font-bold leading-[36px] tracking-[-0.03em]">Your best moments, brought back</h1>

        <AnimatePresence initial={false}>
          {noteOpen && (
            <motion.div
              className="overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="relative mt-4 flex items-start gap-3 rounded-[20px] bg-white/[0.06] py-3 pl-3 pr-10">
                <MuseAvatar muse={muse} size={30} mood="idle" />
                <p className="text-[14px] leading-[20px] text-white/80">
                  Your friends loved these. I gave each one a title. Tap a title to change it.
                </p>
                <button
                  type="button"
                  aria-label="Dismiss note"
                  onClick={() => setNoteOpen(false)}
                  className="absolute right-2 top-2 flex h-[28px] w-[28px] items-center justify-center rounded-full text-white/50 active:bg-white/10"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M2 2l8 8M10 2l-8 8" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout className="mt-5 grid grid-cols-2 gap-x-[10px] gap-y-4">
          {moments.map((m) => (
            <StoryCard
              key={m.media.id}
              moment={m}
              onToggle={() => update(m.media.id, { selected: !m.selected })}
              onTitle={(title) => update(m.media.id, { title })}
            />
          ))}
        </motion.div>

        <motion.div layout className="mt-6 grid grid-cols-2 gap-[10px]">
          <AddCard icon={<PhotosAppGlyph size={22} />} label="Add from camera roll" onPress={() => setPicking("camera")} />
          <AddCard icon={<InstagramGlyph size={20} />} label="Add from stories" onPress={() => setPicking("stories")} />
        </motion.div>
      </div>

      <div className="pb-safe absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0E0C14] via-[#0E0C14]/95 to-transparent px-5 pt-10">
        <Button onClick={onContinue} disabled={!selectedCount}>
          Add moments to my profile
        </Button>
        <div className="mt-1 flex justify-center">
          <TextButton onClick={onSkip} className="text-white/70">
            Skip for now
          </TextButton>
        </div>
      </div>

      <PhotoPicker
        open={picking !== null}
        title={picking === "camera" ? "Camera roll" : "Your stories"}
        source={
          picking === "camera" ? (
            <>
              <PhotosAppGlyph size={15} /> Recents
            </>
          ) : (
            <>
              <InstagramGlyph size={14} /> Archive &middot; Muse titles these for you
            </>
          )
        }
        items={pickerItems.filter((m) => !added.has(m.id))}
        limit={ADD_LIMIT}
        onClose={() => setPicking(null)}
        onAdd={(items) => {
          setPicking(null);
          onChange([...moments, ...items.map((m) => toMoment(m))]);
        }}
      />
    </motion.div>
  );
}

function AddCard({ icon, label, onPress }: { icon: ReactNode; label: string; onPress: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      whileTap={{ scale: 0.97 }}
      className="relative flex h-[96px] flex-col items-start justify-between rounded-[18px] border border-white/10 bg-white/[0.05] p-4 text-left active:bg-white/[0.08]"
    >
      <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/10">{icon}</span>
      <span className="absolute right-4 top-3 text-[22px] font-light leading-none text-white/45">+</span>
      <span className="text-[15px] font-semibold leading-[19px]">{label}</span>
    </motion.button>
  );
}

function StoryCard({ moment, onToggle, onTitle }: { moment: Moment; onToggle: () => void; onTitle: (title: string) => void }) {
  const { media, selected } = moment;
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}>
      <motion.div
        layoutId={`story-${media.id}`}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        aria-label={selected ? `Remove ${moment.title}` : `Add ${moment.title}`}
        onClick={onToggle}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
        className="relative aspect-[9/16] cursor-pointer overflow-hidden rounded-[18px] outline-none"
        animate={{ opacity: selected ? 1 : 0.4 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
      >
        <MediaTile media={media} className="h-full w-full" showCaption={false} showSource={false} playing={selected} />
        {selected && <span className="pointer-events-none absolute inset-0 rounded-[18px] ring-2 ring-inset ring-[#FF8AA2]" />}

        <span
          className={`absolute right-2 top-2 flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 ${
            selected ? "border-white bg-white" : "border-white/80 bg-black/25"
          }`}
        >
          {selected && (
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="#0b0a10" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.5 5.2l3 3 6-6.4" />
            </svg>
          )}
        </span>

        <span className="absolute bottom-2 left-2 flex items-center gap-[5px] rounded-full bg-black/45 px-2 py-[3px] text-[11px] font-semibold text-white backdrop-blur-md">
          {moment.likes !== undefined ? (
            <>
              <HeartIcon size={10} color="#FF6A88" />
              {moment.likes} &middot; {moment.postedAt}
            </>
          ) : (
            <>
              <PhotosAppGlyph size={11} />
              Camera roll
            </>
          )}
        </span>
      </motion.div>

      <TitleField title={moment.title} suggested={moment.suggested} onChange={onTitle} />
    </motion.div>
  );
}

/** Muse's title, editable in place. Clearing it restores Muse's suggestion. */
function TitleField({ title, suggested, onChange }: { title: string; suggested: string; onChange: (t: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  const commit = () => {
    onChange(draft.trim() || suggested);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        maxLength={40}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        className="mt-2 w-full rounded-[10px] border border-white/30 bg-white/[0.08] px-2 py-1 text-[15px] font-semibold text-white outline-none"
        aria-label="Moment title"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(title);
        setEditing(true);
      }}
      className="mt-2 flex w-full items-start gap-[6px] px-1 text-left active:opacity-60"
      aria-label={`Edit title: ${title}`}
    >
      <span className="text-[15px] font-semibold leading-[20px]">
        {title === suggested && <span className="mr-1 text-[#FF8AA2]">&#x2726;</span>}
        {title}
      </span>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mt-[4px] shrink-0 text-white/40">
        <path d="M4 20h4L19 9l-4-4L4 16v4z" />
        <path d="M14 6l4 4" />
      </svg>
    </button>
  );
}
