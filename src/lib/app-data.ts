// Mock data for the main app: the people you meet, your chats, and what's happening nearby.
//
// Portraits and scenes are from Unsplash (free license). Map positions are in pixels on the
// Nearby map's tile grid (see NearbyMap) and are always neighborhood-level, never exact spots.

import type { Media } from "./mock-data";

const unsplash = (id: string, w = 720, h = 960) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=70`;
const face = (id: string) => `https://images.unsplash.com/photo-${id}?w=160&h=160&fit=crop&crop=faces&auto=format&q=70`;

const scene = (id: string, caption: string): Media => ({ id: `u-${id}`, src: unsplash(id, 540, 960), kind: "photo", source: "instagram", caption });

export type Quote = { q: string; a: string };
export type Fact = { label: string; value: string };

/** How someone can show up on Nearby. */
export type NearbyStatus = "interested" | "chat" | "none";

export type NearbyInfo = {
  x: number;
  y: number;
  status: NearbyStatus;
  /** What they're up for right now, in their words. */
  upFor: string;
  /** A short line for the peek and the succinct profile. */
  line: string;
  freeTonight?: boolean;
};

export type Person = {
  id: string;
  name: string;
  age: number;
  photo: string;
  avatar: string;
  neighborhood: string;
  distance: string;
  verified?: boolean;
  /** Muse's one-line read on them. */
  essence: string;
  /** Why Muse thinks you two fit: a short paragraph, written to you. */
  why: string;
  /** What you have in common, as chips under the why. */
  overlaps: string[];
  moments: Media[];
  interests: string[];
  quotes: Quote[];
  roots: { story: string; photo?: string };
  lookingFor: string;
  hopingToMeet: string[];
  facts: Fact[];
  lifestyle: Fact[];
  /** Gentle differences, framed as things worth talking about. */
  worthTalkingAbout: string[];
  firstDate: string;
  opener: string;
  nearby?: NearbyInfo;
};

const MAYA: Person = {
  id: "maya",
  name: "Maya",
  age: 29,
  photo: unsplash("1494790108377-be9c29b29330", 900, 1200),
  avatar: face("1494790108377-be9c29b29330"),
  neighborhood: "Inner Sunset",
  distance: "4 km away",
  verified: true,
  essence: "A designer who throws pots on weekends, runs Lands End before work, and still calls her grandmother every Sunday.",
  why:
    "You both learned love at a crowded family table, and you both show it by feeding people. She wants something real, at an easy pace, like you. And she's looking for someone calm who remembers the little things. That's you, word for word.",
  overlaps: ["Sunday family dinners", "Cooks for friends", "Weekend trails", "Something serious, no rush"],
  moments: [
    scene("1464278533981-50106e6176b1", "Up before the fog lifts"),
    scene("1452587925148-ce544e77e70d", "Shooting a roll of film a month"),
    scene("1504674900247-0877df9cc836", "Dinner for my sisters"),
    scene("1506905925346-21bda4d32df4", "Eastern Sierra, last fall"),
  ],
  interests: ["Ceramics", "Trail running", "Film photography", "Cooking", "Bookstores", "Jazz"],
  quotes: [
    {
      q: "What would your closest friends say they love most about you?",
      a: "That I show up. If you're moving, I'm there with tape and snacks. If you're sad, I'm there with soup.",
    },
    {
      q: "What does a perfect Sunday look like?",
      a: "A slow run at Lands End, the farmers market, and a long dinner with way too many people around one table.",
    },
    {
      q: "When do you feel most at ease with someone?",
      a: "When we can be quiet together and it doesn't feel like a gap. Also when they're kind to waiters.",
    },
  ],
  roots: {
    story:
      "I grew up in Portland, the oldest of four. My grandmother ran the house, and dinner was the one thing nobody missed. She taught me that you can say almost anything to someone if you're cooking together.",
    photo: unsplash("1517457373958-b7bdd4587205", 900, 700),
  },
  lookingFor: "Something serious, no rush",
  hopingToMeet: ["Steady and warm", "Close to their family", "Curious about the world", "Has their own thing going"],
  facts: [
    { label: "Work", value: "Product designer at a small studio" },
    { label: "Education", value: "RISD" },
    { label: "Hometown", value: "Portland, OR" },
    { label: "Height", value: "5′6″" },
    { label: "Languages", value: "English, Mandarin" },
  ],
  lifestyle: [
    { label: "Kids", value: "Wants them someday" },
    { label: "Drinks", value: "Socially" },
    { label: "Smokes", value: "No" },
    { label: "Pets", value: "Fostering a cat named Miso" },
  ],
  worthTalkingAbout: [
    "She's up at 6 for her run. You're more of a late-dinner person. Could make for great breakfasts.",
    "She's never made fresh pasta. You've made it four times this month.",
  ],
  firstDate: "A pasta-making class for two, then a walk through the Mission.",
  opener: "Okay, I have to ask: what was the first thing you ever made on the wheel, and do you still have it?",
};

