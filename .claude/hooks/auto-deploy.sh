#!/bin/bash
# Stop hook: publish finished work to the live demo.
#
# When Claude finishes a turn and the working tree has changes, type-check the
# project; if it passes, commit everything and push main. The GitHub Pages
# workflow then redeploys https://tonywzc.github.io/dating-app-demo/ (~1 min).
# Type errors skip the publish, so a broken build never reaches the link.

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0

[ -n "$(git status --porcelain)" ] || exit 0                    # nothing to publish
[ "$(git rev-parse --abbrev-ref HEAD)" = "main" ] || exit 0     # only main deploys

if ! npx tsc --noEmit >/dev/null 2>&1; then
  echo '{"systemMessage": "Auto-deploy skipped: the project has type errors. It will publish once they are fixed."}'
  exit 0
fi

changed=$(git status --porcelain | awk '{print $NF}' | xargs -n1 basename | head -4 | paste -sd ',' - | sed 's/,/, /g')
git add -A
git commit -q -m "Update demo: ${changed}" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" || exit 0

if git push -q origin main 2>/dev/null; then
  echo '{"systemMessage": "Published to https://tonywzc.github.io/dating-app-demo/ (live in about a minute)."}'
else
  echo '{"systemMessage": "Auto-deploy committed the changes but the push failed. Run: git push origin main"}'
fi
