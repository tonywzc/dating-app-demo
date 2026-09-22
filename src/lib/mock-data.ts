/** The user's own Muse agent, if they've set one up. */
export type Muse = { name: string; avatarUrl?: string };

/** Everyone else talks to the default Muse. */
export const DEFAULT_MUSE: Muse = { name: "Muse" };

export type Account = {
  username: string;
  displayName: string;
  provider: "Instagram";
  /** Optional photo. Without one, the avatar falls back to a monogram. */
  avatarUrl?: string;
  /** Set if the user already has Muse set up; otherwise the default Muse is used. */
  muse?: Muse;
};

export const PRIMARY_ACCOUNT: Account = {
  username: "tonywzcwzc",
  displayName: "Tony",
  provider: "Instagram",
};

/** Other Instagram accounts offered by "Use another Instagram account" (mock, no sign-in). */
export const OTHER_ACCOUNTS: Account[] = [
  { username: "tony.cooks", displayName: "Tony", provider: "Instagram" },
  { username: "tonywzc.photo", displayName: "Tony", provider: "Instagram" },
];

const unsplash = (id: string, w = 360, h = 460) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=70`;

/** Camera-roll style photos for the photo-permission preview. */
export const CAMERA_ROLL = [
  "1545389336-cf090694435e",
  "1506869640319-fe1a24fd76dc",
  "1528605248644-14dd04022da1",
].map((id) => unsplash(id, 200, 260));

export type MetaSource = "instagram" | "facebook";

export type ProfileField = {
  id: string;
  label: string;
  /** Empty means the user still needs to add it. */
  value: string;
  source?: MetaSource;
  kind: "text" | "date" | "choice";
  options?: string[];
  required?: boolean;
  placeholder?: string;
};

/** "About you", prefilled from the user's Meta accounts (mocked). */
export const PROFILE_PREFILL: { basics: ProfileField[]; life: ProfileField[]; interests: string[] } = {
  basics: [
    { id: "name", label: "First name", value: "Tony", source: "instagram", kind: "text" },
    { id: "birthday", label: "Birthday", value: "1995-06-03", source: "facebook", kind: "date" },
    {
      id: "gender",
      label: "Gender",
      value: "",
      kind: "choice",
      options: ["Man", "Woman", "Nonbinary", "Another gender"],
      required: true,
    },
  ],
  life: [
    { id: "location", label: "Lives in", value: "San Francisco, CA", source: "facebook", kind: "text" },
    { id: "work", label: "Work", value: "Product at Meta", source: "facebook", kind: "text" },
    { id: "school", label: "Education", value: "UC Berkeley", source: "facebook", kind: "text" },
    { id: "languages", label: "Languages", value: "English", source: "facebook", kind: "text" },
  ],
  /** Inferred from accounts followed on Instagram. */
  interests: ["Hiking", "Coffee", "Photography", "Travel", "Live music"],
};

/** Couple memories used by the launch animation (Unsplash, free license). */
export const MEMORY_PHOTOS = [
  "1501901609772-df0848060b33",
  "1474552226712-ac0f0961a954",
  "1529634806980-85c3dd6d34ac",
  "1511988617509-a57c8a288659",
  "1494774157365-9e04c6720e47",
  "1583939003579-730e3918a45a",
  "1532712938310-34cb3982ef74",
  "1520854221256-17451cc331bf",
  "1541250848049-b4f7141dca3f",
  "1516589178581-6cd7833ae3b2",
].map((id) => unsplash(id));