type Seed = Pick<Person, "id" | "name" | "age" | "neighborhood" | "distance"> & {
  photoId: string;
  essence: string;
  interests: string[];
  lookingFor: string;
  nearby?: NearbyInfo;
  work: string;
};

/** Everyone else gets a lighter profile built from a few lines. Their full profile reuses Maya's chapter layout. */
function person(s: Seed): Person {
  return {
    id: s.id,
    name: s.name,
    age: s.age,
    photo: unsplash(s.photoId, 900, 1200),
    avatar: face(s.photoId),
    neighborhood: s.neighborhood,
    distance: s.distance,
    verified: true,
    essence: s.essence,
    why: `${s.name} and you share a love of ${s.interests[0].toLowerCase()} and ${s.interests[1].toLowerCase()}, and you're both after something that feels easy.`,
    overlaps: s.interests.slice(0, 3),
    moments: [],
    interests: s.interests,
    quotes: [{ q: "What are you up for these days?", a: s.nearby?.line ?? s.essence }],
    roots: { story: "" },
    lookingFor: s.lookingFor,
    hopingToMeet: [],
    facts: [{ label: "Work", value: s.work }],
    lifestyle: [],
    worthTalkingAbout: [],
    firstDate: "",
    opener: "",
    nearby: s.nearby,
  };
}

const SOFIA = person({
  id: "sofia",
  name: "Sofia",
  age: 30,
  photoId: "1438761681033-6461ffad8d80",
  neighborhood: "Noe Valley",
  distance: "2 km away",
  essence: "Pediatric nurse, salsa on Thursdays, makes a mean arepa.",
  interests: ["Salsa", "Cooking", "Hiking"],
  lookingFor: "Finding my person",
  work: "Pediatric nurse at UCSF",
});

const HANA = person({
  id: "hana",
  name: "Hana",
  age: 28,
  photoId: "1534528741775-53994a69daeb",
  neighborhood: "Noe Valley",
  distance: "2 km away",
  essence: "Architect who sketches buildings on napkins and never says no to hot pot.",
  interests: ["Architecture", "Hot pot", "Live music"],
  lookingFor: "Something serious, no rush",
  work: "Architect",
  nearby: { x: 772, y: 796, status: "interested", upFor: "Coffee this weekend", line: "Will trade hot pot spots for pasta tips." },
});

const ELENA = person({
  id: "elena",
  name: "Elena",
  age: 31,
  photoId: "1544005313-94ddf0286df2",
  neighborhood: "Hayes Valley",
  distance: "1 km away",
  essence: "Sommelier with strong opinions about orange wine and weak ones about everything else.",
  interests: ["Natural wine", "Vinyl", "Dancing"],
  lookingFor: "Seeing where it goes",
  work: "Sommelier",
  nearby: { x: 804, y: 590, status: "chat", upFor: "Drinks tonight", line: "At a wine bar till 10. Come say hi?", freeTonight: true },
});

