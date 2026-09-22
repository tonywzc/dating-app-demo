"use client";

import { Fragment, type ReactNode } from "react";
import { motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { PROFILE_PHOTO, type Muse } from "@/lib/mock-data";
import type { Summary } from "@/lib/muse-script";
import { Button, TextButton } from "@/components/ui/Button";
import { TopFade } from "@/components/ui/TopFade";
import { MuseAvatar } from "@/components/muse/MuseAvatar";
import type { ProfileBasics } from "@/components/muse/MuseResult";
import { MediaTile } from "./MediaTile";
import type { Moment } from "./StoriesPick";

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] as const },
});

/** The finished profile, as someone browsing would see it. */
export function ProfilePreview({
  muse,
  profile,
  summary,
  moments,
  onContinue,
  onEdit,
}: {
  muse: Muse;
  profile: ProfileBasics;
  summary: Summary;
  moments: Moment[];
  onContinue: () => void;
  onEdit: () => void;
}) {
  const world = summary.sections.find((s) => s.title === "Your world");
  const hoping = summary.sections.find((s) => s.title === "You're hoping to meet");
  const looking = summary.sections.find((s) => s.title === "What you're looking for");

  // Cards between moments keep the profile from being a wall of photos.
  const interludes: Record<number, ReactNode> = {
    1: world && <ChipsCard title="My world" items={world.items} />,
    3: hoping && <ChipsCard title="Hoping to meet" items={hoping.items} />,
  };

  return (
    <motion.div className="absolute inset-0 bg-[#0E0C14]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
      <TopFade color="#0E0C14" />
      <div className="no-scrollbar pt-safe relative h-full overflow-y-auto px-4 pb-[180px]">
        <motion.div className="px-2 pt-5" {...rise(0)}>
          <span className="rounded-full bg-white/10 px-[10px] py-[3px] text-[12px] font-semibold text-white/70">Preview</span>
          <h1 className="mt-3 text-[28px] font-bold leading-[34px] tracking-[-0.03em]">Here&apos;s how people will see you</h1>
        </motion.div>

        <div className="mt-5 space-y-3">
          {/* Main photo */}
          <motion.div className="relative aspect-[4/5] overflow-hidden rounded-[28px]" {...rise(0.1)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PROFILE_PHOTO} alt={profile.firstName} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <div className="text-[32px] font-bold leading-[36px] tracking-[-0.02em]">
                {profile.firstName}
                {profile.age ? `, ${profile.age}` : ""}
              </div>
              <div className="mt-1 text-[15px] text-white/80">{profile.location}</div>
            </div>
          </motion.div>

          {/* Muse's take */}
          <motion.div className="rounded-[24px] border border-white/[0.08] bg-white/[0.05] p-5" {...rise(0.2)}>
            <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.07em] text-white/45">
              <MuseAvatar muse={muse} size={18} mood="idle" />
              {muse.name}&apos;s take
            </div>
            <p className="mt-3 text-[17px] leading-[25px] text-white/90">&ldquo;{summary.essence}&rdquo;</p>
          </motion.div>

          {/* Moments, with a few cards in between */}
          {moments.map((m, i) => (
            <Fragment key={m.media.id}>
              <motion.div className="relative aspect-[4/5] overflow-hidden rounded-[28px]" {...rise(0.3 + i * 0.08)}>
                <MediaTile media={m.media} className="h-full w-full" showCaption={false} showSource={false} />
                <div className="absolute bottom-5 left-5 right-5 text-[20px] font-semibold leading-[26px] drop-shadow-lg">{m.title}</div>
              </motion.div>
              {interludes[i] && <motion.div {...rise(0.35 + i * 0.08)}>{interludes[i]}</motion.div>}
            </Fragment>
          ))}

          {moments.length < 2 && world && <ChipsCard title="My world" items={world.items} />}
          {looking && <ChipsCard title="Looking for" items={looking.items} />}
        </div>
      </div>

      <motion.div
        className="pb-safe absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0E0C14] via-[#0E0C14]/95 to-transparent px-5 pt-10"
        {...rise(0.5)}
      >
        <Button onClick={onContinue}>Meet my first introductions</Button>
        <div className="mt-1 flex justify-center">
          <TextButton onClick={onEdit} className="text-white/70">
            Edit my stories
          </TextButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ChipsCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.05] p-5">
      <div className="text-[12px] font-medium uppercase tracking-[0.07em] text-white/45">{title}</div>
      <div className="mt-3 flex flex-wrap gap-[6px]">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full px-3 py-[6px] text-[14px] text-white/90"
            style={{ background: `linear-gradient(135deg, ${BRAND.colors.rose}33, ${BRAND.colors.violet}33)` }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
