"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CAMERA_ROLL_MEDIA, PROFILE_PHOTO, TOP_STORIES, type Media } from "@/lib/mock-data";
import { MediaTile } from "@/components/photos/MediaTile";
import { CloseIcon, SendIcon } from "@/components/ui/icons";

type Mode = "photo" | "video";

// The viewfinder is simulated: the back camera looks at a coffee, the front one at you.
const BACK = CAMERA_ROLL_MEDIA.find((m) => m.id === "cam-coffee")!.src;
const FRONT = PROFILE_PHOTO;
const CLIP = TOP_STORIES.find((s) => s.kind === "video")!;

/** In-chat camera: take a photo or record a short video, then send it. */
export function CameraCapture({ to, onSend, onClose }: { to: string; onSend: (media: Media) => void; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("photo");
  const [front, setFront] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [flash, setFlash] = useState(0);
  const [shot, setShot] = useState<Media | null>(null);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const shutter = () => {
    if (mode === "photo") {
      setFlash((f) => f + 1);
      setTimeout(() => setShot({ id: `cam-${Date.now()}`, src: front ? FRONT : BACK, kind: "photo", source: "camera" }), 180);
    } else if (!recording) {
      setSeconds(0);
      setRecording(true);
    } else {
      setRecording(false);
      setShot({ ...CLIP, id: `vid-${Date.now()}`, source: "camera", duration: `0:${String(Math.max(seconds, 1)).padStart(2, "0")}` });
    }
  };

  return (
    <motion.div className="absolute inset-0 z-50 bg-black" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 380, damping: 40 }}>
      {/* Viewfinder or the capture */}
      <div className="absolute inset-x-0 top-0 bottom-[190px] overflow-hidden rounded-b-[28px] bg-neutral-900">
        {shot ? (
          <MediaTile media={shot} className="h-full w-full" showSource={false} showCaption={false} />
        ) : (
          <motion.img
            key={front ? "front" : "back"}
            src={front ? FRONT : BACK}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ scaleX: front ? -1 : 1 }}
            initial={{ opacity: 0, filter: "blur(12px)" }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: [1, 1.025, 1] }}
            transition={{ opacity: { duration: 0.3 }, filter: { duration: 0.3 }, scale: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
          />
        )}
        <AnimatePresence>
          {flash > 0 && (
            <motion.div key={flash} className="absolute inset-0 bg-white" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.35 }} />
          )}
        </AnimatePresence>

        <div className="pt-safe absolute inset-x-0 top-0 flex items-center justify-between px-4">
          <button type="button" aria-label="Close camera" onClick={onClose} className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-black/40 backdrop-blur">
            <CloseIcon size={14} />
          </button>
          {recording && (
            <span className="flex items-center gap-2 rounded-full bg-[#FF3B30] px-3 py-[4px] text-[14px] font-semibold tabular-nums">
              <motion.span className="h-[8px] w-[8px] rounded-full bg-white" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }} />
              0:{String(seconds).padStart(2, "0")}
            </span>
          )}
          <span className="w-[40px]" />
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-3 py-[4px] text-[13px] font-medium backdrop-blur">
          To {to}
        </div>
      </div>

      {/* Controls */}
      <div className="pb-safe absolute inset-x-0 bottom-0 flex h-[190px] flex-col items-center justify-end">
        {shot ? (
          <div className="flex w-full items-center justify-between px-8 pb-6">
            <button type="button" onClick={() => setShot(null)} className="text-[17px] font-medium text-white/85">
              Retake
            </button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => onSend(shot)}
              className="flex h-[56px] items-center gap-2 rounded-full bg-[#FF3F6E] pl-6 pr-5 text-[17px] font-semibold"
            >
              Send <SendIcon size={18} />
            </motion.button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex gap-6 text-[13px] font-semibold uppercase tracking-[0.08em]">
              {(["video", "photo"] as Mode[]).map((m) => (
                <button key={m} type="button" disabled={recording} onClick={() => setMode(m)} className={mode === m ? "text-[#FFD60A]" : "text-white/70"}>
                  {m}
                </button>
              ))}
            </div>
            <div className="flex w-full items-center justify-between px-10 pb-5">
              <span className="w-[46px]" aria-hidden />
              <motion.button
                type="button"
                aria-label={mode === "photo" ? "Take photo" : recording ? "Stop recording" : "Record video"}
                whileTap={{ scale: 0.92 }}
                onClick={shutter}
                className="flex h-[78px] w-[78px] items-center justify-center rounded-full border-[4px] border-white"
              >
                <motion.span
                  className="block"
                  animate={
                    mode === "photo"
                      ? { width: 62, height: 62, borderRadius: 31, background: "#fff" }
                      : recording
                        ? { width: 30, height: 30, borderRadius: 7, background: "#FF3B30" }
                        : { width: 62, height: 62, borderRadius: 31, background: "#FF3B30" }
                  }
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                />
              </motion.button>
              <motion.button
                type="button"
                aria-label="Flip camera"
                whileTap={{ rotate: 180 }}
                onClick={() => setFront((f) => !f)}
                disabled={recording}
                className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white/15"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 11a8 8 0 00-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0014.3 4.9L20 16M20 20v-4h-4" />
                </svg>
              </motion.button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
