"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ageFrom } from "@/lib/format";
import type { Summary } from "@/lib/muse-script";
import type { Person, StoryChapter } from "@/lib/app-data";
import { ARCHIVE_STORIES, CAMERA_ROLL_MEDIA, PROFILE_PHOTO, type Muse } from "@/lib/mock-data";
import { PushScreen, BackButton } from "@/components/app/PushScreen";
import { TAB_BAR_SPACE } from "@/components/app/TabBar";
import { MediaTile } from "@/components/photos/MediaTile";
import { PhotoPicker } from "@/components/photos/PhotoPicker";
import { toMoment, type Moment } from "@/components/photos/StoriesPick";
import { Group, Row, type Field } from "@/components/profile/AboutYou";
import { EditFieldSheet, type EditTarget } from "@/components/profile/EditFieldSheet";
import { ProfileBook } from "@/components/today/ProfileBook";
import { TopFade } from "@/components/ui/TopFade";
import { Photo } from "@/components/ui/Photo";
import { ChevronRight, CloseIcon, EyeIcon, GearIcon, ImageIcon, MicIcon, PlusIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { StoryEditSheet } from "./StoryEditSheet";

/** Everything on your public profile that you can edit. */
export type Me = { fields: Field[]; interests: string[]; moments: Moment[]; story: StoryChapter[] };

const field = (fields: Field[], id: string) => fields.find((f) => f.id === id)?.value ?? "";

/** You, in the same book layout others see in Today. */
export function selfAsPerson(me: Me, summary: Summary): Person {
  const birthday = field(me.fields, "birthday");
  const section = (title: string) => summary.sections.find((s) => s.title === title)?.items ?? [];
  return {
    id: "me",
    name: field(me.fields, "name"),
    age: birthday ? ageFrom(birthday) : 0,
    photo: PROFILE_PHOTO,
    avatar: PROFILE_PHOTO,
    neighborhood: field(me.fields, "location").split(",")[0],
    verified: true,
    essence: summary.essence,
    why: "",
    overlaps: [],
    story: me.story,
    instagram: me.moments.map((m) => ({ ...m.media, caption: m.title })),
    askAbout: ["Grandma's broth", "Fresh pasta", "Marin hikes"],
    interests: me.interests,
    lookingFor: field(me.fields, "looking"),
    hopingToMeet: section("You're hoping to meet"),
    facts: ["work", "school", "languages"].map((id) => ({ label: me.fields.find((f) => f.id === id)!.label, value: field(me.fields, id) })).filter((f) => f.value),
    lifestyle: [],
    openers: [],
  };
}

/** Your public profile: always editable, with a preview of exactly what others see. */
export function YouTab({
  me,
  onChange,
  muse,
  summary,
  onOpenSettings,
  onTalkToMuse,
}: {
  me: Me;
  onChange: (me: Me) => void;
  muse: Muse;
  summary: Summary;
  onOpenSettings: () => void;
  onTalkToMuse: () => void;
}) {
  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [adding, setAdding] = useState(false);
  const [preview, setPreview] = useState(false);
  const [chapter, setChapter] = useState<StoryChapter | null>(null);
  const self = useMemo(() => selfAsPerson(me, summary), [me, summary]);

  const groups = {
    basics: me.fields.filter((f) => ["name", "birthday", "gender"].includes(f.id)),
    life: me.fields.filter((f) => ["location", "work", "school", "languages"].includes(f.id)),
    looking: me.fields.filter((f) => f.id === "looking"),
  };
  const added = new Set(me.moments.map((m) => m.media.id));

  const save = (value: string) => {
    if (!editing) return;
    if ("interest" in editing) onChange({ ...me, interests: me.interests.includes(value) ? me.interests : [...me.interests, value] });
    else
      onChange({
        ...me,
        fields: me.fields.map((f) => (f.id === editing.field.id ? { ...f, value, edited: Boolean(f.source) && (f.value !== value || f.edited) } : f)),
      });
    setEditing(null);
  };

  return (
    <div className="absolute inset-0 bg-[#0B0A10]">
      <TopFade color="#0B0A10" />
      <div className="no-scrollbar pt-safe relative h-full overflow-y-auto px-4" style={{ paddingBottom: `calc(${TAB_BAR_SPACE} + 28px)` }}>
        <div className="flex items-center justify-between px-1 pt-2">
          <h1 className="text-[34px] font-bold tracking-[-0.03em]">You</h1>
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              aria-label="Preview"
              whileTap={{ scale: 0.92 }}
              onClick={() => setPreview(true)}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white/10"
            >
              <EyeIcon size={21} />
            </motion.button>
            <motion.button
              type="button"
              aria-label="Settings"
              whileTap={{ scale: 0.92 }}
              onClick={onOpenSettings}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white/10"
            >
              <GearIcon size={19} />
            </motion.button>
          </div>
        </div>

        {/* Header card */}
        <div className="mt-4 flex items-center gap-4 px-1">
          <div className="relative">
            <Photo src={PROFILE_PHOTO} className="h-[84px] w-[84px] rounded-full" />
            <span className="absolute bottom-0 right-0 rounded-full bg-[#0B0A10] p-[2px]">
              <ShieldCheckIcon size={20} />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[24px] font-bold tracking-[-0.02em]">
              {self.name}
              {self.age ? `, ${self.age}` : ""}
            </div>
            <div className="text-[14px] text-white/55">{field(me.fields, "location")}</div>
          </div>
        </div>

        {/* Photos & stories */}
        <section className="mt-6">
          <div className="flex items-baseline justify-between px-3 pb-2">
            <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-white/50">Photos & stories</h2>
          </div>
          <div className="grid grid-cols-3 gap-[6px]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[16px]">
              <Photo src={PROFILE_PHOTO} className="h-full w-full" />
              <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-[1px] text-[11px] font-semibold backdrop-blur">Main</span>
            </div>
            <AnimatePresence initial={false}>
              {me.moments.map((m) => (
                <motion.div
                  key={m.media.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative aspect-[3/4] overflow-hidden rounded-[16px]"
                >
                  <MediaTile media={m.media} className="h-full w-full" showCaption={false} showSource={false} playing={false} />
                  <span className="absolute bottom-2 left-2 right-2 line-clamp-2 text-[11px] font-semibold leading-[14px] drop-shadow">{m.title}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${m.title}`}
                    onClick={() => onChange({ ...me, moments: me.moments.filter((x) => x.media.id !== m.media.id) })}
                    className="absolute right-0 top-0 flex h-[44px] w-[44px] items-center justify-center"
                  >
                    <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-black/55 backdrop-blur">
                      <CloseIcon size={10} strokeWidth={3} />
                    </span>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            <motion.button
              layout
              type="button"
              onClick={() => setAdding(true)}
              className="flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-[16px] border border-dashed border-white/25 text-white/60 active:bg-white/5"
            >
              <PlusIcon size={22} />
              <span className="text-[12px] font-medium">Add</span>
            </motion.button>
          </div>
        </section>

        {/* Your story */}
        <section className="mt-6">
          <h2 className="px-3 pb-2 text-[13px] font-medium uppercase tracking-[0.06em] text-white/50">Your story</h2>
          <div className="overflow-hidden rounded-[22px] border border-white/[0.07] bg-white/[0.04]">
            {me.story.map((c) => (
              <motion.button
                key={c.id}
                type="button"
                onClick={() => setChapter(c)}
                whileTap={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                className="flex w-full items-center gap-3 border-b border-white/[0.07] px-4 py-3 text-left last:border-b-0"
              >
                {c.photo ? (
                  <Photo src={c.photo} className="h-[52px] w-[52px] shrink-0 rounded-[14px]" />
                ) : (
                  <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px] border border-dashed border-white/25 text-white/50">
                    <ImageIcon size={20} />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold">{c.title}</span>
                  <span className="line-clamp-2 block text-[14px] leading-[19px] text-white/55">{c.text}</span>
                </span>
                <ChevronRight className="shrink-0 text-white/30" />
              </motion.button>
            ))}
          </div>
        </section>

        {/* In short */}
        <section className="mt-6">
          <h2 className="px-3 pb-2 text-[13px] font-medium uppercase tracking-[0.06em] text-white/50">In short</h2>
          <div className="flex items-start gap-3 rounded-[22px] border border-white/[0.07] bg-white/[0.04] p-4">
            <p className="flex-1 text-[16px] leading-[23px] text-white/85">{summary.essence}</p>
            <motion.button
              type="button"
              aria-label={`Update with ${muse.name}`}
              whileTap={{ scale: 0.92 }}
              onClick={onTalkToMuse}
              className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-white/10"
            >
              <MicIcon size={20} />
            </motion.button>
          </div>
        </section>

        <Group title="Looking for">
          {groups.looking.map((f) => (
            <Row key={f.id} field={f} onPress={() => setEditing({ field: f })} />
          ))}
        </Group>

        <Group title="Basics">
          {groups.basics.map((f) => (
            <Row key={f.id} field={f} onPress={() => setEditing({ field: f })} />
          ))}
        </Group>

        <Group title="Your life">
          {groups.life.map((f) => (
            <Row key={f.id} field={f} onPress={() => setEditing({ field: f })} />
          ))}
        </Group>

        <Group title="Interests">
          <div className="flex flex-wrap gap-2 p-4">
            <AnimatePresence initial={false}>
              {me.interests.map((tag) => (
                <motion.button
                  key={tag}
                  layout
                  type="button"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  onClick={() => onChange({ ...me, interests: me.interests.filter((t) => t !== tag) })}
                  aria-label={`Remove ${tag}`}
                  className="flex h-[36px] items-center gap-[6px] rounded-full bg-white/[0.09] pl-4 pr-3 text-[15px] active:bg-white/15"
                >
                  {tag}
                  <CloseIcon size={9} strokeWidth={2.6} className="opacity-50" />
                </motion.button>
              ))}
            </AnimatePresence>
            <motion.button
              layout
              type="button"
              onClick={() => setEditing({ interest: true })}
              className="flex h-[36px] items-center gap-[6px] rounded-full border border-dashed border-white/30 px-4 text-[15px] text-white/75 active:bg-white/5"
            >
              <span className="text-[18px] leading-none">+</span> Add
            </motion.button>
          </div>
        </Group>

      </div>

      <EditFieldSheet target={editing} onSave={save} onClose={() => setEditing(null)} />
      <StoryEditSheet
        chapter={chapter}
        onClose={() => setChapter(null)}
        onSave={(c) => {
          onChange({ ...me, story: me.story.map((x) => (x.id === c.id ? c : x)) });
          setChapter(null);
        }}
      />
      <PhotoPicker
        open={adding}
        title="Add moments"
        source={<>Camera roll &amp; stories</>}
        items={[...ARCHIVE_STORIES, ...CAMERA_ROLL_MEDIA].filter((m) => !added.has(m.id))}
        limit={4}
        onClose={() => setAdding(false)}
        onAdd={(items) => {
          setAdding(false);
          onChange({ ...me, moments: [...me.moments, ...items.map((m) => toMoment(m))] });
        }}
      />

      <AnimatePresence>
        {preview && (
          <PushScreen key="preview" background="#0A0810">
            <ProfileBook
              person={self}
              variant="self"
              bottomSpace="48px"
              topLeft={<BackButton onPress={() => setPreview(false)} />}
              label={<span className="rounded-full bg-black/40 px-4 py-[8px] text-[15px] font-semibold backdrop-blur-md">Preview</span>}
            />
          </PushScreen>
        )}
      </AnimatePresence>
    </div>
  );
}