const CHLOE = person({
  id: "chloe",
  name: "Chloe",
  age: 27,
  photoId: "1517841905240-472988babdf9",
  neighborhood: "Lower Pac Heights",
  distance: "1.5 km away",
  essence: "Climbs, bakes sourdough, and is always planning the next road trip.",
  interests: ["Climbing", "Sourdough", "Road trips"],
  lookingFor: "Something serious, no rush",
  work: "Teacher",
  nearby: { x: 760, y: 528, status: "none", upFor: "Climbing partner, maybe more", line: "Looking for a belay buddy who likes tacos." },
});

const PRIYA = person({
  id: "priya",
  name: "Priya",
  age: 30,
  photoId: "1580489944761-15a19d654956",
  neighborhood: "Mission Dolores",
  distance: "800 m away",
  essence: "Startup founder who unwinds with pottery and very long walks.",
  interests: ["Pottery", "Long walks", "Tacos"],
  lookingFor: "Seeing where it goes",
  work: "Founder",
  nearby: { x: 796, y: 716, status: "none", upFor: "Dinner this week", line: "Dolores Park regular. Bring snacks." },
});

const NEARBY_ONLY: Person[] = [
  person({
    id: "ava",
    name: "Ava",
    age: 26,
    photoId: "1487412720507-e7ab37603c6f",
    neighborhood: "Mission",
    distance: "600 m away",
    essence: "Tattoo artist, taco critic, karaoke closer.",
    interests: ["Karaoke", "Tacos", "Art"],
    lookingFor: "Seeing where it goes",
    work: "Tattoo artist",
    nearby: { x: 884, y: 736, status: "chat", upFor: "Karaoke tonight", line: "Need one more for a duet. Can you hold a note?", freeTonight: true },
  }),
  person({
    id: "mia",
    name: "Mia",
    age: 29,
    photoId: "1529626455594-4ff0802cfb7e",
    neighborhood: "Castro",
    distance: "900 m away",
    essence: "Yoga teacher who's secretly very competitive at board games.",
    interests: ["Yoga", "Board games", "Brunch"],
    lookingFor: "Seeing where it goes",
    work: "Yoga teacher",
    nearby: { x: 736, y: 706, status: "none", upFor: "Brunch Sunday", line: "Brunch, then a board game I will win." },
  }),
  person({
    id: "zoe",
    name: "Zoe",
    age: 28,
    photoId: "1573496359142-b8d87734a5a2",
    neighborhood: "SoMa",
    distance: "2 km away",
    essence: "Product lead by day, DJ by very late night.",
    interests: ["DJing", "Techno", "Running"],
    lookingFor: "Seeing where it goes",
    work: "Product lead",
    nearby: { x: 930, y: 580, status: "none", upFor: "A show this weekend", line: "Playing a set Saturday. Come dance." },
  }),
  person({
    id: "lena",
    name: "Lena",
    age: 30,
    photoId: "1524504388940-b1c1722653e1",
    neighborhood: "Marina",
    distance: "3 km away",
    essence: "Sails on weekends, reads on ferries, laughs loudly.",
    interests: ["Sailing", "Books", "Live music"],
    lookingFor: "Something serious, no rush",
    work: "Lawyer",
    nearby: { x: 740, y: 400, status: "interested", upFor: "A sunset sail", line: "Have a boat, need a crew of one." },
  }),
  person({
    id: "nora",
    name: "Nora",
    age: 27,
    photoId: "1488426862026-3ee34a7d66df",
    neighborhood: "North Beach",
    distance: "3 km away",
    essence: "Pastry chef. Will judge your croissant.",
    interests: ["Baking", "Jazz", "Cycling"],
    lookingFor: "Seeing where it goes",
    work: "Pastry chef",
    nearby: { x: 896, y: 382, status: "chat", upFor: "Jazz tonight", line: "Jazz at 9. I'll save you a seat.", freeTonight: true },
  }),
  person({
    id: "iris",
    name: "Iris",
    age: 31,
    photoId: "1550525811-e5869dd03032",
    neighborhood: "Inner Sunset",
    distance: "4 km away",
    essence: "Marine biologist with a soft spot for foggy beaches.",
    interests: ["Surfing", "Ocean", "Photography"],
    lookingFor: "Something serious, no rush",
    work: "Marine biologist",
    nearby: { x: 566, y: 712, status: "none", upFor: "Ocean Beach bonfire", line: "Bonfire Friday. Bring a sweater." },
  }),
];

