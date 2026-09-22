"use client";

import { useState } from "react";
import type { ProfileField } from "@/lib/mock-data";
import { Button, TextButton } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";

const SOURCE_NAME = { instagram: "Instagram", facebook: "Facebook" } as const;

export type EditTarget = { field: ProfileField; hint?: string } | { interest: true };

export function EditFieldSheet({
  target,
  onSave,
  onClose,
}: {
  target: EditTarget | null;
  onSave: (value: string) => void;
  onClose: () => void;
}) {
  // Keep showing the last target while the sheet animates closed.
  const [shown, setShown] = useState(target);
  if (target && target !== shown) setShown(target);

  return (
    <Sheet open={target !== null} onClose={onClose}>
      {shown && <Editor key={"field" in shown ? shown.field.id : "interest"} target={shown} onSave={onSave} onClose={onClose} />}
    </Sheet>
  );
}

function Editor({ target, onSave, onClose }: { target: EditTarget; onSave: (v: string) => void; onClose: () => void }) {
  const field = "field" in target ? target.field : null;
  const hint = "field" in target ? target.hint : undefined;
  const [value, setValue] = useState(field?.value ?? "");
  const title = field ? (field.value ? `Edit ${field.label.toLowerCase()}` : `Add ${field.label.toLowerCase()}`) : "Add an interest";
  const canSave = value.trim().length > 0;
  const save = () => canSave && onSave(value.trim());

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <h2 className="text-center text-[20px] font-bold tracking-[-0.02em]">{title}</h2>
      {hint && <p className="mt-1 text-center text-[14px] text-[#FF8AA2]">{hint}</p>}

      <div className="mt-5">
        {field?.kind === "choice" ? (
          <div className="overflow-hidden rounded-[20px] bg-white/[0.06]">
            {field.options!.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setValue(option)}
                className="flex w-full items-center justify-between border-b border-white/[0.07] px-4 py-[14px] text-left text-[17px] last:border-b-0 active:bg-white/5"
              >
                {option}
                <span
                  className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.5px] ${
                    value === option ? "border-white bg-white" : "border-white/30"
                  }`}
                >
                  {value === option && <span className="h-[8px] w-[8px] rounded-full bg-ink" />}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <input
            autoFocus
            type={field?.kind === "date" ? "date" : "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={field?.placeholder ?? (field ? field.label : "e.g. Pottery, Salsa, Board games")}
            className="h-[56px] w-full rounded-[16px] border border-white/15 bg-white/[0.06] px-4 text-[17px] text-white outline-none [color-scheme:dark] placeholder:text-white/35 focus:border-white/40"
          />
        )}
      </div>

      {field?.source && (
        <p className="mt-3 px-1 text-[13px] leading-[18px] text-white/45">
          From {SOURCE_NAME[field.source]}. Changing it here won&apos;t change your {SOURCE_NAME[field.source]} profile.
        </p>
      )}

      <div className="mt-5">
        <Button type="submit" disabled={!canSave}>
          Save
        </Button>
        <div className="mt-1 flex justify-center">
          <TextButton onClick={onClose} className="text-white/70">
            Cancel
          </TextButton>
        </div>
      </div>
    </form>
  );
}
