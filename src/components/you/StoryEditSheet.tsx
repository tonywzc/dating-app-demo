"use client";

import { useState } from "react";
import type { StoryChapter } from "@/lib/app-data";
import { ARCHIVE_STORIES, CAMERA_ROLL_MEDIA, TOP_STORIES } from "@/lib/mock-data";
import { PhotoPicker } from "@/components/photos/PhotoPicker";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Sheet } from "@/components/ui/Sheet";
import { CloseIcon, ImageIcon, PlusIcon } from "@/components/ui/icons";

const LIBRARY = [...TOP_STORIES, ...ARCHIVE_STORIES, ...CAMERA_ROLL_MEDIA];

/** Edit one chapter of your story: its text and its photo. */
export function StoryEditSheet({ chapter, onSave, onClose }: { chapter: StoryChapter | null; onSave: (c: StoryChapter) => void; onClose: () => void }) {
  // The draft starts from the chapter each time a new one opens, and stays while the sheet animates closed.
  const [opened, setOpened] = useState(chapter);
  const [draft, setDraft] = useState(chapter);
  const [picking, setPicking] = useState(false);
  if (chapter && chapter !== opened) {
    setOpened(chapter);
    setDraft(chapter);
  }

  return (
    <>
      <Sheet open={chapter !== null} onClose={onClose} size="large">
        {draft && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="no-scrollbar -mx-5 min-h-0 flex-1 overflow-y-auto px-5">
              <h2 className="pt-1 text-[24px] font-bold tracking-[-0.02em]">{draft.title}</h2>
              <textarea
                value={draft.text}
                onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                rows={5}
                maxLength={280}
                aria-label={draft.title}
                className="mt-4 w-full resize-none rounded-[20px] border border-white/15 bg-white/[0.06] px-4 py-3 text-[17px] leading-[24px] text-white outline-none focus:border-white/40"
              />
              <div className="mt-3">
                {draft.photo ? (
                  <div className="relative overflow-hidden rounded-[22px]">
                    <Photo src={draft.photo} className="aspect-[4/3] w-full" />
                    <div className="absolute right-2 top-2 flex gap-2">
                      <button type="button" aria-label="Change photo" onClick={() => setPicking(true)} className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-black/55 backdrop-blur">
                        <ImageIcon size={19} />
                      </button>
                      <button
                        type="button"
                        aria-label="Remove photo"
                        onClick={() => setDraft({ ...draft, photo: undefined })}
                        className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-black/55 backdrop-blur"
                      >
                        <CloseIcon size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPicking(true)}
                    className="flex h-[120px] w-full flex-col items-center justify-center gap-2 rounded-[22px] border border-dashed border-white/25 text-[16px] font-medium text-white/65 active:bg-white/5"
                  >
                    <PlusIcon size={22} />
                    Add a photo
                  </button>
                )}
              </div>
            </div>
            <div className="pt-4">
              <Button disabled={!draft.text.trim()} onClick={() => onSave({ ...draft, text: draft.text.trim() })}>
                Save
              </Button>
            </div>
          </div>
        )}
      </Sheet>

      <PhotoPicker
        open={picking}
        title="Choose a photo"
        source={<>Camera roll &amp; stories</>}
        items={LIBRARY}
        limit={1}
        onClose={() => setPicking(false)}
        onAdd={([m]) => {
          setPicking(false);
          if (m && draft) setDraft({ ...draft, photo: m.src });
        }}
      />
    </>
  );
}
