"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CAMERA_ROLL_MEDIA, type Media } from "@/lib/mock-data";
import { Sheet } from "@/components/ui/Sheet";
import { MediaTile, PhotosAppGlyph } from "./MediaTile";

/** Mock iOS-style photo picker over the camera roll. */
export function PhotoPicker({
  open,
  limit,
  exclude,
  onAdd,
  onClose,
}: {
  open: boolean;
  limit: number;
  exclude: string[];
  onAdd: (items: Media[]) => void;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose}>
      {/* Remount on every open so selections start fresh */}
      {open && <PickerBody key={String(open)} limit={limit} exclude={exclude} onAdd={onAdd} onClose={onClose} />}
    </Sheet>
  );
}

function PickerBody({
  limit,
  exclude,
  onAdd,
  onClose,
}: {
  limit: number;
  exclude: string[];
  onAdd: (items: Media[]) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<Media[]>([]);
  const items = CAMERA_ROLL_MEDIA.filter((m) => !exclude.includes(m.id));

  const toggle = (m: Media) =>
    setSelected((list) => {
      if (list.some((x) => x.id === m.id)) return list.filter((x) => x.id !== m.id);
      return list.length < limit ? [...list, m] : list;
    });

  return (
    <div>
      <div className="flex items-center justify-between pb-3">
        <button type="button" onClick={onClose} className="w-[70px] text-left text-[17px] text-white/70 active:opacity-50">
          Cancel
        </button>
        <h2 className="text-[17px] font-semibold">Add moments</h2>
        <button
          type="button"
          disabled={!selected.length}
          onClick={() => onAdd(selected)}
          className="w-[70px] text-right text-[17px] font-semibold text-[#0A84FF] disabled:text-white/25"
        >
          {selected.length ? `Add (${selected.length})` : "Add"}
        </button>
      </div>

      <div className="flex items-center gap-2 px-1 text-[13px] font-medium text-white/55">
        <PhotosAppGlyph size={15} />
        Camera roll &middot; Recents
      </div>

      <div className="no-scrollbar mt-3 grid max-h-[430px] grid-cols-3 gap-[3px] overflow-y-auto overflow-x-hidden rounded-[14px]">
        {items.map((m) => {
          const index = selected.findIndex((x) => x.id === m.id);
          return (
            <motion.button
              key={m.id}
              type="button"
              onClick={() => toggle(m)}
              whileTap={{ scale: 0.96 }}
              className="relative aspect-square"
              aria-label={index >= 0 ? "Deselect" : "Select"}
              aria-pressed={index >= 0}
            >
              <MediaTile media={m} className="h-full w-full" showSource={false} showCaption={false} playing={false} />
              {index >= 0 && <span className="absolute inset-0 bg-white/15" />}
              <span
                className={`absolute bottom-[6px] right-[6px] flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.5px] text-[12px] font-bold ${
                  index >= 0 ? "border-white bg-[#0A84FF] text-white" : "border-white/80 bg-black/20"
                }`}
              >
                {index >= 0 && index + 1}
              </span>
            </motion.button>
          );
        })}
      </div>
      <p className="px-1 pb-2 pt-3 text-center text-[12px] text-white/40">
        Pick up to {limit}. Only what you add is shared.
      </p>
    </div>
  );
}
