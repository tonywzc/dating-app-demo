"use client";

import { useState } from "react";
import type { Person } from "@/lib/app-data";
import { Button, TextButton } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Sheet } from "@/components/ui/Sheet";
import { SendIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { StatusPill } from "./PersonPeek";

/** The Nearby profile: short and to the point, with a way to say hi right here. */
export function PersonSheet({
  person,
  chatting,
  onSayHi,
  onOpenChat,
  onFullProfile,
  onClose,
}: {
  person: Person | null;
  chatting: boolean;
  onSayHi: (text: string) => void;
  onOpenChat: () => void;
  onFullProfile: () => void;
  onClose: () => void;
}) {
  // Keep the last person while the sheet animates closed.
  const [shown, setShown] = useState(person);
  if (person && person !== shown) setShown(person);

  return (
    <Sheet open={person !== null} onClose={onClose} size="large">
      {shown && <Body key={shown.id} person={shown} chatting={chatting} onSayHi={onSayHi} onOpenChat={onOpenChat} onFullProfile={onFullProfile} />}
    </Sheet>
  );
}

function hiSuggestions(p: Person) {
  const up = p.nearby?.upFor.toLowerCase() ?? "";
  return [`Hi ${p.name}! ${up.charAt(0).toUpperCase()}${up.slice(1)} sounds fun.`, `Hey! Is the offer still open?`, `Hi ${p.name} 👋`];
}

function Body({
  person,
  chatting,
  onSayHi,
  onOpenChat,
  onFullProfile,
}: {
  person: Person;
  chatting: boolean;
  onSayHi: (text: string) => void;
  onOpenChat: () => void;
  onFullProfile: () => void;
}) {
  const [text, setText] = useState("");
  const suggestions = hiSuggestions(person);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="no-scrollbar -mx-5 min-h-0 flex-1 overflow-y-auto px-5">
        <div className="relative h-[260px] overflow-hidden rounded-[26px]">
          <Photo src={person.photo} alt={person.name} initial={person.name[0]} className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <StatusPill person={person} className="absolute left-3 top-3" />
          <div className="absolute inset-x-4 bottom-3">
            <div className="flex items-center gap-[6px] text-[28px] font-bold tracking-[-0.02em]">
              {person.name}
              <span className="font-light text-white/85">{person.age}</span>
              {person.verified && <ShieldCheckIcon size={18} />}
            </div>
            <div className="text-[14px] text-white/70">
              {person.neighborhood} &middot; {person.distance}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-[5px] text-[14px] font-medium">Up for: {person.nearby?.upFor}</span>
          {person.interests.map((i) => (
            <span key={i} className="rounded-full bg-white/[0.05] px-3 py-[5px] text-[14px] text-white/75">
              {i}
            </span>
          ))}
        </div>
        <p className="mt-4 text-[19px] leading-[27px]" style={{ fontFamily: '"New York", ui-serif, Georgia, serif' }}>
          &ldquo;{person.nearby?.line}&rdquo;
        </p>
        <p className="mt-2 text-[14px] leading-[20px] text-white/55">{person.essence}</p>
        <button type="button" onClick={onFullProfile} className="mt-3 text-[15px] font-semibold text-[#FF8AA2] active:opacity-60">
          Read {person.name}&apos;s full story
        </button>
      </div>

      <div className="pt-4">
        {chatting ? (
          <>
            <Button onClick={onOpenChat}>Open chat</Button>
            <div className="mt-1 flex justify-center">
              <TextButton onClick={onFullProfile} className="text-white/70">
                Full profile
              </TextButton>
            </div>
          </>
        ) : (
          <>
            <div className="no-scrollbar -mx-5 mb-2 flex gap-2 overflow-x-auto px-5">
              {suggestions.map((s) => (
                <button key={s} type="button" onClick={() => setText(s)} className="shrink-0 rounded-full border border-white/15 bg-white/[0.05] px-3 py-[6px] text-[14px] text-white/80 active:bg-white/10">
                  {s}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (text.trim()) onSayHi(text.trim());
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Say hi to ${person.name}…`}
                aria-label={`Message ${person.name}`}
                className="h-[50px] min-w-0 flex-1 rounded-full border border-white/15 bg-white/[0.06] px-5 text-[16px] text-white outline-none placeholder:text-white/35 focus:border-white/40"
              />
              <button
                type="submit"
                aria-label="Send"
                disabled={!text.trim()}
                className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-[#FF3F6E] text-white transition-opacity disabled:opacity-35"
              >
                <SendIcon size={20} />
              </button>
            </form>
            <p className="mt-2 text-center text-[12px] text-white/40">
              {person.nearby?.status === "none" ? `${person.name} sees your hi in their requests.` : `${person.name} already said yes to chatting.`}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
