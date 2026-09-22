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

export type Media = {
  id: string;
  src: string;
  kind: "photo" | "video";
  /** Videos are mocked with a slow pan over a still; this is the label shown. */
  duration?: string;
  source: "instagram" | "camera";
  /** Title Muse wrote for it; the user can edit it. */
  caption?: string;
};

/** An expired Instagram Story from the user's archive. */
export type Story = Media & { likes: number; postedAt: string; caption: string };

const media = (id: string, rest: Omit<Media, "id" | "src">): Media => ({ id, src: unsplash(id, 480, 800), ...rest });
const story = (id: string, rest: Omit<Story, "id" | "src" | "source">): Story => ({ id, src: unsplash(id, 480, 800), source: "instagram", ...rest });

/** Profile photo, brought over from Instagram. */
export const PROFILE_PHOTO = unsplash("1507003211169-0a1dd7228f2d", 600, 800);

/** The user's most-loved expired Stories, as Muse ranks them. Titles are Muse's. */
export const TOP_STORIES: Story[] = [
  story("1501555088652-021faa106b9b", { kind: "video", duration: "0:12", likes: 214, postedAt: "Aug 17", caption: "Up early for the Marin hike" }),
  story("1612874742237-6526221588e3", { kind: "photo", likes: 186, postedAt: "Sep 6", caption: "Fresh pasta, attempt #4" }),
  story("1556910103-1c02745aae4d", { kind: "video", duration: "0:08", likes: 171, postedAt: "Jul 28", caption: "Cooking for the crew" }),
  story("1565299585323-38d6b0865b47", { kind: "photo", likes: 142, postedAt: "Aug 17", caption: "Tacos after the trail" }),
  story("1519861531473-9200262188bf", { kind: "video", duration: "0:06", likes: 97, postedAt: "Sep 11", caption: "Thursday hoops" }),
  story("1501594907352-04cda38ebc29", { kind: "photo", likes: 88, postedAt: "Jun 30", caption: "Golden hour at the bridge" }),
];

/** How many of the top stories Muse pre-selects. */
export const PRESELECTED_STORIES = 4;

/** Other archived Stories (filler for Muse's scan). */
export const OTHER_STORIES: Media[] = [
  media("1551632811-561732d1e306", { kind: "photo", source: "instagram" }),
  media("1556761223-4c4282c73f77", { kind: "photo", source: "instagram" }),
  media("1529543544282-ea669407fca3", { kind: "photo", source: "instagram" }),
  media("1519681393784-d120267933ba", { kind: "video", duration: "0:15", source: "instagram" }),
  media("1551504734-5ee1c4a1479b", { kind: "photo", source: "instagram" }),
  media("1464822759023-fed622ff2c3b", { kind: "photo", source: "instagram" }),
];

/** The camera roll, for adding moments that were never a Story. Muse titles these too. */
export const CAMERA_ROLL_MEDIA: Media[] = [
  media("1495474472287-4d71bcdd2085", { kind: "photo", source: "camera", caption: "Coffee first, always" }),
  media("1464278533981-50106e6176b1", { kind: "video", duration: "0:21", source: "camera", caption: "Quiet lake morning" }),
  media("1507048331197-7d4ac70811cf", { kind: "photo", source: "camera", caption: "Sunday prep" }),
  media("1483721310020-03333e577078", { kind: "video", duration: "0:06", source: "camera", caption: "Laces tied, let's go" }),
  media("1517457373958-b7bdd4587205", { kind: "photo", source: "camera", caption: "Long dinners outside" }),
  media("1452587925148-ce544e77e70d", { kind: "photo", source: "camera", caption: "Film camera phase" }),
  media("1509042239860-f550ce710b93", { kind: "photo", source: "camera", caption: "Latte art attempt" }),
  media("1449034446853-66c86144b0ad", { kind: "photo", source: "camera", caption: "Weekend in the city" }),
  media("1556761223-4c4282c73f77", { kind: "photo", source: "camera", caption: "The perfect twirl" }),
];

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

/** "About you", prefilled from the user's Meta accounts (mocked). Every field is filled so the happy path is one tap. */
export const PROFILE_PREFILL: { basics: ProfileField[]; life: ProfileField[]; interests: string[] } = {
  basics: [
    { id: "name", label: "First name", value: "Tony", source: "instagram", kind: "text" },
    { id: "birthday", label: "Birthday", value: "1995-06-03", source: "facebook", kind: "date" },
    {
      id: "gender",
      label: "Gender",
      value: "Man",
      source: "facebook",
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