export const TODAYS_PICK = MAYA;

export const PEOPLE: Record<string, Person> = Object.fromEntries(
  [MAYA, SOFIA, HANA, ELENA, CHLOE, PRIYA, ...NEARBY_ONLY].map((p) => [p.id, p]),
);

/** People who show up on the Nearby map. */
export const NEARBY_PEOPLE: Person[] = Object.values(PEOPLE).filter((p) => p.nearby);

/** Your own approximate area on the map (Duboce Triangle). */
export const MY_AREA = { x: 760, y: 650 };

// ---------- Events & blind dates ----------

export type NearbyEvent = {
  id: string;
  kind: "event" | "blind";
  title: string;
  when: string;
  where: string;
  photo: string;
  /** Going count for events, open spots for blind dates. */
  detail: string;
  blurb: string;
  x: number;
  y: number;
  /** Faces of people you might know there. */
  faces?: string[];
};

export const NEARBY_EVENTS: NearbyEvent[] = [
  {
    id: "wine",
    kind: "event",
    title: "Natural wine night",
    when: "Tonight · 7 PM",
    where: "Hayes Valley",
    photo: unsplash("1514933651103-005eec06c04b", 600, 400),
    detail: "18 going",
    blurb: "Six small-batch wines, a cheese plate, and a room full of people who'd rather talk than swipe.",
    x: 846,
    y: 618,
    faces: [ELENA.avatar, NEARBY_ONLY[0].avatar],
  },
  {
    id: "blind-dinner",
    kind: "blind",
    title: "Blind dinner for six",
    when: "Fri · 8 PM",
    where: "Mission",
    photo: unsplash("1414235077428-338989a2e8c0", 600, 400),
    detail: "2 spots left",
    blurb: "Muse seats six people who'd get along, around one long table. You find out who's coming when you sit down.",
    x: 852,
    y: 770,
  },
  {
    id: "run",
    kind: "event",
    title: "Sunset run club",
    when: "Sat · 6 PM",
    where: "Crissy Field",
    photo: unsplash("1507525428034-b723cf961d3e", 600, 400),
    detail: "32 going",
    blurb: "An easy 5K along the water, then tacos. All paces welcome.",
    x: 586,
    y: 398,
    faces: [NEARBY_ONLY[3].avatar],
  },
  {
    id: "blind-coffee",
    kind: "blind",
    title: "Coffee blind date",
    when: "Sun · 11 AM",
    where: "Russian Hill",
    photo: unsplash("1501339847302-ac426a4a7cbb", 600, 400),
    detail: "Muse picks your match",
    blurb: "Muse pairs you with one person nearby you haven't seen yet. You'll get their first name the night before.",
    x: 838,
    y: 430,
  },
  {
    id: "jazz",
    kind: "event",
    title: "Jazz in the park",
    when: "Sun · 2 PM",
    where: "Golden Gate Park",
    photo: unsplash("1493225457124-a3eb161ffa5f", 600, 400),
    detail: "54 going",
    blurb: "A free afternoon set on the lawn. Bring a blanket and someone to share it with.",
    x: 470,
    y: 652,
  },
];

// ---------- Chats ----------

export type Interest = "mutual" | "likesYou" | "youLiked";
export type Origin = "Today" | "Nearby";

export type Venue = {
  id: string;
  name: string;
  area: string;
  photo: string;
  why: string;
  price: string;
};

export type Booking = {
  venue: Venue;
  /** e.g. "Fri, Oct 3 · 7:30 PM" */
  when: string;
  code: string;
  calendar: string;
};

export type PlanStep = "when" | "what" | "budget" | "calendar";

