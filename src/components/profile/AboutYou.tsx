"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { ageFrom, formatBirthday } from "@/lib/format";
import { PROFILE_PREFILL, type ProfileField } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { FacebookGlyph } from "@/components/ui/FacebookGlyph";
import { InstagramGlyph } from "@/components/ui/InstagramGlyph";
import { TopFade } from "@/components/ui/TopFade";
import type { ProfileBasics } from "@/components/muse/MuseResult";
import { EditFieldSheet, type EditTarget } from "./EditFieldSheet";

type Field = ProfileField & { edited?: boolean };

/** "About you": profile basics prefilled from Meta accounts, all editable. */
export function AboutYou({ onDone }: { onDone: (profile: ProfileBasics) => void }) {
  const [basics, setBasics] = useState<Field[]>(PROFILE_PREFILL.basics);
  const [life, setLife] = useState<Field[]>(PROFILE_PREFILL.life);
  const [interests, setInterests] = useState(PROFILE_PREFILL.interests);
  const [editing, setEditing] = useState<EditTarget | null>(null);

  const missing = basics.find((f) => f.required && !f.value);

  const save = (value: string) => {
    if (!editing) return;
    if ("interest" in editing) {
      setInterests((list) => (list.includes(value) ? list : [...list, value]));
    } else {
      // "Edited" only means something for values that came from a Meta account.
      const update = (list: Field[]) =>
        list.map((f) => (f.id === editing.field.id ? { ...f, value, edited: Boolean(f.source) && (f.value !== value || f.edited) } : f));
      setBasics(update);
      setLife(update);
    }
    setEditing(null);
  };

  const finish = () => {
    if (missing) setEditing({ field: missing, hint: `Add your ${missing.label.toLowerCase()} to continue` });
    else {
      const value = (id: string) => [...basics, ...life].find((f) => f.id === id)?.value ?? "";
      const birthday = value("birthday");
      onDone({ firstName: value("name"), age: birthday ? ageFrom(birthday) : undefined, location: value("location") });
    }
  };

  return (
    <motion.div
      layoutId="about-card"
      className="absolute inset-0 overflow-hidden bg-[#121118]"
      style={{ borderRadius: 0 }}
      transition={{ type: "spring", stiffness: 190, damping: 28 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      <TopFade color="#121118" />
      <motion.div
        className="pt-safe flex h-full flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-[140px]">
          <div className="px-2 pt-5">
            <h1 className="text-[34px] font-bold tracking-[-0.03em]">About you</h1>
            <p className="mt-1 text-[15px] leading-[21px] text-white/60">
              We filled this in from your Meta accounts. Tap anything to change it.
            </p>
            <div className="mt-3 flex gap-2">
              <SourcePill source="instagram" />
              <SourcePill source="facebook" />
            </div>
          </div>

          <Group title="Basics">
            {basics.map((f) => (
              <Row key={f.id} field={f} onPress={() => setEditing({ field: f })} />
            ))}
          </Group>

          <Group title="Your life">
            {life.map((f) => (
              <Row key={f.id} field={f} onPress={() => setEditing({ field: f })} />
            ))}
          </Group>

          <Group title="Interests" note="From accounts you follow on Instagram">
            <div className="flex flex-wrap gap-2 p-4">
              <AnimatePresence initial={false}>
                {interests.map((tag) => (
                  <motion.button
                    key={tag}
                    layout
                    type="button"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    onClick={() => setInterests((list) => list.filter((t) => t !== tag))}
                    aria-label={`Remove ${tag}`}
                    className="flex h-[36px] items-center gap-[6px] rounded-full bg-white/[0.09] pl-4 pr-3 text-[15px] active:bg-white/15"
                  >
                    {tag}
                    <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="opacity-50">
                      <path d="M2 2l6 6M8 2L2 8" />
                    </svg>
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

          <div className="mt-5 flex gap-3 px-3 text-[13px] leading-[18px] text-white/45">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mt-[1px] shrink-0">
              <rect x="4" y="11" width="16" height="10" rx="3" />
              <path d="M8 11V7.5a4 4 0 018 0V11" />
            </svg>
            Only you can see where this came from. {BRAND.name} never posts to Instagram or Facebook.
          </div>
        </div>

        <div className="pb-safe absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#121118] via-[#121118]/95 to-transparent px-5 pt-10">
          <Button onClick={finish}>Next</Button>
          <p className="mt-2 h-[18px] text-center text-[13px] text-white/45">
            {missing ? `Add your ${missing.label.toLowerCase()} to continue` : "You can edit this later in your profile"}
          </p>
        </div>
      </motion.div>

      <EditFieldSheet target={editing} onSave={save} onClose={() => setEditing(null)} />
    </motion.div>
  );
}

function Group({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <div className="flex items-baseline justify-between px-3 pb-2">
        <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-white/50">{title}</h2>
        {note && <span className="text-[12px] text-white/40">{note}</span>}
      </div>
      <div className="overflow-hidden rounded-[22px] border border-white/[0.07] bg-white/[0.04]">{children}</div>
    </section>
  );
}

function Row({ field, onPress }: { field: Field; onPress: () => void }) {
  const display = field.kind === "date" ? formatBirthday(field.value, true) : field.value;
  return (
    <motion.button
      type="button"
      onClick={onPress}
      whileTap={{ backgroundColor: "rgba(255,255,255,0.06)" }}
      className="flex w-full items-center gap-3 border-b border-white/[0.07] px-4 py-[12px] text-left last:border-b-0"
    >
      <div className="min-w-0 flex-1">
        <div className="text-[13px] text-white/50">{field.label}</div>
        {display ? (
          <div className="mt-[2px] truncate text-[17px]">{display}</div>
        ) : (
          <div className="mt-[2px] flex items-center gap-2 text-[17px] font-medium" style={{ color: BRAND.colors.roseTop }}>
            Add {field.label.toLowerCase()}
            {field.required && <span className="rounded-full bg-[#FF3F6E]/20 px-2 py-[1px] text-[11px] font-semibold">Required</span>}
          </div>
        )}
      </div>
      {field.edited ? (
        <span className="rounded-full bg-white/10 px-2 py-[2px] text-[11px] font-medium text-white/60">Edited</span>
      ) : field.source === "instagram" ? (
        <InstagramGlyph size={16} />
      ) : field.source === "facebook" ? (
        <FacebookGlyph size={16} />
      ) : null}
      <svg width="7" height="12" viewBox="0 0 8 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/30">
        <path d="M1.5 1.5l5 5-5 5" />
      </svg>
    </motion.button>
  );
}

function SourcePill({ source }: { source: "instagram" | "facebook" }) {
  return (
    <span className="flex items-center gap-[6px] rounded-full bg-white/[0.07] py-[5px] pl-[6px] pr-3 text-[13px] text-white/70">
      {source === "instagram" ? <InstagramGlyph size={16} /> : <FacebookGlyph size={16} />}
      {source === "instagram" ? "Instagram" : "Facebook"}
    </span>
  );
}
