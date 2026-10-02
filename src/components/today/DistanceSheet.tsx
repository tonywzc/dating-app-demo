"use client";

import { Sheet } from "@/components/ui/Sheet";
import { CheckIcon } from "@/components/ui/icons";

export const DISTANCES = ["5 km", "10 km", "25 km", "Anywhere"];

/** How far Today looks for your introductions. Distances themselves are never shown on profiles. */
export function DistanceSheet({ open, value, onChange, onClose }: { open: boolean; value: string; onChange: (v: string) => void; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="pt-1 text-center text-[22px] font-bold tracking-[-0.02em]">Introduce me to people within</h2>
      <div className="mt-5 overflow-hidden rounded-[20px] bg-white/[0.06]">
        {DISTANCES.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => {
              onChange(d);
              onClose();
            }}
            className="flex h-[56px] w-full items-center justify-between border-b border-white/[0.07] px-5 text-left text-[17px] last:border-b-0 active:bg-white/5"
          >
            {d}
            {d === value && <CheckIcon size={16} className="text-[#FF8AA2]" />}
          </button>
        ))}
      </div>
      <div className="h-3" />
    </Sheet>
  );
}
