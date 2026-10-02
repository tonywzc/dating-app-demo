"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { ageFrom } from "@/lib/format";
import { BEATS, type Answers, type Summary } from "@/lib/muse-script";
import type { Person } from "@/lib/app-data";
import { ARCHIVE_STORIES, CAMERA_ROLL_MEDIA, PROFILE_PHOTO, type Muse } from "@/lib/mock-data";
import { PushScreen, BackButton } from "@/components/app/PushScreen";
import { TAB_BAR_SPACE } from "@/components/app/TabBar";
import { MuseAvatar } from "@/components/muse/MuseAvatar";
import { MediaTile } from "@/components/photos/MediaTile";
import { PhotoPicker } from "@/components/photos/PhotoPicker";
import { toMoment, type Moment } from "@/components/photos/StoriesPick";
import { Group, Row, type Field } from "@/components/profile/AboutYou";
import { EditFieldSheet, type EditTarget } from "@/components/profile/EditFieldSheet";
import { ProfileBook } from "@/components/today/ProfileBook";
import { Toggle } from "@/components/ui/Toggle";
import { TopFade } from "@/components/ui/TopFade";
import { Photo } from "@/components/ui/Photo";
import { CloseIcon, GearIcon, PlusIcon, ShieldCheckIcon } from "@/components/ui/icons";

/** Everything on your public profile that you can edit. */
export type Me = { fields: Field[]; interests: string[]; moments: Moment[] };

const field = (fields: Field[], id: string) => fields.find((f) => f.id === id)?.value ?? "";

// Answers from the Muse conversation that read well as quotes on your profile.
const QUOTE_BEATS = ["weekend", "loved", "ease"];

/** You, in the same book layout others see in Today. */
export function selfAsPerson(me: Me, summary: Summary, answers: Answers): Person {
  const birthday = field(me.fields, "birthday");
  const section = (title: string) => summary.sections.find((s) => s.title === title)?.items ?? [];
  return {
    id: "me",
    name: field(me.fields, "name"),
    age: birthday ? ageFrom(birthday) : 0,
    photo: PROFILE_PHOTO,
    avatar: PROFILE_PHOTO,
    neighborhood: field(me.fields, "location").split(",")[0],
    distance: "",
    verified: true,
    essence: summary.essence,
    why: "",
    overlaps: [],
    moments: me.moments.map((m) => ({ ...m.media, caption: m.title })),
    interests: me.interests,
    quotes: QUOTE_BEATS.filter((id) => answers[id]).map((id) => {
      const beat = BEATS.find((b) => b.id === id)!;
      return { q: beat.muse[beat.muse.length - 1].replace(/^.*?([A-Z][^.!]*\?)$/, "$1"), a: answers[id] };
    }),
    roots: { story: answers.roots ?? "" },
    lookingFor: field(me.fields, "looking"),
    hopingToMeet: section("You're hoping to meet"),
    facts: ["work", "school", "languages"].map((id) => ({ label: me.fields.find((f) => f.id === id)!.label, value: field(me.fields, id) })).filter((f) => f.value),
    lifestyle: [],
    worthTalkingAbout: [],
    firstDate: "",
    opener: "",
  };
}

/** Your public profile: always editable, with a preview of exactly what others see. */
export function YouTab({
  me,
  onChange,
  muse,
  summary,
  answers,
  nearbyOn,
  onNearby,
  onOpenSettings,
  onTalkToMuse,
}: {
  me: Me;
  onChange: (me: Me) => void;
  muse: Muse;
  summary: Summary;
  answers: Answers;
  nearbyOn: boolean;
  onNearby: (on: boolean) => void;
  onOpenSettings: () => void;
  onTalkToMuse: () => void;
}) {
  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [adding, setAdding] = useState(false);
  const [preview, setPreview] = useState(false);
  const self = useMemo(() => selfAsPerson(me, summary, answers), [me, summary, answers]);

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
              whileTap={{ scale: 0.95 }}
              onClick={() => setPreview(true)}
              className="h-[36px] rounded-full bg-white/10 px-4 text-[14px] font-semibold"
            >
              Preview
            </motion.button>
            <motion.button
              type="button"
              aria-label="Settings"
              whileTap={{ scale: 0.92 }}
              onClick={onOpenSettings}
              className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white/10"
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
            <div className="mt-2 flex items-center gap-2">
              <div className="h-[5px] w-[110px] overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[86%] rounded-full" style={{ background: `linear-gradient(90deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }} />
              </div>
              <span className="text-[12px] text-white/50">Profile 86% done</span>
            </div>
          </div>
        </div>

        {/* Photos & moments */}
        <section className="mt-6">
          <div className="flex items-baseline justify-between px-3 pb-2">
            <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-white/50">Photos & moments</h2>
            <span className="text-[12px] text-white/40">Tap × to remove</span>
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
                    className="absolute right-[6px] top-[6px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-black/55 backdrop-blur"
                  >
                    <CloseIcon size={10} strokeWidth={3} />
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

        {/* Muse's take */}
        <section className="mt-6">
          <h2 className="px-3 pb-2 text-[13px] font-medium uppercase tracking-[0.06em] text-white/50">{muse.name}&apos;s take on you</h2>
          <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.04] p-4">
            <p className="text-[16px] leading-[23px] text-white/85">&ldquo;{summary.essence}&rdquo;</p>
            <button type="button" onClick={onTalkToMuse} className="mt-3 flex items-center gap-2 rounded-full bg-white/10 py-[5px] pl-[5px] pr-3 text-[14px] font-semibold active:bg-white/20">
              <MuseAvatar muse={muse} size={22} mood="idle" />
              Talk to {muse.name} to update it
            </button>
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

        <Group title="Where you show up">
          <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="text-[16px]">Today</div>
              <div className="text-[13px] text-white/45">Muse introduces you to one person a day</div>
            </div>
            <span className="text-[15px] text-[#5BE07F]">On</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="text-[16px]">Nearby</div>
              <div className="text-[13px] text-white/45">{nearbyOn ? "Visible around Duboce Triangle" : "Off. Nobody sees you on the map."}</div>
            </div>
            <Toggle on={nearbyOn} label="Show me on Nearby" onChange={onNearby} />
          </div>
        </Group>
      </div>

      <EditFieldSheet target={editing} onSave={save} onClose={() => setEditing(null)} />
      <PhotoPicker
        open={adding}
        title="Add moments"
        source={<>Camera roll and story archive &middot; Muse titles these for you</>}
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
              muse={muse}
              variant="self"
              bottomSpace="48px"
              topLeft={<BackButton onPress={() => setPreview(false)} />}
              label={<span className="rounded-full bg-black/40 px-3 py-[6px] text-[13px] font-semibold backdrop-blur-md">How you appear in Today</span>}
            />
          </PushScreen>
        )}
      </AnimatePresence>
    </div>
  );
}