export type Message =
  | { id: string; from: "me" | "them"; kind: "text"; text: string }
  | { id: string; from: "me" | "them"; kind: "media"; media: Media[] }
  /** An interest note, optionally replying to part of a profile. */
  | { id: string; from: "me" | "them"; kind: "note"; text: string; about?: string; muse?: boolean }
  | { id: string; kind: "divider"; text: string }
  | { id: string; kind: "muse"; text: string }
  | {
      id: string;
      kind: "museAsk";
      step: PlanStep;
      question: string;
      options: string[];
      multi?: boolean;
      mine?: string[];
      theirs?: string;
    }
  | { id: string; kind: "museVenues"; venues: Venue[]; picked?: string }
  | { id: string; kind: "museBooking"; venue: Venue; done: boolean }
  | { id: string; kind: "museBooked"; booking: Booking };

export type Thread = {
  id: string;
  personId: string;
  status: Interest;
  origin: Origin;
  messages: Message[];
  unread: number;
  /** Label for the list, e.g. "9:12 AM" or "Mon". */
  time: string;
  /** Higher is more recent. */
  order: number;
  typing?: boolean;
  /** Muse is planning a date in this chat. */
  planning?: boolean;
};

let seq = 0;
export const msgId = () => `m${Date.now().toString(36)}${(seq++).toString(36)}`;

export const SEED_THREADS: Thread[] = [
  {
    id: "t-sofia",
    personId: "sofia",
    status: "mutual",
    origin: "Today",
    unread: 2,
    time: "9:12 AM",
    order: 90,
    messages: [
      { id: "s0", from: "them", kind: "note", text: "Your grandma's broth story got me. Mine made arepas every Sunday.", about: "What shaped Tony" },
      { id: "s1", kind: "divider", text: "You matched · Last Tuesday" },
      { id: "s2", from: "me", kind: "text", text: "Okay, I need to try a real arepa. Where do I even start in this city?" },
      { id: "s3", from: "them", kind: "text", text: "Honestly? My kitchen. But there's a decent spot on 24th if you need a warm-up." },
      { id: "s4", from: "me", kind: "text", text: "Warm-up first, then your kitchen. That's a deal." },
      { id: "s5", from: "them", kind: "text", text: "Ha, deal. This week is pretty open for me." },
      { id: "s6", from: "them", kind: "text", text: "Want to actually pick a day?" },
    ],
  },
  {
    id: "t-elena",
    personId: "elena",
    status: "likesYou",
    origin: "Nearby",
    unread: 1,
    time: "8:40 AM",
    order: 80,
    messages: [{ id: "e0", from: "them", kind: "note", text: "Wine night in Hayes tonight. You look like you'd have opinions about orange wine." }],
  },
  {
    id: "t-hana",
    personId: "hana",
    status: "likesYou",
    origin: "Today",
    unread: 1,
    time: "Yesterday",
    order: 70,
    messages: [{ id: "h0", from: "them", kind: "note", text: "Round four of pasta night? Teach me. I'll bring dessert.", about: "Pasta night, round four" }],
  },
  {
    id: "t-priya",
    personId: "priya",
    status: "mutual",
    origin: "Nearby",
    unread: 0,
    time: "Mon",
    order: 60,
    messages: [
      { id: "p0", kind: "divider", text: "You matched on Nearby · Sunday" },
      { id: "p1", from: "them", kind: "text", text: "Were you the one with the frisbee at Dolores on Sunday?" },
      { id: "p2", from: "me", kind: "text", text: "Guilty. Was that you with the very judgmental dog?" },
      { id: "p3", from: "them", kind: "text", text: "He judges everyone equally. It's his best quality." },
    ],
  },
  {
    id: "t-chloe",
    personId: "chloe",
    status: "youLiked",
    origin: "Nearby",
    unread: 0,
    time: "Sun",
    order: 50,
    messages: [{ id: "c0", from: "me", kind: "note", text: "Fellow sourdough person! How old is your starter?" }],
  },
];

/** Canned replies, so chats feel alive. Each person answers your next few messages in order. */
export const REPLIES: Record<string, string[]> = {
  maya: [
    "Hi! Muse told me about the pasta. I'm going to need proof.",
    "Okay, deal. And my first pot was a very lopsided mug. I still drink from it every morning.",
    "Ha, I'd love that. Want Muse to find us a time?",
  ],
  sofia: ["Ha! Okay, let's do it.", "Perfect. Can't wait."],
  elena: ["Ha, there you are. I'm at the bar on Hayes till 10.", "Come by! First glass is on me."],
  hana: ["Yay! Okay, when's the next pasta night?", "I'm bringing tiramisu. Non-negotiable."],
  priya: ["Ha, he'd like that.", "Tacos after? I know a place."],
  ava: ["Okay, you're in. Do you know the words to Dancing Queen?", "Perfect. Booth 3, 9 PM."],
  nora: ["Front row, saving you a seat.", "See you at 9!"],
  default: ["Hey! Glad you said hi.", "Sounds good to me."],
};

