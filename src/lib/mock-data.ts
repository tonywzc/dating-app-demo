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
  /** Photo, or the poster frame for a video. */
  src: string;
  kind: "photo" | "video";
  /** Playable file for videos (vertical, 9:16). */
  video?: string;
  duration?: string;
  source: "instagram" | "camera";
  /** Title Muse wrote for it; the user can edit it. */
  caption?: string;
};

/** An expired Instagram Story from the user's archive. */
export type Story = Media & { likes: number; postedAt: string; caption: string };

// Story media is from Pexels (free license). Tony is played by one model throughout
// (the white-tee kitchen series by Vlada Karpovich), so he looks consistent everywhere.
const pexelsPhoto = (id: number, w = 540, h = 960) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;
const pexelsPoster = (id: number, file: string) =>
  `https://images.pexels.com/videos/${id}/${file}?auto=compress&cs=tinysrgb&w=540&h=960&fit=crop`;
const pexelsVideo = (id: number, file: string) => `https://videos.pexels.com/video-files/${id}/${id}-${file}.mp4`;

type StoryInfo = Pick<Story, "likes" | "postedAt" | "caption">;

const photoStory = (id: number, info: StoryInfo): Story => ({
  id: `px-${id}`,
  src: pexelsPhoto(id),
  kind: "photo",
  source: "instagram",
  ...info,
});

const videoStory = (id: number, poster: string, file: string, duration: string, info: StoryInfo): Story => ({
  id: `px-${id}`,
  src: pexelsPoster(id, poster),
  video: pexelsVideo(id, file),
  kind: "video",
  duration,
  source: "instagram",
  ...info,
});

/** Profile photo, brought over from Instagram. */
export const PROFILE_PHOTO = pexelsPhoto(6947058, 800, 1000);

/** The user's most-loved expired Stories, as Muse ranks them. Titles are Muse's. */
export const TOP_STORIES: Story[] = [
  videoStory(6998504, "cooking-cooking-man-cooking-time-dough-6998504.jpeg", "sd_540_960_25fps", "0:07", {
    likes: 231,
    postedAt: "Aug 24",
    caption: "Sunday pancakes for the crew",
  }),
  photoStory(36587729, { likes: 214, postedAt: "Aug 17", caption: "Marin Headlands, before the crowds" }),
  videoStory(6289336, "pexels-photo-6289336.jpeg", "sd_540_960_25fps", "0:08", {
    likes: 186,
    postedAt: "Sep 6",
    caption: "Pasta night, round four",
  }),
  photoStory(30208564, { likes: 171, postedAt: "Jul 28", caption: "Dinner for eight at mine" }),
  videoStory(8448095, "adult-beer-bread-cheese-8448095.jpeg", "sd_540_960_24fps", "0:12", {
    likes: 142,
    postedAt: "Aug 17",
    caption: "Tacos after the trail",
  }),
  photoStory(36880013, { likes: 97, postedAt: "Sep 11", caption: "Thursday hoops" }),
];

/** How many of the top stories Muse pre-selects. */
export const PRESELECTED_STORIES = 4;

/** More of the archive, for "Add from stories" (and the filler in Muse's scan). */
export const ARCHIVE_STORIES: Story[] = [
  videoStory(3062958, "free-video-3062958.jpg", "sd_540_960_24fps", "0:22", {
    likes: 83,
    postedAt: "Jun 30",
    caption: "Finally walked the bridge",
  }),
  photoStory(6947049, { likes: 76, postedAt: "Aug 24", caption: "The stack held up" }),
  videoStory(4253146, "pexels-photo-4253146.jpeg", "sd_506_960_25fps", "0:41", {
    likes: 64,
    postedAt: "Jan 12",
    caption: "Grandma's broth, my attempt",
  }),
  photoStory(20146210, { likes: 58, postedAt: "May 3", caption: "Coast at dawn" }),
  photoStory(27928433, { likes: 51, postedAt: "Feb 9", caption: "Hot pot Sunday" }),
  photoStory(17602394, { likes: 44, postedAt: "Sep 4", caption: "Night shootaround" }),
];

const cameraPhoto = (id: number, caption: string, url = pexelsPhoto(id)): Media => ({
  id: `cam-${id}`,
  src: url,
  kind: "photo",
  source: "camera",
  caption,
});
const unsplashPhoto = (id: string) => `https://images.unsplash.com/photo-${id}?w=540&h=960&fit=crop&auto=format&q=70`;

/** The camera roll, for adding moments that were never a Story. Muse titles these too. */
export const CAMERA_ROLL_MEDIA: Media[] = [
  cameraPhoto(6947061, "Brunch prep"),
  cameraPhoto(6947059, "Plating up"),
  cameraPhoto(32476250, "Top of the headlands"),
  { id: "cam-coffee", src: unsplashPhoto("1495474472287-4d71bcdd2085"), kind: "photo", source: "camera", caption: "Coffee first, always" },
  { id: "cam-lake", src: unsplashPhoto("1464278533981-50106e6176b1"), kind: "photo", source: "camera", caption: "Quiet lake morning" },
  { id: "cam-dinner", src: unsplashPhoto("1517457373958-b7bdd4587205"), kind: "photo", source: "camera", caption: "Long dinners outside" },
  { id: "cam-film", src: unsplashPhoto("1452587925148-ce544e77e70d"), kind: "photo", source: "camera", caption: "Film camera phase" },
  { id: "cam-latte", src: unsplashPhoto("1509042239860-f550ce710b93"), kind: "photo", source: "camera", caption: "Latte art attempt" },
  { id: "cam-city", src: unsplashPhoto("1449034446853-66c86144b0ad"), kind: "photo", source: "camera", caption: "Weekend in the city" },
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
