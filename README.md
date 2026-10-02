# Twine — dating app demo

High-fidelity iOS demo of a new standalone dating app. Web-based (Next.js), rendered inside an iPhone 17 Pro frame (402 × 874 pt). All data is mocked.

```bash
npm run dev -- -p 3100
```

- Desktop: open http://localhost:3100. The phone frame scales to fit the window.
- Real iPhone: open the same URL on your phone (same network, use your Mac's IP). The frame drops away and the app fills the screen; "Add to Home Screen" makes it look like an installed app.
- `?speed=0.25` plays the launch animation in slow motion.
- `?start=permissions` jumps to a screen: `accounts`, `settingUp`, `permissions`, `allSet`, `about`, `muse`, `stories`, `app`.
- `?start=app&tab=nearby` opens the main app on a tab: `today`, `nearby`, `chats`, `you`.
- On desktop, the frame's Action Button (upper left side of the phone) is pressable: hold it during the voice-shortcut "Try it" step.

## What's in it

| Screen | Flow |
| --- | --- |
| Launch animation | Couple photos fly in, stack, split into two strands and merge into the heart mark. Tap to skip. |
| Account picker | Continue as `tonywzcwzc` (Instagram), switch account, Terms / Privacy sheets |
| Switch account sheet | Pick a signed-in account or use another Instagram account |
| Instagram account chooser (mock) | Pick a demo account; it joins the switcher. No sign-in fields, since the demo is shared publicly. |
| Consent sheet | What the app receives from Instagram; Continue / Not now |
| Setting up | Short progress checklist |
| Permissions | A checklist hub; tapping a permission opens a 75% sheet showing only its use cases, then the iOS system prompt. After each choice the next unanswered one opens on its own. Skip (top right) asks to confirm. |
| Voice shortcut sheet | Action Button / Back Tap / Hold the heart → Try it (hold to talk) → ready. Or skip. |
| All set | Welcome moment, then Meta-sourced details fill an "About you" card that expands into the next screen. Tap to skip. |
| About you | Prefilled from Instagram / Facebook (mock), every field editable, interests add/remove, gender required |
| Talk with Muse | Tap the mic (no holding) and talk; Muse replies when you pause. Quick questions swap the mic for choices; open ones give it back. Stop any time → "That's me, for now". Your speech is simulated from a script. |
| Muse's summary | Structured card of who you are and who you're hoping to meet, plus a city-level map of San Francisco and a quiet estimate of how many people nearby could be a great fit for you. "Tell Muse more" goes back to the conversation. |
| Your best moments | Muse scans the Instagram Story archive and brings back the most-loved expired Stories (real video included), each with a title Muse wrote, editable in place. Add more from the camera roll or the archive, or skip. |
| Profile preview | "Here's how people will see you": main photo, Muse's take, stories with their titles. |
| **Today** (tab) | The matchmaker. One person a day, told like a short book: swipe (or use the arrow keys) through chapters: why you two, their world, in their words, what shaped them, looking for, the details, Muse's notes. "I'd like to meet" sends a note (Muse drafts it, you can reply to a specific chapter) or, on Plus, a Muse introduction. "Not for me" asks why, privately. Then a countdown to tomorrow's introduction. In the demo, Maya says yes after a few seconds. |
| **Nearby** (tab) | The casual side. Opt-in with a location prompt. A draggable map of San Francisco with faces (neighborhood-level), events and blind dates. A ring and heart means someone's into you; green means they're up for a chat now. Hold a face to peek; tap for a short profile and say hi; "Read full story" opens the Today-style book. |
| **Chats** (tab) | Muse pinned on top, then filters: All, Into you, You're into, Mutual. In a chat: photos and videos, the camera (photo or video), and **Plan a date**: Muse joins, asks you both when, what and budget, offers three spots, books it and adds it to your calendar. |
| **Muse** (chat) | "Who you are" summary at the top (tap to expand), the full history with Muse, quick prompts, and Talk to reopen the voice conversation. |
| **You** (tab) | Your public profile, always editable (photos and moments, basics, interests, what you're looking for, where you show up). Preview shows you exactly as others see you in Today. Settings: account, Muse, discovery, date calendar, notifications, Plus, privacy, log out, replay onboarding. |

## Where things live

- `src/lib/brand.ts`: name, colors and the mark geometry (shared by the SVG and the launch animation)
- Map: Esri dark gray canvas tiles (© OpenStreetMap contributors), city level only.
- `src/lib/mock-data.ts`: mock account, launch photos (Unsplash), and story media (Pexels photos and videos; Tony is one consistent model throughout)
- `src/lib/app-data.ts`: people, chats, events, venues and map positions for the main app (portraits and scenes from Unsplash)
- `src/components/DemoApp.tsx`: onboarding screen/sheet state machine; `src/components/app/MainApp.tsx`: tabs, pushed screens and banners
- `src/components/chats/useChats.ts`: chats, scripted replies, and Muse's date-planning flow
- `src/components/onboarding/`: launch, account, setup and welcome screens
- `src/components/permissions/`: permission checklist, previews and the voice-shortcut sheet
- `src/components/profile/`: "About you" and its edit sheet
- `src/components/muse/`: Muse avatar, backdrop, conversation engine, summary
- `src/components/photos/`: Story scan, stories picker with editable titles, camera-roll picker, profile preview
- `src/lib/muse-script.ts`: what Muse asks, the simulated answers, and how answers become the summary and fit %
- `src/components/ios/`: iOS system alert
- `src/components/device/`: iPhone frame, status bar and the pressable Action Button

## Sharing (GitHub Pages)

Live at https://tonywzc.github.io/dating-app-demo/. Every push to `main` builds the static site and publishes it via
`.github/workflows/deploy.yml`. When working with Claude Code, a Stop hook (`.claude/hooks/auto-deploy.sh`) commits and
pushes finished changes automatically, as long as the project type-checks.

To test the Pages build locally: `PAGES_BASE_PATH=/dating-app-demo npm run build` (output in `out/`).

To use a real profile photo, set `avatarUrl` on `PRIMARY_ACCOUNT` (e.g. drop `avatar.jpg` in `public/` and use `"/avatar.jpg"`).