export const THEIR_WHEN = ["Fri evening", "Sat daytime"];
export const WHEN_OPTIONS = ["Thu evening", "Fri evening", "Sat daytime", "Sun brunch"];
export const WHAT_OPTIONS = ["Dinner", "Drinks", "Something active", "A class together"];
export const BUDGET_OPTIONS = ["$$", "$$$", "No preference"];

export const CALENDARS = ["Google Calendar · Personal", "iCloud · Home", "Outlook · Work"];

export const VENUES: Record<string, Venue[]> = {
  Dinner: [
    { id: "lucia", name: "Osteria Lucia", area: "Mission", photo: unsplash("1555396273-367ea4eb4db5", 600, 400), price: "$$", why: "Hand-rolled pasta, made in front of you. A good test of your own." },
    { id: "fern", name: "Field & Fern", area: "Hayes Valley", photo: unsplash("1517248135467-4c7edcad34c4", 600, 400), price: "$$$", why: "Seasonal and vegetable-forward, with a quiet back room." },
    { id: "bao", name: "Little Bao", area: "Inner Richmond", photo: unsplash("1540189549336-e6e99c3679fe", 600, 400), price: "$$", why: "Dumplings to share, and a room quiet enough to talk." },
  ],
  Drinks: [
    { id: "maren", name: "Bar Maren", area: "Hayes Valley", photo: unsplash("1514933651103-005eec06c04b", 600, 400), price: "$$", why: "Natural wine and small plates. Easy to talk." },
    { id: "lantern", name: "The Lantern Room", area: "North Beach", photo: unsplash("1470337458703-46ad1756a187", 600, 400), price: "$$$", why: "A rooftop with a view of the bridge at golden hour." },
    { id: "tide", name: "Tidewater", area: "Dogpatch", photo: unsplash("1532634922-8fe0b757fb13", 600, 400), price: "$$", why: "A beer garden with fire pits and good music." },
  ],
  "Something active": [
    { id: "landsend", name: "Lands End trail + coffee", area: "Outer Richmond", photo: unsplash("1506905925346-21bda4d32df4", 600, 400), price: "$", why: "Ocean views at walking pace, ending with coffee." },
    { id: "boulder", name: "Granite Hall bouldering", area: "SoMa", photo: unsplash("1522163182402-834f871fd851", 600, 400), price: "$$", why: "Intro session for two. Lots of laughing, guaranteed." },
    { id: "paddle", name: "Sunset paddle", area: "Mission Bay", photo: unsplash("1507525428034-b723cf961d3e", 600, 400), price: "$$", why: "Kayaks on the bay, then tacos on the pier." },
  ],
  "A class together": [
    { id: "pasta", name: "Pasta for two at Cookhouse", area: "Mission", photo: unsplash("1556910103-1c02745aae4d", 600, 400), price: "$$", why: "You've got the pasta skills. Fun to show off a little." },
    { id: "wheel", name: "Wheel-throwing intro", area: "Dogpatch", photo: unsplash("1513364776144-60967b0f800f", 600, 400), price: "$$", why: "Messy, hands-on, and easy to laugh through together." },
    { id: "tasting", name: "Wine tasting 101", area: "Hayes Valley", photo: unsplash("1510812431401-41d2bd2722f3", 600, 400), price: "$$$", why: "Six pours and a sommelier who keeps it fun." },
  ],
};

// ---------- Your past introductions ----------

export const PAST_INTROS = [
  { personId: "sofia", day: "Last Tue", outcome: "It's mutual" },
  { personId: "hana", day: "Last Mon", outcome: "She's interested" },
];
