#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:3000}"
ATTEMPTS=${WARMUP_ATTEMPTS:-3}
PATHS=("/" "/inspiration/rome")

for path in "${PATHS[@]}"; do
  for ((attempt = 1; attempt <= ATTEMPTS; attempt++)); do
    echo "Warming ${BASE_URL}${path} (attempt ${attempt}/${ATTEMPTS})"
    curl -sSf -o /dev/null "${BASE_URL}${path}"
    sleep 0.5
  done
  echo "Finished warming ${BASE_URL}${path}"
  echo
done
