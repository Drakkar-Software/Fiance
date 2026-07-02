#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "--" ]; then
  shift
fi
IPA_PATH="${1:-}"
if [ -z "$IPA_PATH" ]; then
  echo "Usage: pnpm --filter fiance submit:ios:xcode -- <path-to-ipa>" >&2
  exit 1
fi

: "${ASC_API_KEY_ID:?Set ASC_API_KEY_ID (App Store Connect API key ID)}"
: "${ASC_API_ISSUER_ID:?Set ASC_API_ISSUER_ID (App Store Connect API issuer ID)}"

xcrun altool --upload-app \
  --type ios \
  --file "$IPA_PATH" \
  --apiKey "$ASC_API_KEY_ID" \
  --apiIssuer "$ASC_API_ISSUER_ID"
