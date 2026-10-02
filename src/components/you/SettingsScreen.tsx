"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { CALENDARS } from "@/lib/app-data";
import type { Account } from "@/lib/mock-data";
import { BackButton } from "@/components/app/PushScreen";
import { SystemAlert, type AlertSpec } from "@/components/ios/SystemAlert";
import { LegalSheet, type LegalDoc } from "@/components/onboarding/LegalSheet";
import { Avatar } from "@/components/ui/Avatar";
import { FacebookGlyph } from "@/components/ui/FacebookGlyph";
import { InstagramGlyph } from "@/components/ui/InstagramGlyph";
import { Sheet } from "@/components/ui/Sheet";
import { Toggle } from "@/components/ui/Toggle";
import { TopFade } from "@/components/ui/TopFade";
import { CheckIcon, ChevronRight } from "@/components/ui/icons";

export type Settings = {
  calendar: string | null;
  shareDates: boolean;
  showOnToday: boolean;
  paused: boolean;
  museMemory: boolean;
  hideFromKnown: boolean;
  notify: Record<NotifyKey, boolean>;
};

type NotifyKey = "intro" | "messages" | "interest" | "nearby" | "dates";

const NOTIFY: { key: NotifyKey; label: string; sub: string }[] = [
  { key: "intro", label: "Today's introduction", sub: "Every morning at 9" },
  { key: "messages", label: "Messages", sub: "From mutual matches" },
  { key: "interest", label: "Someone's into you", sub: "Notes and rings on Nearby" },
  { key: "nearby", label: "Nearby", sub: "Events and blind dates around you" },
  { key: "dates", label: "Date reminders", sub: "The afternoon before" },
];

export const DEFAULT_SETTINGS: Settings = {
  calendar: null,
  shareDates: true,
  showOnToday: true,
  paused: false,
  museMemory: true,
  hideFromKnown: true,
  notify: { intro: true, messages: true, interest: true, nearby: false, dates: true },
};

