#!/usr/bin/env bash
# Commits src/generated/quality.json for the commit a main run tested and pushes it to main. Used by the
# Release job, with GIT_SSH_COMMAND set for the release deploy key.
#
#   scripts/push-quality-report.sh <remote> <tested commit>
#
# Main can move while a run is in progress. If a newer code commit landed, its own run publishes a newer
# report, so this one is skipped. If only report commits landed (an earlier run's), this report is rebuilt
# on top of them, so the newest tested commit's report always wins.
set -euo pipefail

remote="${1:-}"
tested="${2:-}"
if [ -z "$remote" ] || [ -z "$tested" ]; then
  echo "usage: $0 <remote> <tested commit>" >&2
  exit 2
fi
report=src/generated/quality.json
message="chore(quality): update report [skip ci]"

git add "$report"
git diff --cached --quiet && exit 0
git commit -q -m "$message"

for attempt in 1 2 3; do
  git push -q "$remote" HEAD:main && exit 0
  git fetch -q "$remote" main
  if ! git merge-base --is-ancestor "$tested" FETCH_HEAD; then
    echo "::error::main no longer contains $tested; its report was not pushed."
    exit 1
  fi
  if [ -n "$(git rev-list "$tested..FETCH_HEAD" -- . ":(exclude)$report")" ]; then
    echo "::notice::main moved past $tested; the newer commit's run publishes its own report."
    exit 0
  fi
  # Only reports landed since the tested commit, so the trees differ in the report alone: keep this one.
  git reset -q --soft FETCH_HEAD
  git diff --cached --quiet && exit 0
  git commit -q -m "$message"
  echo "Main had a newer report commit; retrying on top of it (attempt $attempt)."
done
echo "::error::the report could not be pushed after 3 attempts."
exit 1
