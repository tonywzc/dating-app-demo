"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { CALENDARS } from "@/lib/app-data";
import type { Account } from "@/lib/mock-data";
import { BackButton } from "@/components/app/PushScreen";
import { PLUS_PRICE } from "@/components/app/PlusSheet";
import { BrandMark } from "@/components/brand/BrandMark";
import { SystemAlert, type AlertSpec } from "@/components/ios/SystemAlert";
import { LegalSheet, type LegalDoc } from "@/components/onboarding/LegalSheet";
import { DistanceSheet } from "@/components/today/DistanceSheet";
import { Avatar } from "@/components/ui/Avatar";
import { InstagramGlyph } from "@/components/ui/InstagramGlyph";
import { Toggle } from "@/components/ui/Toggle";
import { TopFade } from "@/components/ui/TopFade";
import { BellIcon, CalendarIcon, CheckIcon, ChevronRight, EyeIcon, HelpIcon, LockIcon, LogoutIcon, ReplayIcon } from "@/components/ui/icons";

export type Settings = {
  calendar: string | null;
  /** How far Today looks for introductions. */
  distance: string;
  shareDates: boolean;
  showOnToday: boolean;
  paused: boolean;
  hideFromKnown: boolean;
  notify: Record<NotifyKey, boolean>;
};

type NotifyKey = "intro" | "messages" | "interest" | "nearby" | "dates";

const NOTIFY: { key: NotifyKey; label: string }[] = [
  { key: "intro", label: "Today's introduction" },
  { key: "messages", label: "Messages" },
  { key: "interest", label: "Someone's into you" },
  { key: "nearby", label: "Events nearby" },
  { key: "dates", label: "Date reminders" },
];

export const DEFAULT_SETTINGS: Settings = {
  calendar: null,
  distance: "25 km",
  shareDates: true,
  showOnToday: true,
  paused: false,
  hideFromKnown: true,
  notify: { intro: true, messages: true, interest: true, nearby: false, dates: true },
};

type Page = "notifications" | "discovery" | "dates" | "privacy";

