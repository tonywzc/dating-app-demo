// The scripted Muse conversation (mock) and how answers become a profile summary.
//
// Each beat is something Muse says, plus what she expects back:
// - "open": a longer spoken answer (the mic stays live)
// - "quick": a few choices to tap
// - "end": Muse wraps up and stops listening; tapping the mic again plays `bonus`

export type Expectation =
  | { type: "open"; answer: string }
  | { type: "quick"; options: string[]; replies: Record<string, string> }
  | { type: "end"; bonus?: string };

export type Beat = { id: string; muse: string[]; expects: Expectation };

// The questions get a little deeper each time: an easy icebreaker everyone can
// answer, then interests, intent, how others see you, what you need in a partner,
// and finally where you come from. Quick questions sit early, where effort should be lowest.
export const BEATS: Beat[] = [
  {
    // 1. Icebreaker: nothing to prepare, no wrong answers.
    id: "weekend",
    muse: [
      "Hi {name}, I'm Muse. I'd love to get to know you, and the kind of person you're hoping to meet.",
      "Let's start easy. What did you get up to last weekend?",
    ],
    expects: {
      type: "open",
      answer:
        "Pretty chill, honestly. Saturday I went on a hike out in Marin with a couple of friends, and we found this tiny taco spot on the way back. Sunday I mostly cooked and caught up on sleep.",
    },
  },
  {
    // 2. Light preference, one tap.
    id: "vibe",
    muse: ["Hikes, tacos, and a slow Sunday. Sounds like a good one.", "Are you usually more of a…"],
    expects: {
      type: "quick",
      options: ["Out exploring", "Cozy at home", "A bit of both"],
      replies: {
        "Out exploring": "An explorer. Someone's going to get great weekend plans out of you.",
        "Cozy at home": "A homebody. Honestly, nothing beats a good night in.",
        "A bit of both": "The best of both. Adventure first, then the couch.",
      },
    },
  },
  {
    // 3. What lights you up.
    id: "lately",
    muse: ["What's something you're into lately that you could talk about for hours?"],
    expects: {
      type: "open",
      answer:
        "Cooking, for sure. I've been teaching myself to make fresh pasta. It's a total mess every time, but there's something about making a meal for people you care about.",
    },
  },
  {
    // 4. Intent, kept to one tap.
    id: "looking",
    muse: ["Fresh pasta for the people you care about. That's a love language.", "So, what brings you to Twine right now?"],
    expects: {
      type: "quick",
      options: ["Finding my person", "Something serious, no rush", "Seeing where it goes"],
      replies: {
        "Finding my person": "Someone to build a life with. I love that for you.",
        "Something serious, no rush": "Serious, at your own pace. That's a healthy way to go.",
        "Seeing where it goes": "Open and curious. That's a good place to start.",
      },
    },
  },
  {
    // 5. How the people who know you best see you.
    id: "loved",
    muse: ["What would the people closest to you say they love most about you?"],
    expects: {
      type: "open",
      answer:
        "They'd probably say I remember the little things, like someone's coffee order or a date that matters to them. And I'm the calm one when things get chaotic.",
    },
  },
  {
    // 6. What you need to feel close to someone.
    id: "ease",
    muse: [
      "Remembering the little things is a rare kind of care.",
      "When you picture someone you'd really click with, what makes you feel most at ease with them?",
    ],
    expects: {
      type: "open",
      answer:
        "Someone curious and kind, with their own thing going on. I feel most at ease with people who are just themselves, where a quiet moment isn't awkward. And family matters a lot to me, so someone who gets that.",
    },
  },
  {
    // 7. Where you come from.
    id: "roots",
    muse: [
      "Being fully yourself, and quiet that feels easy. That's real closeness.",
      "Can I ask something a little deeper? What's a moment from growing up that still shapes who you are today?",
    ],
    expects: {
      type: "open",
      answer:
        "Probably Sunday dinners at my grandma's. Everyone crammed around one table, loud, arguing about nothing. She always made sure everyone had a full plate before she sat down. I think that's where I learned that taking care of people is how you love them.",
    },
  },
  {
    // Muse leaves the door open instead of closing it.
    id: "closing",
    muse: [
      "Thank you for sharing that, {name}. It says so much about how you love.",
      "I'd love to hear more whenever you're ready. Or we can pause here and pick it up another time.",
    ],
    expects: {
      type: "end",
      bonus:
        "I think about her a lot, actually. She's the one who taught me to cook. When I make pasta now, it kind of feels like I'm keeping a little bit of her with me.",
    },
  },
  {
    id: "bonus",
    muse: [
      "That's beautiful. Whoever ends up at your table is going to feel that.",
      "Anything else on your heart, or does that feel like you?",
    ],
    expects: { type: "end" },
  },
];

