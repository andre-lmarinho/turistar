#!/usr/bin/env bash
set -euo pipefail

COVERAGE_FILE="${CODECOV_COVERAGE_FILE:-coverage/lcov.info}"

if [[ -z "${CODECOV_TOKEN:-}" ]]; then
  echo "Codecov token not provided; skipping upload." >&2
  exit 0
fi

if [[ ! -f "$COVERAGE_FILE" ]]; then
  echo "Coverage file '$COVERAGE_FILE' not found; skipping upload." >&2
  exit 0
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

KEYRING="$TMP_DIR/codecov.gpg"
CODECOV_GPG_FINGERPRINT="806BB28AED779869"

curl --fail --silent --show-error --location --retry 5 --retry-all-errors \
  https://keybase.io/codecovsecurity/pgp_keys.asc \
  | gpg --batch --yes --no-default-keyring --keyring "$KEYRING" --import

gpg --batch --yes --no-default-keyring --keyring "$KEYRING" --fingerprint "$CODECOV_GPG_FINGERPRINT" >/dev/null

for artifact in codecov codecov.SHA256SUM codecov.SHA256SUM.sig; do
  curl --fail --silent --show-error --location --retry 5 --retry-all-errors \
    "https://cli.codecov.io/latest/linux/${artifact}" \
    --output "$TMP_DIR/${artifact}"
done

gpg --batch --yes --no-default-keyring --keyring "$KEYRING" --verify \
  "$TMP_DIR/codecov.SHA256SUM.sig" "$TMP_DIR/codecov.SHA256SUM"

LINUX_HASH=$(awk '$2 == "linux/codecov" { print $1 }' "$TMP_DIR/codecov.SHA256SUM")
if [[ -z "$LINUX_HASH" ]]; then
  echo "Unable to find linux checksum entry" >&2
  exit 1
fi

echo "$LINUX_HASH  $TMP_DIR/codecov" | sha256sum --check --status

chmod +x "$TMP_DIR/codecov"

"$TMP_DIR/codecov" --auto-load-params-from GithubActions upload-process \
  -t "$CODECOV_TOKEN" \
  -f "$COVERAGE_FILE" \
  -Z