export function SettingsScreen({
  account,
  settings,
  onChange,
  nearbyOn,
  onNearby,
  onBack,
  onOpenMuse,
  onLogOut,
  onReplay,
}: {
  account: Account;
  settings: Settings;
  onChange: (s: Settings) => void;
  nearbyOn: boolean;
  onNearby: (on: boolean) => void;
  onBack: () => void;
  onOpenMuse: () => void;
  onLogOut: () => void;
  onReplay: () => void;
}) {
  const [legal, setLegal] = useState<LegalDoc | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [alert, setAlert] = useState<AlertSpec | null>(null);
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });

  const confirm = (spec: { title: string; message: string; action: string; onConfirm: () => void }) =>
    setAlert({
      title: spec.title,
      message: spec.message,
      buttons: [
        { label: "Cancel", onPress: () => setAlert(null) },
        {
          label: spec.action,
          style: "preferred",
          onPress: () => {
            setAlert(null);
            spec.onConfirm();
          },
        },
      ],
    });

  return (
    <div className="absolute inset-0 bg-[#0B0A10]">
      <TopFade color="#0B0A10" />
      <div className="pt-safe absolute inset-x-0 top-0 z-20 flex items-center gap-3 px-3">
        <BackButton onPress={onBack} />
      </div>
      <div className="no-scrollbar pt-safe h-full overflow-y-auto px-4 pb-[60px]">
        <h1 className="px-2 pt-[56px] text-[34px] font-bold tracking-[-0.03em]">Settings</h1>

        <Group title="Account">
          <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
            <Avatar account={account} size={44} />
            <div className="min-w-0 flex-1">
              <div className="text-[16px] font-semibold">{account.displayName}</div>
              <div className="text-[13px] text-white/50">Signed in with Instagram</div>
            </div>
          </div>
          <Row icon={<InstagramGlyph size={20} />} label="Instagram" value={`@${account.username}`} />
          <Row icon={<FacebookGlyph size={20} />} label="Facebook" value="Connected" />
          <Row label="Verified with a selfie" value="Verified" valueTone="good" />
        </Group>

        <Group title="Muse">
          <Row label="What Muse knows about you" onPress={onOpenMuse} />
          <Row label="Voice shortcut" value="Action Button" />
          <Row label="Muse remembers chats" right={<Toggle on={settings.museMemory} label="Muse remembers chats" onChange={(v) => set({ museMemory: v })} />} />
        </Group>

        <Group title="Discovery" note="Today is for something real. Nearby is for something easy.">
          <Row label="Show me in Today" right={<Toggle on={settings.showOnToday} label="Show me in Today" onChange={(v) => set({ showOnToday: v })} />} />
          <Row label="Show me on Nearby" right={<Toggle on={nearbyOn} label="Show me on Nearby" onChange={onNearby} />} />
          <Row label="Age range" value="27 to 35" />
          <Row label="Distance" value="Within 15 km" />
          <Row label="Pause my profile" sub="Hide everywhere. Your chats stay." right={<Toggle on={settings.paused} label="Pause my profile" onChange={(v) => set({ paused: v })} />} />
        </Group>

        <Group title="Dates" note="When Muse books a date, it goes straight onto this calendar.">
          <Row label="Add dates to" value={settings.calendar ?? "Ask me"} onPress={() => setCalendarOpen(true)} />
          <Row
            label="Share date details"
            sub="A trusted friend gets where and when"
            right={<Toggle on={settings.shareDates} label="Share date details" onChange={(v) => set({ shareDates: v })} />}
          />
        </Group>

        <Group title="Notifications">
          {NOTIFY.map((n) => (
            <Row
              key={n.key}
              label={n.label}
              sub={n.sub}
              right={<Toggle on={settings.notify[n.key]} label={n.label} onChange={(v) => set({ notify: { ...settings.notify, [n.key]: v } })} />}
            />
          ))}
        </Group>

        <Group title={`${BRAND.name} Plus`}>
          <div className="flex items-center gap-3 px-4 py-4" style={{ background: `linear-gradient(110deg, ${BRAND.colors.rose}26, ${BRAND.colors.violet}26)` }}>
            <div className="min-w-0 flex-1">
              <div className="text-[16px] font-semibold">Muse introductions</div>
              <div className="text-[13px] leading-[18px] text-white/60">Muse introduces you personally, and you&apos;re first in their day.</div>
            </div>
            <span className="rounded-full bg-white px-3 py-[6px] text-[13px] font-semibold text-black">Try free</span>
          </div>
        </Group>

        <Group title="Privacy & safety">
          <Row label="Blocked people" value="None" />
          <Row label="Hide from people I know" sub="Instagram followers won't see you" right={<Toggle on={settings.hideFromKnown} label="Hide from people I know" onChange={(v) => set({ hideFromKnown: v })} />} />
          <Row label="Safety center" />
        </Group>

        <Group title="About">
          <Row label="Terms of Service" onPress={() => setLegal("terms")} />
          <Row label="Privacy Policy" onPress={() => setLegal("privacy")} />
        </Group>

        <Group>
          <Row label="Replay onboarding" sub="For the demo" onPress={onReplay} />
        </Group>

        <Group>
          <button
            type="button"
            onClick={() => confirm({ title: "Log out?", message: "Muse will keep everything for when you're back.", action: "Log out", onConfirm: onLogOut })}
            className="w-full px-4 py-[14px] text-left text-[17px] text-[#FF6961] active:bg-white/5"
          >
            Log out
          </button>
        </Group>
        <p className="mt-4 text-center text-[12px] text-white/30">{BRAND.name} 1.0 (demo)</p>
      </div>

      <Sheet open={calendarOpen} onClose={() => setCalendarOpen(false)}>
        <h2 className="pt-1 text-center text-[20px] font-bold">Add dates to</h2>
        <p className="mt-1 text-center text-[14px] text-white/55">Muse adds every date it books here.</p>
        <div className="mt-4 overflow-hidden rounded-[20px] bg-white/[0.06]">
          {[...CALENDARS, null].map((c) => (
            <button
              key={c ?? "ask"}
              type="button"
              onClick={() => {
                set({ calendar: c });
                setCalendarOpen(false);
              }}
              className="flex w-full items-center justify-between border-b border-white/[0.07] px-4 py-[14px] text-left text-[17px] last:border-b-0 active:bg-white/5"
            >
              {c ?? "Ask me each time"}
              {settings.calendar === c && <CheckIcon size={16} className="text-[#FF8AA2]" />}
            </button>
          ))}
        </div>
        <div className="h-3" />
      </Sheet>
      <LegalSheet doc={legal} onClose={() => setLegal(null)} />
      <SystemAlert alert={alert} />
    </div>
  );
}

function Group({ title, note, children }: { title?: string; note?: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      {title && <h2 className="px-3 pb-2 text-[13px] font-medium uppercase tracking-[0.06em] text-white/50">{title}</h2>}
      <div className="overflow-hidden rounded-[22px] border border-white/[0.07] bg-white/[0.04]">{children}</div>
      {note && <p className="px-3 pt-2 text-[12px] leading-[17px] text-white/40">{note}</p>}
    </section>
  );
}

function Row({
  icon,
  label,
  sub,
  value,
  valueTone,
  right,
  onPress,
}: {
  icon?: ReactNode;
  label: string;
  sub?: string;
  value?: string;
  valueTone?: "good";
  right?: ReactNode;
  onPress?: () => void;
}) {
  const content = (
    <>
      {icon && <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[16px]">{label}</span>
        {sub && <span className="block text-[13px] text-white/45">{sub}</span>}
      </span>
      {value && <span className={`max-w-[55%] truncate text-right text-[15px] ${valueTone === "good" ? "text-[#5BE07F]" : "text-white/50"}`}>{value}</span>}
      {right}
      {!right && (onPress || !value) && <ChevronRight className="shrink-0 text-white/30" />}
    </>
  );
  const cls = "flex w-full items-center gap-3 border-b border-white/[0.07] px-4 py-[11px] text-left last:border-b-0";
  return onPress ? (
    <motion.button type="button" onClick={onPress} whileTap={{ backgroundColor: "rgba(255,255,255,0.06)" }} className={cls}>
      {content}
    </motion.button>
  ) : (
    <div className={cls}>{content}</div>
  );
}
