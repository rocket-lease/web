#!/usr/bin/env bash
# Vercel install hook for the source-only contracts model.
# Clones rocket-lease/contracts as a sibling so the local link: + tsconfig
# paths resolve at build time. See api/docs/adr/0007-contracts-as-source.md.
#
# Required Vercel env vars:
#   CONTRACTS_TOKEN — GitHub PAT with `repo` (read) scope on rocket-lease/contracts
#
# VERCEL_GIT_COMMIT_REF is the branch of the current deployment (Vercel sets it).
set -euo pipefail

REF="${VERCEL_GIT_COMMIT_REF:-main}"
TARGET="../contracts"

if [ -z "${CONTRACTS_TOKEN:-}" ]; then
  echo "::error:: CONTRACTS_TOKEN not set in Vercel project env."
  exit 1
fi

REPO_URL="https://${CONTRACTS_TOKEN}@github.com/rocket-lease/contracts.git"

# Try the same branch; fall back to main if it does not exist there.
if ! git clone --depth=1 --branch "$REF" "$REPO_URL" "$TARGET" 2>/dev/null; then
  echo "Branch '$REF' not in contracts → falling back to main."
  git clone --depth=1 "$REPO_URL" "$TARGET"
fi

corepack enable
pnpm install --frozen-lockfile
