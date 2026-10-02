"use client";

import { useState } from "react";
import { BRAND } from "@/lib/brand";
import type { NearbyEvent } from "@/lib/app-data";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Sheet } from "@/components/ui/Sheet";
import { CalendarIcon, CheckIcon, PinIcon } from "@/components/ui/icons";
import { MaskGlyph } from "./NearbyMap";

/** An event or a blind date near you. */
export function EventSheet({ event, going, onRsvp, onClose }: { event: NearbyEvent | null; going: boolean; onRsvp: () => void; onClose: () => void }) {
  const [shown, setShown] = useState(event);
  if (event && event !== shown) setShown(event);
  const e = shown;
  const blind = e?.kind === "blind";

  return (
    <Sheet open={event !== null} onClose={onClose}>
      {e && (
        <div className="pt-1">
          <div className="relative h-[170px] overflow-hidden rounded-[24px]">
            <Photo src={e.photo} className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span
              className="absolute left-3 top-3 flex items-center gap-[6px] rounded-full px-[10px] py-[4px] text-[12px] font-bold uppercase tracking-[0.05em] text-white"
              style={{ background: blind ? BRAND.colors.violet : BRAND.colors.rose }}
            >
              {blind ? <MaskGlyph size={14} /> : <CalendarIcon size={13} />}
              {blind ? "Blind date" : "Event"}
            </span>
          </div>
          <h2 className="mt-4 text-[24px] font-bold tracking-[-0.02em]">{e.title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-white/65">
            <span className="flex items-center gap-1">
              <CalendarIcon size={14} /> {e.when}
            </span>
            <span className="flex items-center gap-1">
              <PinIcon size={14} /> {e.where}
            </span>
            <span>{e.detail}</span>
          </div>
          <p className="mt-3 text-[16px] leading-[23px] text-white/85">{e.blurb}</p>
          {e.faces && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex -space-x-2">
                {e.faces.map((f) => (
                  <Photo key={f} src={f} className="h-[28px] w-[28px] rounded-full ring-2 ring-[#1C1B22]" />
                ))}
              </div>
              <span className="text-[14px] text-white/55">going</span>
            </div>
          )}
          <div className="mt-5">
            {going ? (
              <div className="flex h-[54px] items-center justify-center gap-2 rounded-full bg-[#34C759]/15 text-[17px] font-semibold text-[#5BE07F]">
                <CheckIcon size={16} /> {e.hosting ? "You're hosting" : blind ? "Seat saved" : "You're going"}
              </div>
            ) : (
              <Button onClick={onRsvp}>{blind ? "Save my seat" : "I'm going"}</Button>
            )}
          </div>
        </div>
      )}
    </Sheet>
  );
}
