# Twine — dating app demo

High-fidelity iOS demo of a new standalone dating app. Web-based (Next.js), rendered inside an iPhone 17 Pro frame (402 × 874 pt). All data is mocked.

```bash
npm run dev -- -p 3100
```

- Desktop: open http://localhost:3100. The phone frame scales to fit the window.
- Real iPhone: open the same URL on your phone (same network, use your Mac's IP). The frame drops away and the app fills the screen; "Add to Home Screen" makes it look like an installed app.
- `?speed=0.25` plays the launch animation in slow motion.
- `?start=permissions` jumps to a screen: `accounts`, `settingUp`, `permissions`, `allSet`, `about`, `muse`, `welcome`.
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
| Permissions checklist | Notifications → Voice (mic) → Photos & camera → Voice shortcut (optional). Each opens an iOS system prompt; denying lets you retry. |
| Voice shortcut sheet | Action Button / Back Tap / Hold the heart → Try it (hold to talk) → ready. Or skip. |
| All set | Welcome moment, then Meta-sourced details fill an "About you" card that expands into the next screen. Tap to skip. |
| About you | Prefilled from Instagram / Facebook (mock), every field editable, interests add/remove, gender required |
| Talk with Muse | Tap the mic (no holding) and talk; Muse replies when you pause. Quick questions swap the mic for choices; open ones give it back. Stop any time → "That's me, for now". Your speech is simulated from a script. |
| Muse's summary | Structured card of who you are and who you're hoping to meet, plus the share of nearby members you'd be a great fit for. "Tell Muse more" goes back to the conversation. |
| End | Replay onboarding, or sign out back to the account picker |

## Where things live

- `src/lib/brand.ts`: name, colors and the mark geometry (shared by the SVG and the launch animation)
- `src/lib/mock-data.ts`: mock account and memory photos (Unsplash)
- `src/components/DemoApp.tsx`: screen/sheet state machine
- `src/components/onboarding/`: launch, account, setup and welcome screens
- `src/components/permissions/`: permission checklist, previews and the voice-shortcut sheet
- `src/components/profile/`: "About you" and its edit sheet
- `src/components/muse/`: Muse avatar, backdrop, conversation engine, summary
- `src/lib/muse-script.ts`: what Muse asks, the simulated answers, and how answers become the summary and fit %
- `src/components/ios/`: iOS system alert
- `src/components/device/`: iPhone frame, status bar and the pressable Action Button

## Sharing (GitHub Pages)

Every push to `main` builds the static site and publishes it via `.github/workflows/deploy.yml` to
`https://<username>.github.io/dating-app-demo/`. One-time setup: in the repo's **Settings → Pages**, set **Source** to **GitHub Actions**.

To test the Pages build locally: `PAGES_BASE_PATH=/dating-app-demo npm run build` (output in `out/`).

To use a real profile photo, set `avatarUrl` on `PRIMARY_ACCOUNT` (e.g. drop `avatar.jpg` in `public/` and use `"/avatar.jpg"`).
