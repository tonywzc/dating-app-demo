"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { PEOPLE, type Message, type Thread } from "@/lib/app-data";
import { CAMERA_ROLL_MEDIA, TOP_STORIES, type Media, type Muse } from "@/lib/mock-data";
import { BackButton } from "@/components/app/PushScreen";
import { MuseAvatar } from "@/components/muse/MuseAvatar";
import { MediaTile, PhotosAppGlyph } from "@/components/photos/MediaTile";
import { PhotoPicker } from "@/components/photos/PhotoPicker";
import { HeartIcon } from "@/components/photos/StoryScan";
import { Photo } from "@/components/ui/Photo";
import { CameraIcon, ImageIcon, PlusIcon, SendIcon, SparkleIcon } from "@/components/ui/icons";
import { CameraCapture } from "./CameraCapture";
import { DateTicket, MuseAsk, MuseBooking, MuseBubble, MuseVenues } from "./PlanMessages";
import type { Chats } from "./useChats";

const LIBRARY: Media[] = [...TOP_STORIES.slice(0, 3), ...CAMERA_ROLL_MEDIA];

/** A conversation. Muse can join to plan a date, ask you both questions, and book it. */
export function ChatThread({
  thread,
  chats,
  muse,
  myName,
  onBack,
  onOpenProfile,
}: {
  thread: Thread;
  chats: Chats;
  muse: Muse;
  myName: string;
  onBack: () => void;
  onOpenProfile: () => void;
}) {
  const p = PEOPLE[thread.personId];
  const [text, setText] = useState("");
  const [menu, setMenu] = useState(false);
  const [picker, setPicker] = useState(false);
  const [camera, setCamera] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const booked = thread.messages.some((m) => m.kind === "museBooked");
  const mutual = thread.status === "mutual";

  // Keep the newest message in view.
  const last = thread.messages[thread.messages.length - 1];
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [thread.messages.length, thread.typing, last]);

  const send = () => {
    if (!text.trim()) return;
    chats.send(thread.id, text.trim());
    setText("");
  };

  const plan = () => {
    setMenu(false);
    chats.startPlan(thread.id);
  };

  const status = mutual ? `Mutual · from ${thread.origin}` : thread.status === "likesYou" ? `Into you · from ${thread.origin}` : "Waiting for a reply";

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0B0A10]">
      {/* Header */}
      <div className="pt-safe relative z-10 border-b border-white/[0.06] bg-[#0B0A10]/90 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-3 pb-2">
          <BackButton onPress={onBack} />
          <button type="button" onClick={onOpenProfile} className="flex min-w-0 flex-1 items-center gap-[10px] text-left">
            <Photo src={p.avatar} initial={p.name[0]} className="h-[38px] w-[38px] rounded-full" />
            <span className="min-w-0">
              <span className="block truncate text-[17px] font-semibold leading-[20px]">{p.name}</span>
              <span className="block truncate text-[12px] text-white/50">{status}</span>
            </span>
          </button>
          {mutual && !thread.planning && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={plan}
              className="flex h-[36px] items-center gap-[6px] rounded-full px-3 text-[14px] font-semibold"
              style={{ background: `linear-gradient(100deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }}
            >
              <SparkleIcon size={13} /> Plan a date
            </motion.button>
          )}
        </div>
        <AnimatePresence>
          {thread.planning && (
            <motion.div
              className="flex items-center gap-2 overflow-hidden px-4 text-[13px] font-medium"
              style={{ background: "linear-gradient(100deg, rgba(255,95,134,0.18), rgba(106,75,255,0.18))" }}
              initial={{ height: 0 }}
              animate={{ height: 36 }}
              exit={{ height: 0 }}
            >
              <MuseAvatar muse={muse} size={18} mood="thinking" />
              {muse.name} is planning a date for you two
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div ref={scroller} className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 pb-4 pt-4">
        <div className="flex flex-col items-center pb-3 pt-2 text-center">
          <Photo src={p.avatar} initial={p.name[0]} className="h-[72px] w-[72px] rounded-full" />
          <div className="mt-2 text-[17px] font-semibold">
            {p.name}, {p.age}
          </div>
          <button type="button" onClick={onOpenProfile} className="text-[13px] font-semibold text-[#FF8AA2]">
            View profile
          </button>
        </div>
        {thread.messages.map((m) => (
          <Bubble key={m.id} m={m} thread={thread} chats={chats} muse={muse} myName={myName} them={p.name} />
        ))}
        <AnimatePresence>
          {thread.typing && (
            <motion.div key="typing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex">
              <span className="flex gap-1 rounded-[20px] rounded-bl-[6px] bg-[#26242E] px-4 py-[14px]">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="h-[7px] w-[7px] rounded-full bg-white/60" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }} />
                ))}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom */}
      <div className="pb-safe relative border-t border-white/[0.06] bg-[#0B0A10] px-3 pt-2">
        {thread.status === "youLiked" ? (
          <p className="px-4 py-3 text-center text-[14px] leading-[20px] text-white/50">
            Your note was delivered. You can chat as soon as {p.name} says yes.
          </p>
        ) : (
          <>
            {thread.status === "likesYou" && (
              <div className="mb-2 flex items-center gap-2 rounded-[18px] bg-white/[0.05] p-2 pl-3">
                <HeartIcon size={14} color="#FF8AA2" />
                <span className="flex-1 text-[14px] text-white/80">{p.name} is into you. Reply to match.</span>
                <button type="button" onClick={() => {
                    chats.remove(thread.id);
                    onBack();
                  }} className="rounded-full px-3 py-[6px] text-[14px] font-medium text-white/60 active:bg-white/10">
                  Not for me
                </button>
                <button type="button" onClick={() => chats.matchBack(thread.id)} className="rounded-full bg-white px-3 py-[6px] text-[14px] font-semibold text-black">
                  Match
                </button>
              </div>
            )}
            {mutual && !thread.planning && !booked && thread.messages.length < 12 && (
              <button
                type="button"
                onClick={plan}
                className="mb-2 flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] py-[6px] pl-[6px] pr-3 text-[14px] text-white/85 active:bg-white/10"
              >
                <MuseAvatar muse={muse} size={22} mood="idle" />
                Let {muse.name} plan your first date
              </button>
            )}
            <form
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <motion.button
                type="button"
                aria-label="More"
                aria-expanded={menu}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMenu((m) => !m)}
                className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-white/[0.1]"
              >
                <motion.span animate={{ rotate: menu ? 45 : 0 }}>
                  <PlusIcon size={20} />
                </motion.span>
              </motion.button>
              <button type="button" aria-label="Camera" onClick={() => setCamera(true)} className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full text-white/80">
                <CameraIcon size={23} />
              </button>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Message"
                aria-label="Message"
                className="h-[40px] min-w-0 flex-1 rounded-full border border-white/15 bg-white/[0.05] px-4 text-[16px] text-white outline-none placeholder:text-white/35 focus:border-white/35"
              />
              <AnimatePresence initial={false}>
                {text.trim() && (
                  <motion.button
                    type="submit"
                    aria-label="Send"
                    initial={{ scale: 0, width: 0 }}
                    animate={{ scale: 1, width: 40 }}
                    exit={{ scale: 0, width: 0 }}
                    className="flex h-[40px] shrink-0 items-center justify-center rounded-full bg-[#FF3F6E]"
                  >
                    <SendIcon size={18} />
                  </motion.button>
                )}
              </AnimatePresence>
            </form>
          </>
        )}

        {/* Attachments menu */}
        <AnimatePresence>
          {menu && (
            <motion.div
              className="absolute bottom-[calc(100%+8px)] left-3 w-[250px] overflow-hidden rounded-[22px] border border-white/10 bg-[#24222C]/95 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 6 }}
              style={{ transformOrigin: "bottom left" }}
              transition={{ type: "spring", stiffness: 480, damping: 32 }}
            >
              <MenuItem icon={<PhotosAppGlyph size={22} />} label="Photos & videos" onPress={() => {
                  setMenu(false);
                  setPicker(true);
                }} />
              <MenuItem icon={<CameraIcon size={20} />} label="Camera" onPress={() => {
                  setMenu(false);
                  setCamera(true);
                }} />
              {mutual && (
                <MenuItem
                  icon={<MuseAvatar muse={muse} size={22} mood="idle" />}
                  label="Plan a date"
                  sub={`${muse.name} asks you both, then books it`}
                  onPress={plan}
                  disabled={thread.planning}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PhotoPicker
        open={picker}
        title="Recents"
        source={
          <>
            <ImageIcon size={15} /> Photos &amp; videos
          </>
        }
        items={LIBRARY}
        limit={4}
        onClose={() => setPicker(false)}
        onAdd={(items) => {
          setPicker(false);
          chats.sendMedia(thread.id, items);
        }}
      />
      <AnimatePresence>
        {camera && (
          <CameraCapture
            key="camera"
            to={p.name}
            onClose={() => setCamera(false)}
            onSend={(media) => {
              setCamera(false);
              chats.sendMedia(thread.id, [media]);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon, label, sub, onPress, disabled = false }: { icon: React.ReactNode; label: string; sub?: string; onPress: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPress}
      className="flex w-full items-center gap-3 border-b border-white/[0.07] px-4 py-[12px] text-left last:border-b-0 active:bg-white/10 disabled:opacity-40"
    >
      <span className="flex h-[26px] w-[26px] items-center justify-center">{icon}</span>
      <span>
        <span className="block text-[16px]">{label}</span>
        {sub && <span className="block text-[12px] text-white/50">{sub}</span>}
      </span>
    </button>
  );
}

function Bubble({ m, thread, chats, muse, myName, them }: { m: Message; thread: Thread; chats: Chats; muse: Muse; myName: string; them: string }) {
  const enter = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { type: "spring" as const, stiffness: 400, damping: 30 } };

  switch (m.kind) {
    case "divider":
      return <div className="py-1 text-center text-[12px] font-medium text-white/40">{m.text}</div>;

    case "text":
      return (
        <motion.div {...enter} className={`flex ${m.from === "me" ? "justify-end pl-12" : "pr-12"}`}>
          <span
            className={`rounded-[20px] px-4 py-[9px] text-[16px] leading-[22px] ${m.from === "me" ? "rounded-br-[6px]" : "rounded-bl-[6px] bg-[#26242E]"}`}
            style={m.from === "me" ? { background: `linear-gradient(120deg, ${BRAND.colors.rose}, ${BRAND.colors.overlap})` } : undefined}
          >
            {m.text}
          </span>
        </motion.div>
      );

    case "note":
      return (
        <motion.div {...enter} className={`flex ${m.from === "me" ? "justify-end pl-10" : "pr-10"}`}>
          <div className="max-w-full overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.05]">
            <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2 text-[12px] font-semibold text-white/55">
              {m.muse ? <MuseAvatar muse={muse} size={16} mood="idle" /> : <HeartIcon size={12} color="#FF8AA2" />}
              {m.muse ? `${muse.name} introduced you` : m.from === "me" ? `You'd like to meet ${them}` : `${them} would like to meet you`}
            </div>
            {m.about && <div className="mx-4 mt-3 border-l-2 border-[#FF8AA2] pl-3 text-[13px] italic leading-[18px] text-white/55">Re: {m.about}</div>}
            <p className="px-4 pb-3 pt-2 text-[16px] leading-[22px]">{m.text}</p>
          </div>
        </motion.div>
      );

    case "media":
      return (
        <motion.div {...enter} className={`flex ${m.from === "me" ? "justify-end" : ""}`}>
          <div className={`grid gap-[3px] overflow-hidden rounded-[20px] ${m.media.length > 1 ? "w-[230px] grid-cols-2" : "w-[200px]"}`}>
            {m.media.map((media) => (
              <div key={media.id} className="aspect-[3/4]">
                <MediaTile media={media} className="h-full w-full" showCaption={false} showSource={false} />
              </div>
            ))}
          </div>
        </motion.div>
      );

    case "muse":
      return (
        <motion.div {...enter}>
          <MuseBubble muse={muse}>{m.text}</MuseBubble>
        </motion.div>
      );

    case "museAsk":
      return (
        <motion.div {...enter}>
          <MuseAsk muse={muse} msg={m} myName={myName} them={them} onAnswer={(answers) => chats.answer(thread.id, m.id, m.step, answers)} />
        </motion.div>
      );

    case "museVenues":
      return (
        <motion.div {...enter}>
          <MuseVenues venues={m.venues} picked={m.picked} them={them} onPick={(v) => chats.pickVenue(thread.id, m.id, v)} />
        </motion.div>
      );

    case "museBooking":
      return (
        <motion.div {...enter}>
          <MuseBooking muse={muse} venue={m.venue} done={m.done} />
        </motion.div>
      );

    case "museBooked":
      return <DateTicket booking={m.booking} them={them} />;
  }
}

