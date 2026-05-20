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

# Try the same branch; fall back to dev (for PRs) or main (for production) if it does not exist there.
FALLBACK="dev"
if [ "$REF" = "main" ]; then
  FALLBACK="main"
fi
if ! git clone --depth=1 --branch "$REF" "$REPO_URL" "$TARGET" 2>/dev/null; then
  echo "Branch '$REF' not in contracts → falling back to $FALLBACK."
  git clone --depth=1 --branch "$FALLBACK" "$REPO_URL" "$TARGET"
fi

npm install -g pnpm@11.0.8
(cd "$TARGET" && pnpm install --frozen-lockfile)
pnpm install --frozen-lockfile
