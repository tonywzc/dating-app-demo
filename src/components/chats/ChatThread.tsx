"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { PEOPLE, type Message, type Thread } from "@/lib/app-data";
import { CAMERA_ROLL_MEDIA, TOP_STORIES, type Media, type Muse } from "@/lib/mock-data";
import { BackButton } from "@/components/app/PushScreen";
import { MediaTile, PhotosAppGlyph } from "@/components/photos/MediaTile";
import { PhotoPicker } from "@/components/photos/PhotoPicker";
import { HeartIcon } from "@/components/photos/StoryScan";
import { Photo } from "@/components/ui/Photo";
import { CalendarIcon, CameraIcon, ImageIcon, PlusIcon, SendIcon } from "@/components/ui/icons";
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
  onPlanDate,
}: {
  thread: Thread;
  chats: Chats;
  muse: Muse;
  myName: string;
  onBack: () => void;
  onOpenProfile: () => void;
  /** Start Muse's date planning (the caller checks Plus). */
  onPlanDate: () => void;
}) {
  const p = PEOPLE[thread.personId];
  const [text, setText] = useState("");
  const [menu, setMenu] = useState(false);
  const [picker, setPicker] = useState(false);
  const [camera, setCamera] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const mutual = thread.status === "mutual";
  const saidSomething = thread.messages.some((m) => "from" in m && m.from === "me");
  // Before they say yes, you get one first message.
  const waiting = thread.status === "youLiked" && saidSomething;
  const suggestions = saidSomething || thread.planning ? [] : p.openers;

  // Keep the newest message in view.
  const last = thread.messages[thread.messages.length - 1];
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [thread.messages.length, thread.typing, last]);

  const send = (value: string) => {
    if (!value.trim()) return;
    chats.send(thread.id, value.trim());
    setText("");
  };

  const plan = () => {
    setMenu(false);
    onPlanDate();
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0B0A10]">
      {/* Header */}
      <div className="pt-safe relative z-10 border-b border-white/[0.06] bg-[#0B0A10]/90 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-3 pb-2">
          <BackButton onPress={onBack} />
          <button type="button" onClick={onOpenProfile} className="flex min-h-[44px] min-w-0 flex-1 items-center gap-[10px] text-left">
            <Photo src={p.avatar} initial={p.name[0]} className="h-[40px] w-[40px] rounded-full" />
            <span className="truncate text-[18px] font-semibold">{p.name}</span>
            {mutual && <HeartIcon size={14} color="#FF8AA2" />}
          </button>
        </div>
        <AnimatePresence>
          {thread.planning && (
            <motion.div
              className="flex items-center justify-center gap-2 overflow-hidden text-[14px] font-medium"
              style={{ background: "linear-gradient(100deg, rgba(255,95,134,0.18), rgba(106,75,255,0.18))" }}
              initial={{ height: 0 }}
              animate={{ height: 36 }}
              exit={{ height: 0 }}
            >
              <CalendarIcon size={15} /> Planning your date
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div ref={scroller} className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 pb-4 pt-6">
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

        {/* Suggested first messages: faint bubbles, one tap sends */}
        {suggestions.length > 0 && (
          <div className="space-y-2 pt-2">
            {suggestions.map((s, i) => (
              <motion.button
                key={s}
                type="button"
                onClick={() => send(s)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                whileTap={{ scale: 0.97 }}
                className="ml-auto flex max-w-[84%] items-center gap-2 rounded-[20px] rounded-br-[6px] border border-dashed border-white/25 bg-white/[0.04] py-[10px] pl-4 pr-3 text-left text-[16px] leading-[22px] text-white/55 active:bg-white/10"
              >
                {s}
                <SendIcon size={15} className="shrink-0 text-white/40" />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Composer: text on the left, camera and more on the right */}
      <div className="pb-safe relative border-t border-white/[0.06] bg-[#0B0A10] px-3 pt-2">
        {waiting ? (
          <div className="flex h-[48px] items-center justify-center gap-2 text-[15px] text-white/50">
            <HeartIcon size={13} color="#FF8AA2" /> Waiting for {p.name}
          </div>
        ) : (
          <>
            {thread.status === "likesYou" && (
              <div className="mb-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    chats.remove(thread.id);
                    onBack();
                  }}
                  className="h-[48px] rounded-full bg-white/10 text-[16px] font-semibold"
                >
                  Pass
                </button>
                <button type="button" onClick={() => chats.matchBack(thread.id)} className="flex h-[48px] items-center justify-center gap-2 rounded-full bg-white text-[16px] font-semibold text-black">
                  <HeartIcon size={14} /> Match
                </button>
              </div>
            )}
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(text);
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Message"
                aria-label="Message"
                className="h-[48px] min-w-0 flex-1 rounded-full border border-white/15 bg-white/[0.05] px-5 text-[16px] text-white outline-none placeholder:text-white/35 focus:border-white/35"
              />
              {/* All composer buttons sit to the right of the text field. */}
              {text.trim() ? (
                <motion.button
                  type="submit"
                  aria-label="Send"
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-[#FF3F6E]"
                >
                  <SendIcon size={20} />
                </motion.button>
              ) : (
                <>
                  <motion.button
                    type="button"
                    aria-label="More"
                    aria-expanded={menu}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMenu((m) => !m)}
                    className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-white/[0.08]"
                  >
                    <motion.span animate={{ rotate: menu ? 45 : 0 }}>
                      <PlusIcon size={22} />
                    </motion.span>
                  </motion.button>
                  {mutual && (
                    <motion.button
                      type="button"
                      aria-label="Plan a date"
                      whileTap={{ scale: 0.92 }}
                      disabled={thread.planning}
                      onClick={plan}
                      className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full transition-opacity disabled:opacity-40"
                      style={{ background: `linear-gradient(135deg, ${BRAND.colors.rose}, ${BRAND.colors.violet})` }}
                    >
                      <CalendarIcon size={20} />
                    </motion.button>
                  )}
                </>
              )}
            </form>
          </>
        )}

        {/* More menu */}
        <AnimatePresence>
          {menu && (
            <motion.div
              className="absolute bottom-[calc(100%+8px)] right-3 w-[230px] overflow-hidden rounded-[22px] border border-white/10 bg-[#24222C]/95 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 6 }}
              style={{ transformOrigin: "bottom right" }}
              transition={{ type: "spring", stiffness: 480, damping: 32 }}
            >
              <MenuItem
                icon={<PhotosAppGlyph size={22} />}
                label="Photos & videos"
                onPress={() => {
                  setMenu(false);
                  setPicker(true);
                }}
              />
              <MenuItem
                icon={<CameraIcon size={21} />}
                label="Camera"
                onPress={() => {
                  setMenu(false);
                  setCamera(true);
                }}
              />
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

function MenuItem({ icon, label, onPress, disabled = false }: { icon: React.ReactNode; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPress}
      className="flex h-[54px] w-full items-center gap-3 border-b border-white/[0.07] px-4 text-left last:border-b-0 active:bg-white/10 disabled:opacity-40"
    >
      <span className="flex h-[26px] w-[26px] items-center justify-center">{icon}</span>
      <span className="text-[17px]">{label}</span>
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
        <motion.div {...enter} className="flex items-end gap-2 pr-12">
          <span className="rounded-[20px] rounded-bl-[6px] bg-[#26242E] px-4 py-[9px] text-[16px] leading-[22px]">
            <HeartIcon size={12} color="#FF8AA2" /> {m.text}
          </span>
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

