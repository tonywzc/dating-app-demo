"use client";

import { motion } from "motion/react";
import type { Media } from "@/lib/mock-data";
import { InstagramGlyph } from "@/components/ui/InstagramGlyph";

/**
 * A photo or video. Videos play muted and looped like Stories when `playing`;
 * otherwise their poster frame shows. A video without a file falls back to a
 * slow pan over the still.
 */
export function MediaTile({
  media,
  className = "",
  showCaption = true,
  showSource = true,
  playing = true,
}: {
  media: Media;
  className?: string;
  showCaption?: boolean;
  showSource?: boolean;
  playing?: boolean;
}) {
  const video = media.kind === "video";
  return (
    <div className={`relative overflow-hidden bg-neutral-800 ${className}`}>
      {video && media.video && playing ? (
        <video
          src={media.video}
          poster={media.src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <motion.img
          src={media.src}
          alt={media.caption ?? ""}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          animate={video && !media.video && playing ? { scale: [1.04, 1.16], x: ["-2%", "3%"] } : { scale: 1, x: 0 }}
          transition={video && !media.video && playing ? { duration: 7, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" } : { duration: 0.3 }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />

      {video && (
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/45 px-2 py-[3px] text-[11px] font-semibold text-white backdrop-blur-md">
          <svg width="8" height="9" viewBox="0 0 8 9" fill="#fff">
            <path d="M0 0.8v7.4c0 .6.7 1 1.2.7l6.3-3.7c.5-.3.5-1.1 0-1.4L1.2.1C.7-.2 0 .2 0 .8z" />
          </svg>
          {media.duration}
        </span>
      )}

      {showSource && (
        <span className="absolute right-2 top-2 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-black/45 backdrop-blur-md">
          {media.source === "instagram" ? <InstagramGlyph size={12} color="#fff" /> : <PhotosGlyph />}
        </span>
      )}

      {showCaption && media.caption && (
        <span className="absolute bottom-2 left-2 right-2 truncate text-[12px] font-semibold text-white drop-shadow">{media.caption}</span>
      )}
    </div>
  );
}

/** iOS Photos-style flower, for camera-roll items. */
function PhotosGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff">
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={i} cx="12" cy="6.5" rx="3" ry="5" opacity={0.55 + (i % 2) * 0.35} transform={`rotate(${i * 45} 12 12)`} />
      ))}
    </svg>
  );
}

const PETALS = ["#F9C23C", "#F68B3C", "#EE5A6F", "#C04BD8", "#6D5BF2", "#3C9BF0", "#3CC8B4", "#8BD65A"];

/** Multicolor Photos-app flower, for labeling the camera roll as a source. */
export function PhotosAppGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {PETALS.map((color, i) => (
        <ellipse key={i} cx="12" cy="6.5" rx="3" ry="5.2" fill={color} opacity="0.85" transform={`rotate(${i * 45} 12 12)`} />
      ))}
    </svg>
  );
}
