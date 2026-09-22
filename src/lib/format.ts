/** Age today from an ISO date (yyyy-mm-dd). */
export function ageFrom(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  if (now < new Date(now.getFullYear(), date.getMonth(), date.getDate())) age -= 1;
  return age;
}

/** "June 3, 1995 · 31" from an ISO date (yyyy-mm-dd). */
export function formatBirthday(iso: string, withAge = false) {
  if (!iso) return "";
  const label = new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return withAge ? `${label} · ${ageFrom(iso)}` : label;
}
