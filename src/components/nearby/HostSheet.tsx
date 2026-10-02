"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { HOST_KINDS } from "@/lib/app-data";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Sheet } from "@/components/ui/Sheet";
import { CheckIcon } from "@/components/ui/icons";

const WHEN = ["Tonight", "Fri", "Sat", "Sun"];
const SIZES = [4, 6, 8, 12];

export type HostPlan = { kind: (typeof HOST_KINDS)[number]; when: string; size: number };

/** Host an event: pick what, when and how many. We invite people nearby who'd get along. */
export function HostSheet({ open, onCreate, onClose }: { open: boolean; onCreate: (plan: HostPlan) => void; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} size="large">
      {open && <Body onCreate={onCreate} />}
    </Sheet>
  );
}

function Body({ onCreate }: { onCreate: (plan: HostPlan) => void }) {
  const [kind, setKind] = useState<HostPlan["kind"]>(HOST_KINDS[0]);
  const [when, setWhen] = useState(WHEN[2]);
  const [size, setSize] = useState(6);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="no-scrollbar -mx-5 min-h-0 flex-1 overflow-y-auto px-5">
        <h2 className="pt-1 text-[24px] font-bold tracking-[-0.02em]">Host an event</h2>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {HOST_KINDS.map((k) => {
            const on = k.id === kind.id;
            return (
              <motion.button
                key={k.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setKind(k)}
                aria-pressed={on}
                className={`relative h-[104px] overflow-hidden rounded-[20px] text-left ring-2 ${on ? "ring-white" : "ring-transparent"}`}
              >
                <Photo src={k.photo} className="absolute inset-0 h-full w-full" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" />
                <span className="absolute bottom-3 left-3 text-[17px] font-semibold">{k.label}</span>
                {on && (
                  <span className="absolute right-2 top-2 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-black">
                    <CheckIcon size={13} />
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        <Segment label="When" options={WHEN} value={when} onChange={setWhen} />
        <Segment label="People" options={SIZES.map(String)} value={String(size)} onChange={(v) => setSize(Number(v))} />
      </div>
      <div className="pt-4">
        <Button onClick={() => onCreate({ kind, when, size })}>Create</Button>
      </div>
    </div>
  );
}

function Segment({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mt-6">
      <div className="text-[13px] font-medium uppercase tracking-[0.06em] text-white/45">{label}</div>
      <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={o === value}
            className={`h-[48px] rounded-full text-[16px] font-semibold transition-colors ${o === value ? "bg-white text-black" : "bg-white/[0.08] text-white/85"}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
