#!/usr/bin/env bash
#
# Deploys origin/main to the dev site from a laptop: pulls the host checkout,
# rebuilds the dev profile, reseeds when lib/portfolio.ts changed, and
# smoke-tests. Seeding alone leaves pages that read lib/*.ts on old code, and
# rebuilding alone leaves /portfolio on old rows, so this does both.
#
#   npm run deploy:dev            # seed only if lib/portfolio.ts changed
#   npm run deploy:dev -- --seed  # always reseed
#
# Never touches production. The seed truncates applications and cascades to
# blockers and similarity_matches, which is why it does not run every time.

set -euo pipefail

HOST="devops@openera.insight.uidaho.edu"
SITE="https://aispeg-dev.insight.uidaho.edu"
ROUTES=(/ /portfolio /portfolio/pipeline /portfolio/scorecard /coordination /standards /reports)
FORCE_SEED="no"
[[ "${1:-}" == "--seed" ]] && FORCE_SEED="yes"

ssh -o BatchMode=yes "$HOST" FORCE_SEED="$FORCE_SEED" bash -s <<'REMOTE'
set -euo pipefail
cd ~/AISPEG
if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  echo "Host checkout has local changes; stopping." >&2
  exit 1
fi
[[ "$(git branch --show-current)" == "main" ]] || { echo "Host is not on main; stopping." >&2; exit 1; }

before=$(git rev-parse HEAD)
git pull --ff-only origin main
git submodule update --init
docker compose --profile dev up -d --build
echo "Deployed $(git log -1 --format='%h %s')"

if [[ "$FORCE_SEED" == "yes" ]] || ! git diff --quiet "$before" HEAD -- lib/portfolio.ts; then
  set -a; . ./.env; set +a
  docker run --rm --network aispeg_aispeg-net -v "$PWD":/app -w /app \
    -e DATABASE_URL="postgresql://${POSTGRES_USER:-aispeg}:${POSTGRES_PASSWORD:-aispeg_secret}@10.10.9.11:5432/${POSTGRES_DEV_DB:-aispeg_dev}" \
    node:20-alpine \
    sh -c "npm install --silent --no-save --no-fund --no-audit pg tsx && npx tsx scripts/seed-portfolio.ts" | tail -1
else
  echo "lib/portfolio.ts unchanged; seed skipped."
fi
REMOTE

failed=0
for route in "${ROUTES[@]}"; do
  code=""
  for _ in 1 2 3 4 5 6; do
    code=$(curl -sS -o /dev/null -L --max-time 15 -w '%{http_code}' "$SITE$route" || true)
    [[ "$code" == "200" ]] && break
    sleep 5
  done
  echo "$route $code"
  [[ "$code" == "200" ]] || failed=1
done
exit "$failed"
