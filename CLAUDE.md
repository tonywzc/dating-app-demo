@AGENTS.md

## Publishing the demo

The shareable demo lives at https://tonywzc.github.io/dating-app-demo/ and redeploys on every push to `main`
(`.github/workflows/deploy.yml`, about a minute).

- After finishing a change, verify it (`npx tsc --noEmit`, `npx eslint src`, and the preview), then commit with a
  descriptive message and push `main` so the link stays current.
- Backstop: a Stop hook (`.claude/hooks/auto-deploy.sh`) commits and pushes any leftover changes when a turn ends,
  as long as the project type-checks.
- The demo is public: keep it free of credential-style inputs (no password fields).
