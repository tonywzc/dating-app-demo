/** Facebook "f" logo in its blue circle. */
export function FacebookGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Facebook" role="img">
      <circle cx="12" cy="12" r="12" fill="#0866FF" />
      <path
        fill="#fff"
        d="M16.7 15.5l.5-3.5h-3.3V9.8c0-1 .5-1.9 2-1.9h1.5V4.9s-1.4-.2-2.7-.2c-2.8 0-4.6 1.7-4.6 4.7V12H7v3.5h3.1V24c.6.1 1.3.1 1.9.1s1.3 0 1.9-.1v-8.5h2.8z"
      />
    </svg>
  );
}
