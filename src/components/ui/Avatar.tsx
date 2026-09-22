import type { Account } from "@/lib/mock-data";

const IG_RING = "conic-gradient(from 210deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5, #FEDA75)";

/** Profile photo with an optional Instagram-style story ring. */
export function Avatar({
  account,
  size,
  ring = false,
  ringGap = "#0b0a10",
}: {
  account: Account;
  size: number;
  ring?: boolean;
  /** Color of the gap between ring and photo; match the surface behind it. */
  ringGap?: string;
}) {
  const inner = ring ? size - 8 : size;
  const photo = account.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={account.avatarUrl}
      alt=""
      className="rounded-full object-cover"
      style={{ width: inner, height: inner }}
    />
  ) : (
    <div
      className="flex items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: inner,
        height: inner,
        fontSize: inner * 0.42,
        background: "linear-gradient(145deg, #FF9A6B 0%, #FF4F7B 55%, #B34BFF 100%)",
      }}
    >
      {account.username[0]?.toUpperCase()}
    </div>
  );

  if (!ring) return photo;
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, background: IG_RING }}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: size - 4, height: size - 4, background: ringGap }}
      >
        {photo}
      </div>
    </div>
  );
}
