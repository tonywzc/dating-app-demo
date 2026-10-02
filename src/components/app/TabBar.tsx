"use client";

import { motion } from "motion/react";
import { ChatsTabIcon, NearbyTabIcon, TodayTabIcon, YouTabIcon } from "@/components/ui/icons";

export type Tab = "today" | "nearby" | "chats" | "you";

export const TABS: { id: Tab; label: string; Icon: (p: { active: boolean }) => React.ReactNode }[] = [
  { id: "today", label: "Today", Icon: TodayTabIcon },
  { id: "nearby", label: "Nearby", Icon: NearbyTabIcon },
  { id: "chats", label: "Chats", Icon: ChatsTabIcon },
  { id: "you", label: "You", Icon: YouTabIcon },
];

/** iOS 26-style floating glass tab bar. */
export function TabBar({ tab, onSelect, badges }: { tab: Tab; onSelect: (tab: Tab) => void; badges: Partial<Record<Tab, number | "dot">> }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-[18px]" style={{ paddingBottom: "max(calc(var(--safe-bottom) - 8px), 10px)" }}>
      <nav
        className="pointer-events-auto relative flex h-[62px] items-center rounded-full border border-white/[0.12] px-[6px] shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        style={{ background: "rgba(28,26,36,0.72)", backdropFilter: "blur(24px) saturate(1.6)", WebkitBackdropFilter: "blur(24px) saturate(1.6)" }}
      >
        {TABS.map(({ id, label, Icon }) => {
          const active = id === tab;
          const badge = badges[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className="relative flex h-[52px] flex-1 flex-col items-center justify-center"
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-white/[0.12]"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span className={`relative transition-colors ${active ? "text-[#FF8AA2]" : "text-white/75"}`}>
                <Icon active={active} />
                {badge !== undefined && badge !== 0 && (
                  <span
                    className={`absolute -right-[7px] -top-[3px] flex items-center justify-center rounded-full bg-[#FF3F6E] text-[11px] font-bold text-white ring-2 ring-[#1C1A24] ${
                      badge === "dot" ? "h-[10px] w-[10px]" : "h-[18px] min-w-[18px] px-[5px]"
                    }`}
                  >
                    {badge === "dot" ? "" : badge}
                  </span>
                )}
              </span>
              <span className={`relative mt-[1px] text-[10px] font-semibold ${active ? "text-[#FF8AA2]" : "text-white/70"}`}>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/** Space to leave under scrolling content so it clears the tab bar. */
export const TAB_BAR_SPACE = "calc(max(var(--safe-bottom) - 8px, 10px) + 62px)";
