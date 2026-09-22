"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import type { Media, Muse } from "@/lib/mock-data";
import { Button, TextButton } from "@/components/ui/Button";
import { InstagramGlyph } from "@/components/ui/InstagramGlyph";
import { TopFade } from "@/components/ui/TopFade";
import { MuseAvatar } from "@/components/muse/MuseAvatar";
import { MediaTile, PhotosAppGlyph } from "./MediaTile";
import { PhotoPicker } from "./PhotoPicker";
import { HeartIcon } from "./StoryScan";

/** A story (or camera-roll item) the user may add, with Muse's title and the user's edit. */
export type Moment = {
  media: Media;
  likes?: number;
  postedAt?: string;
  /** Muse's generated title. */
  suggested: string;
  title: string;
  selected: boolean;
};

const MAX_FROM_CAMERA = 3;

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
  const [picking, setPicking] = useState(false);
  const update = (id: string, patch: Partial<Moment>) =>
    onChange(moments.map((m) => (m.media.id === id ? { ...m, ...patch } : m)));

  const selected = moments.filter((m) => m.selected);
  const allStories = selected.every((m) => m.media.source === "instagram");
  const fromCamera = moments.filter((m) => m.media.source === "camera").length;
  const cta = !selected.length
    ? "Pick at least one"
    : `Add ${selected.length} ${allStories ? (selected.length === 1 ? "story" : "stories") : "moments"} to my profile`;

  return (
    <motion.div className="absolute inset-0 bg-[#0E0C14]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[380px]"
        style={{ background: "radial-gradient(80% 70% at 50% 0%, rgba(255,95,134,0.24), rgba(106,75,255,0.1) 55%, transparent)" }}
      />
      <TopFade color="#0E0C14" />

      <div className="no-scrollbar pt-safe relative h-full overflow-y-auto px-4 pb-[190px]">
        <div className="px-2 pt-5">
          <div className="flex items-center gap-2 text-[13px] font-medium text-white/55">
            <InstagramGlyph size={14} />
            From your story archive
          </div>
          <h1 className="mt-2 text-[30px] font-bold leading-[36px] tracking-[-0.03em]">Your stories, brought back</h1>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-[20px] bg-white/[0.06] p-3">
          <MuseAvatar muse={muse} size={32} mood="idle" />
          <p className="text-[14px] leading-[20px] text-white/80">
            These got the most love from your friends, and they say a lot about you. I gave each one a title. Tap to change anything.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-[10px] gap-y-5">
          {moments.map((m) => (
            <StoryCard
              key={m.media.id}
              moment={m}
              onToggle={() => update(m.media.id, { selected: !m.selected })}
              onTitle={(title) => update(m.media.id, { title })}
              museName={muse.name}
            />
          ))}

          {fromCamera < MAX_FROM_CAMERA && (
            <motion.button
              type="button"
              onClick={() => setPicking(true)}
              whileTap={{ scale: 0.97 }}
              className="flex aspect-[9/16] flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-white/25 bg-white/[0.03] px-4 text-center active:bg-white/[0.06]"
            >
              <span className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-white/10">
                <PhotosAppGlyph size={24} />
              </span>
              <span className="text-[15px] font-semibold">Add from camera roll</span>
              <span className="text-[12px] leading-[16px] text-white/45">Photos or videos. {muse.name} will title them too.</span>
            </motion.button>
          )}
        </div>

        <div className="mt-6 flex gap-3 px-2 text-[13px] leading-[18px] text-white/45">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mt-[1px] shrink-0">
            <rect x="4" y="11" width="16" height="10" rx="3" />
            <path d="M8 11V7.5a4 4 0 018 0V11" />
          </svg>
          Your archive stays private. Only what you add appears on {BRAND.name}, and nothing is posted to Instagram.
        </div>
      </div>

      <div className="pb-safe absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0E0C14] via-[#0E0C14]/95 to-transparent px-5 pt-10">
        <Button onClick={onContinue} disabled={!selected.length}>
          {cta}
        </Button>
        <div className="mt-1 flex justify-center">
          <TextButton onClick={onSkip} className="text-white/70">
            Skip for now
          </TextButton>
        </div>
      </div>

      <PhotoPicker
        open={picking}
        limit={MAX_FROM_CAMERA - fromCamera}
        exclude={moments.map((m) => m.media.id)}
        onClose={() => setPicking(false)}
        onAdd={(items) => {
          setPicking(false);
          onChange([
            ...moments,
            ...items.map((media) => ({ media, suggested: media.caption ?? "A good day", title: media.caption ?? "A good day", selected: true })),
          ]);
        }}
      />
    </motion.div>
  );
}

function StoryCard({
  moment,
  onToggle,
  onTitle,
  museName,
}: {
  moment: Moment;
  onToggle: () => void;
  onTitle: (title: string) => void;
  museName: string;
}) {
  const { media, selected } = moment;
  return (
    <div>
      <motion.div
        layoutId={media.source === "instagram" ? `story-${media.id}` : undefined}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        aria-label={selected ? `Remove ${moment.title}` : `Add ${moment.title}`}
        onClick={onToggle}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
        className="relative aspect-[9/16] cursor-pointer overflow-hidden rounded-[18px] outline-none"
        initial={media.source === "camera" ? { opacity: 0, scale: 0.9 } : false}
        animate={{ opacity: selected ? 1 : 0.4, scale: 1 }}
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

      <TitleField title={moment.title} suggested={moment.suggested} by={museName} onChange={onTitle} />
    </div>
  );
}

/** Muse's title, editable in place. Clearing it restores Muse's suggestion. */
function TitleField({ title, suggested, by, onChange }: { title: string; suggested: string; by: string; onChange: (t: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  const commit = () => {
    onChange(draft.trim() || suggested);
    setEditing(false);
  };

  return (
    <div className="mt-2 px-1">
      {editing ? (
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
          className="w-full rounded-[10px] border border-white/30 bg-white/[0.08] px-2 py-1 text-[15px] font-semibold text-white outline-none"
          aria-label="Story title"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(title);
            setEditing(true);
          }}
          className="flex w-full items-start gap-[6px] text-left active:opacity-60"
          aria-label={`Edit title: ${title}`}
        >
          <span className="text-[15px] font-semibold leading-[20px]">{title}</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mt-[4px] shrink-0 text-white/45">
            <path d="M4 20h4L19 9l-4-4L4 16v4z" />
            <path d="M14 6l4 4" />
          </svg>
        </button>
      )}
      <div className="mt-[3px] text-[11px] font-medium text-white/40">
        {title === suggested ? `✦ Title by ${by}` : "Edited by you"}
      </div>
    </div>
  );
}