export function SettingsScreen({
  account,
  settings,
  onChange,
  nearbyOn,
  onNearby,
  plus,
  onPlus,
  onBack,
  onLogOut,
  onReplay,
}: {
  account: Account;
  settings: Settings;
  onChange: (s: Settings) => void;
  nearbyOn: boolean;
  onNearby: (on: boolean) => void;
  plus: boolean;
  onPlus: () => void;
  onBack: () => void;
  onLogOut: () => void;
  onReplay: () => void;
}) {
  const [page, setPage] = useState<Page | null>(null);
  const [legal, setLegal] = useState<LegalDoc | null>(null);
  const [alert, setAlert] = useState<AlertSpec | null>(null);
  const [distanceOpen, setDistanceOpen] = useState(false);
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });

  const logOut = () =>
    setAlert({
      title: "Log out?",
      message: "",
      buttons: [
        { label: "Cancel", onPress: () => setAlert(null) },
        {
          label: "Log out",
          style: "preferred",
          onPress: () => {
            setAlert(null);
            onLogOut();
          },
        },
      ],
    });

  return (
    <div className="absolute inset-0 bg-[#0B0A10]">
      <TopFade color="#0B0A10" />
      <div className="pt-safe absolute inset-x-0 top-0 z-20 px-3">
        <BackButton onPress={onBack} />
      </div>
      <div className="no-scrollbar pt-safe h-full overflow-y-auto px-4 pb-[60px]">
        <h1 className="px-2 pt-[56px] text-[34px] font-bold tracking-[-0.03em]">Settings</h1>

        {/* Account */}
        <div className="mt-5 flex items-center gap-3 rounded-[22px] border border-white/[0.07] bg-white/[0.04] px-4 py-3">
          <Avatar account={account} size={52} />
          <div className="min-w-0 flex-1">
            <div className="text-[18px] font-semibold">{account.displayName}</div>
            <div className="flex items-center gap-[6px] text-[14px] text-white/50">
              <InstagramGlyph size={14} /> @{account.username}
            </div>
          </div>
        </div>

        {/* Plus */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={plus ? undefined : onPlus}
          className="mt-3 flex w-full items-center gap-3 rounded-[22px] px-4 py-3 text-left"
          style={{ background: `linear-gradient(110deg, ${BRAND.colors.rose}33, ${BRAND.colors.violet}33)` }}
        >
          <span className="flex h-[40px] w-[40px] items-center justify-center rounded-[12px]" style={{ background: `linear-gradient(140deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }}>
            <BrandMark width={22} tone="white" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-semibold">{BRAND.name} Plus</span>
            <span className="block text-[14px] text-white/55">{plus ? "Active" : PLUS_PRICE}</span>
          </span>
          {plus ? <CheckIcon size={16} className="text-[#5BE07F]" /> : <ChevronRight className="text-white/40" />}
        </motion.button>

        <List>
          <Row icon={<BellIcon />} label="Notifications" onPress={() => setPage("notifications")} />
          <Row icon={<EyeIcon />} label="Discovery" onPress={() => setPage("discovery")} />
          <Row icon={<CalendarIcon />} label="Dates & calendar" value={settings.calendar?.split(" · ")[0]} onPress={() => setPage("dates")} />
          <Row icon={<LockIcon />} label="Privacy & safety" onPress={() => setPage("privacy")} />
        </List>

        <List>
          <Row icon={<HelpIcon />} label="Terms" onPress={() => setLegal("terms")} />
          <Row icon={<HelpIcon />} label="Privacy policy" onPress={() => setLegal("privacy")} />
          <Row icon={<ReplayIcon />} label="Replay onboarding" onPress={onReplay} />
        </List>

        <List>
          <Row icon={<LogoutIcon className="text-[#FF6961]" />} label="Log out" danger onPress={logOut} />
        </List>
      </div>

      {/* Sub-pages */}
      <AnimatePresence>
        {page && (
          <motion.div
            key={page}
            className="absolute inset-0 z-30 bg-[#0B0A10]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
          >
            <div className="pt-safe px-3">
              <BackButton onPress={() => setPage(null)} />
            </div>
            <div className="no-scrollbar h-full overflow-y-auto px-4 pb-[80px]">
              {page === "notifications" && (
                <SubPage title="Notifications">
                  {NOTIFY.map((n) => (
                    <Row key={n.key} label={n.label} right={<Toggle on={settings.notify[n.key]} label={n.label} onChange={(v) => set({ notify: { ...settings.notify, [n.key]: v } })} />} />
                  ))}
                </SubPage>
              )}
              {page === "discovery" && (
                <SubPage title="Discovery">
                  <Row label="Show me in Today" right={<Toggle on={settings.showOnToday} label="Show me in Today" onChange={(v) => set({ showOnToday: v })} />} />
                  <Row label="Show me on Nearby" right={<Toggle on={nearbyOn} label="Show me on Nearby" onChange={onNearby} />} />
                  <Row label="Distance" value={settings.distance} onPress={() => setDistanceOpen(true)} />
                  <Row label="Ages" value="27–35" />
                  <Row label="Pause my profile" right={<Toggle on={settings.paused} label="Pause my profile" onChange={(v) => set({ paused: v })} />} />
                </SubPage>
              )}
              {page === "dates" && (
                <SubPage title="Dates & calendar">
                  {[...CALENDARS, null].map((c) => (
                    <Row
                      key={c ?? "ask"}
                      label={c ?? "Ask each time"}
                      onPress={() => set({ calendar: c })}
                      right={settings.calendar === c ? <CheckIcon size={16} className="text-[#FF8AA2]" /> : <span />}
                    />
                  ))}
                  <Row label="Share dates with a friend" right={<Toggle on={settings.shareDates} label="Share dates with a friend" onChange={(v) => set({ shareDates: v })} />} />
                </SubPage>
              )}
              {page === "privacy" && (
                <SubPage title="Privacy & safety">
                  <Row label="Hide from people I know" right={<Toggle on={settings.hideFromKnown} label="Hide from people I know" onChange={(v) => set({ hideFromKnown: v })} />} />
                  <Row label="Blocked" value="None" />
                  <Row label="Selfie check" value="Verified" />
                </SubPage>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DistanceSheet open={distanceOpen} value={settings.distance} onChange={(d) => set({ distance: d })} onClose={() => setDistanceOpen(false)} />
      <LegalSheet doc={legal} onClose={() => setLegal(null)} />
      <SystemAlert alert={alert} />
    </div>
  );
}

function SubPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <h1 className="px-2 pt-3 text-[30px] font-bold tracking-[-0.03em]">{title}</h1>
      <List>{children}</List>
    </>
  );
}

function List({ children }: { children: ReactNode }) {
  return <div className="mt-5 overflow-hidden rounded-[22px] border border-white/[0.07] bg-white/[0.04]">{children}</div>;
}

function Row({
  icon,
  label,
  value,
  right,
  danger = false,
  onPress,
}: {
  icon?: ReactNode;
  label: string;
  value?: string;
  right?: ReactNode;
  danger?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <>
      {icon && <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center text-white/75">{icon}</span>}
      <span className={`min-w-0 flex-1 text-[17px] ${danger ? "text-[#FF6961]" : ""}`}>{label}</span>
      {value && <span className="truncate text-[16px] text-white/50">{value}</span>}
      {right}
      {!right && onPress && !danger && <ChevronRight className="shrink-0 text-white/30" />}
    </>
  );
  const cls = "flex min-h-[56px] w-full items-center gap-3 border-b border-white/[0.07] px-4 text-left last:border-b-0";
  return onPress ? (
    <motion.button type="button" onClick={onPress} whileTap={{ backgroundColor: "rgba(255,255,255,0.06)" }} className={cls}>
      {content}
    </motion.button>
  ) : (
    <div className={cls}>{content}</div>
  );
}
