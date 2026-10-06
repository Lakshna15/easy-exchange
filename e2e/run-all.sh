#!/usr/bin/env bash
# Runs every browser check against a fresh copy of the demo data.
# Needs Python 3 with Playwright (pip install playwright && playwright install chromium).
# Usage, from the project folder:  bash e2e/run-all.sh
set -u
cd "$(dirname "$0")/.."
PORT=${PORT:-3456}
export DATABASE_FILE=${DATABASE_FILE:-$(mktemp -d)/e2e.db}
BASE="http://localhost:$PORT"

if curl -s -o /dev/null "$BASE/"; then
  echo "Port $PORT is already in use. Stop that server or set PORT to a free port." >&2
  exit 2
fi

npm run --silent db:reset >/dev/null
# Run the server in its own process group so the whole tree (npx, next, next-server) stops at the end.
setsid npx next dev -p "$PORT" >/tmp/easy-exchange-e2e-server.log 2>&1 &
SERVER=$!
trap 'kill -- -$SERVER 2>/dev/null' EXIT
for _ in $(seq 1 60); do curl -s -o /dev/null "$BASE/login" && break; sleep 1; done

status=0
for check in check_m2_accounts check_m3_listings check_m4_browse check_m5_swaps check_m6_quality; do
  npm run --silent db:reset >/dev/null      # every check starts from the seed
  echo "== $check"
  python3 "e2e/$check.py" "$BASE" "$DATABASE_FILE" || status=1
done
exit $status
