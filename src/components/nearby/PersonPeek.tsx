"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Person } from "@/lib/app-data";
import { Photo } from "@/components/ui/Photo";
import { BookIcon, ChatBubbleIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { HeartIcon } from "@/components/photos/StoryScan";

/** Press and hold a face on the map: an iOS context-menu style preview. */
export function PersonPeek({
  person,
  onClose,
  onSayHi,
  onFullProfile,
}: {
  person: Person | null;
  onClose: () => void;
  onSayHi: () => void;
  onFullProfile: () => void;
}) {
  return (
    <AnimatePresence>
      {person && (
        <motion.div key={person.id} className="absolute inset-0 z-40 flex flex-col items-center justify-center px-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[18px]" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-[290px] overflow-hidden rounded-[28px] bg-[#1C1A24] shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
            initial={{ scale: 0.6, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
          >
            <div className="relative h-[300px]">
              <Photo src={person.photo} alt={person.name} initial={person.name[0]} className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A24] via-transparent to-transparent" />
              <StatusPill person={person} className="absolute left-3 top-3" />
              <div className="absolute inset-x-4 bottom-2">
                <div className="flex items-center gap-[6px] text-[26px] font-bold tracking-[-0.02em]">
                  {person.name}
                  <span className="font-light text-white/85">{person.age}</span>
                  {person.verified && <ShieldCheckIcon size={18} />}
                </div>
                <div className="text-[14px] text-white/65">{person.neighborhood}</div>
              </div>
            </div>
            <div className="px-4 pb-4 pt-2">
              <p className="text-[16px] leading-[22px] text-white/85">&ldquo;{person.nearby?.line}&rdquo;</p>
            </div>
          </motion.div>

          <motion.div
            className="relative mt-3 w-full max-w-[250px] self-center overflow-hidden rounded-[18px] bg-[#2A2832]/90 backdrop-blur-xl"
            initial={{ opacity: 0, y: -8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.05, type: "spring", stiffness: 420, damping: 30 }}
          >
            <MenuRow label="Say hi" icon={<ChatBubbleIcon size={16} />} onPress={onSayHi} />
            <MenuRow label="Full story" icon={<BookIcon size={18} />} onPress={onFullProfile} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MenuRow({ label, icon, onPress }: { label: string; icon?: React.ReactNode; onPress: () => void }) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="flex h-[52px] w-full items-center justify-between border-b border-white/[0.08] px-4 text-left text-[17px] last:border-b-0 active:bg-white/10"
    >
      {label}
      {icon}
    </button>
  );
}

export function StatusPill({ person, className = "" }: { person: Person; className?: string }) {
  const status = person.nearby?.status;
  if (status === "interested")
    return (
      <span className={`flex items-center gap-[6px] rounded-full bg-[#FF3F6E] px-[10px] py-[4px] text-[12px] font-semibold text-white ${className}`}>
        <HeartIcon size={11} color="#fff" />
        Into you
      </span>
    );
  if (status === "chat")
    return (
      <span className={`flex items-center gap-[6px] rounded-full bg-[#34C759] px-[10px] py-[4px] text-[12px] font-semibold text-white ${className}`}>
        <ChatBubbleIcon size={11} />
        Up for a chat
      </span>
    );
  if (person.nearby?.activeNow)
    return <span className={`rounded-full bg-[#34C759] px-[10px] py-[4px] text-[12px] font-semibold text-white ${className}`}>Active now</span>;
  return null;
}