export const fill = (text: string, name: string) => text.replaceAll("{name}", name);

/** A complete conversation, for screens reached without talking to Muse first (e.g. `?start=stories`). */
export const SAMPLE_ANSWERS: Record<string, string> = Object.fromEntries(
  BEATS.flatMap((b) =>
    b.expects.type === "open" ? [[b.id, b.expects.answer]] : b.expects.type === "quick" ? [[b.id, b.expects.options[0]]] : [],
  ),
);

// ---------- Summary ----------

export type Answers = Record<string, string>;

export type SummarySection = { title: string; items: string[] };

export type Summary = {
  essence: string;
  sections: SummarySection[];
  fitPercent: number;
  fitPeople: number;
};

/** Active members near the user (mock). */
export const NEARBY_MEMBERS = 36800;
export const NEARBY_AREA = "San Francisco";

const VIBE: Record<string, string> = {
  "Out exploring": "Out exploring",
  "Cozy at home": "A homebody at heart",
  "A bit of both": "Adventure, then the couch",
};

export function summarize(answers: Answers): Summary {
  const has = (id: string) => id in answers;
  const sections: SummarySection[] = [];

  const world = [];
  if (has("vibe")) world.push(VIBE[answers.vibe] ?? answers.vibe);
  if (has("weekend")) world.push("Weekend hikes", "Hole-in-the-wall food spots");
  if (has("lately")) world.push("Making fresh pasta", "Cooking for people you love");
  if (world.length) sections.push({ title: "Your world", items: world });

  if (has("loved")) sections.push({ title: "People love that you", items: ["Remember the little things", "Stay calm in the chaos"] });

  if (has("looking")) sections.push({ title: "What you're looking for", items: [answers.looking] });

  if (has("ease"))
    sections.push({
      title: "You're hoping to meet",
      items: ["Curious and kind", "Comfortable being themselves", "Has their own thing going", "Family matters to them"],
    });

  const roots = [];
  if (has("roots")) roots.push("Sunday dinners at grandma's", "Love means taking care of people");
  if (has("closing")) roots.push("Cooking keeps her close");
  if (roots.length) sections.push({ title: "What shaped you", items: roots });

  const essence = [
    has("weekend") || has("lately")
      ? "An easygoing adventurer who's happiest out on a trail with friends, or in the kitchen cooking for them."
      : "Someone just getting started on their story here.",
    has("loved") ? "The friend who remembers the little things, and stays steady when things get loud." : "",
    has("roots") ? "Learned at a crowded family table that taking care of people is how you love them." : "",
  ]
    .filter(Boolean)
    .join(" ");

  // The more Muse understands, the more precise (and smaller) the circle of great fits.
  let fit = 24;
  if (has("ease")) fit -= 5;
  if (has("roots")) fit -= 2;
  if (has("vibe") && answers.vibe !== "A bit of both") fit -= 1;
  fit -= { "Finding my person": 5, "Something serious, no rush": 3, "Seeing where it goes": 1 }[answers.looking] ?? 0;
  fit = Math.max(4, Math.min(30, fit));

  return {
    essence,
    sections,
    fitPercent: fit,
    fitPeople: Math.round((NEARBY_MEMBERS * fit) / 100 / 100) * 100,
  };
}
