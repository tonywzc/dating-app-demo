"use client";

import { useState } from "react";
import { BRAND } from "@/lib/brand";
import { Sheet } from "@/components/ui/Sheet";

export type LegalDoc = "terms" | "privacy";

// Placeholder copy for the demo; not real legal terms.
const DOCS: Record<LegalDoc, { title: string; updated: string; sections: [string, string][] }> = {
  terms: {
    title: "Terms of Use",
    updated: "Last updated September 2026",
    sections: [
      ["Who can use " + BRAND.name, "You must be 18 or older and able to form a binding contract. One account per person."],
      ["Be real", "Use your own photos and accurate details. Impersonation, catfishing and misleading profiles are removed."],
      ["Be kind", "Harassment, hate speech and unsolicited explicit content aren't allowed. We act on every report."],
      ["Your content", "You own what you post. You give us permission to show it to people you could match with."],
      ["Safety", "Meet in public, tell a friend and use in-app safety tools. We may verify accounts to protect the community."],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated September 2026",
    sections: [
      ["What we collect", "Profile details you provide, the Instagram basics you approve, and how you use " + BRAND.name + "."],
      ["What Instagram sees", "Nothing. Your " + BRAND.name + " activity isn't shared with your Instagram followers or posted to your account."],
      ["How we use it", "To suggest people you may like, keep the community safe and improve the experience."],
      ["Your controls", "Download or delete your data anytime from Settings. Deleting your profile removes it from recommendations immediately."],
    ],
  },
};

export function LegalSheet({ doc, onClose }: { doc: LegalDoc | null; onClose: () => void }) {
  // Keep showing the last doc while the sheet animates closed.
  const [shown, setShown] = useState(doc);
  if (doc && doc !== shown) setShown(doc);
  const content = shown ? DOCS[shown] : null;
  return (
    <Sheet open={doc !== null} onClose={onClose}>
      {content && (
        <>
          <div className="flex items-center justify-between pb-2">
            <span className="w-[60px]" />
            <h2 className="text-[17px] font-semibold">{content.title}</h2>
            <button type="button" onClick={onClose} className="w-[60px] text-right text-[17px] font-semibold text-white active:opacity-50">
              Done
            </button>
          </div>
          <div
            className="no-scrollbar max-h-[520px] overflow-y-auto pb-4"
          >
            <p className="text-[13px] text-white/45">{content.updated}</p>
            {content.sections.map(([heading, body]) => (
              <section key={heading} className="mt-5">
                <h3 className="text-[16px] font-semibold">{heading}</h3>
                <p className="mt-1 text-[15px] leading-[22px] text-white/65">{body}</p>
              </section>
            ))}
          </div>
        </>
      )}
    </Sheet>
  );
}
