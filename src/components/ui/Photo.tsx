"use client";

import { useState } from "react";

/**
 * A remote photo that degrades to a soft brand gradient (with an initial, if given)
 * when the image can't load, so a missing file never leaves a hole in the layout.
 */
export function Photo({
  src,
  alt = "",
  className = "",
  initial,
  style,
}: {
  src: string;
  alt?: string;
  className?: string;
  /** Letter shown on the fallback, e.g. the person's initial. */
  initial?: string;
  style?: React.CSSProperties;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  if (failed === src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center ${className}`}
        style={{ background: "linear-gradient(145deg, #FF9A6B 0%, #FF4F7B 50%, #6A4BFF 100%)", ...style }}
      >
        {initial && (
          <svg viewBox="0 0 100 100" className="h-[60%] max-h-[120px] w-[60%]">
            <text x="50" y="52" textAnchor="middle" dominantBaseline="middle" fontSize="58" fontWeight="600" fill="rgba(255,255,255,0.9)">
              {initial}
            </text>
          </svg>
        )}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} draggable={false} onError={() => setFailed(src)} className={`object-cover ${className}`} style={style} />
  );
}
