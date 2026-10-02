@AGENTS.md

## Design principles (keep for every iteration)

- Clean, modern, calm. When in doubt, remove: fewer elements, fewer options, fewer words on every screen.
- Iconography over copy. Short labels (1–3 words); no explanatory sub-lines unless they prevent a mistake.
- Big, easy targets: every tappable thing is at least 44pt; no tiny text links or mini buttons.
- Easy navigation: one obvious primary action per screen; settings live in sub-pages, not as a wall of toggles.
- The matchmaker voice is the platform ("we", warm and factual: shared roots, values, plans), not the AI.
  Muse is a helper you can talk to; keep her out of "you two are a fit" claims.
- No distances between people; neighborhood only.
- Twine Plus ($9.99/mo): Plan a date, Host an event, and +3 extra introductions a week (10 vs 7).
  Plan a date and Host an event are free the first time; the second use (and See another) shows the upsell.

## Publishing the demo

The shareable demo lives at https://tonywzc.github.io/dating-app-demo/ and redeploys on every push to `main`
(`.github/workflows/deploy.yml`, about a minute).

- Commit as Tony Wang <tonywang0321@gmail.com> so commits count on his GitHub profile: run
  `git config user.name "Tony Wang" && git config user.email "tonywang0321@gmail.com"` before committing.
- After finishing a change, verify it (`npx tsc --noEmit`, `npx eslint src`, and the preview), then commit with a
  descriptive message and push `main` so the link stays current.
- Backstop: a Stop hook (`.claude/hooks/auto-deploy.sh`) commits and pushes any leftover changes when a turn ends,
  as long as the project type-checks.
- The demo is public: keep it free of credential-style inputs (no password fields).
