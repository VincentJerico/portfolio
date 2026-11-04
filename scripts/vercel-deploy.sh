#!/usr/bin/env bash
# Builds locally and uploads the prebuilt output (D1), so the deploy carries the CV PDF generated from the
# same build (C12). Used by CI and by `pnpm deploy:preview` / `pnpm deploy:prod`.
#
#   scripts/vercel-deploy.sh preview|production
#
# Needs VERCEL_TOKEN, VERCEL_ORG_ID and VERCEL_PROJECT_ID in the environment. Prints the deployment URL on
# stdout's last line and, in GitHub Actions, writes `url` and `site_url` to $GITHUB_OUTPUT.
set -euo pipefail

target="${1:-}"
case "$target" in
  preview) prod_flag=() ;;
  production) prod_flag=(--prod) ;;
  *)
    echo "usage: $0 preview|production" >&2
    exit 2
    ;;
esac

for name in VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID; do
  if [ -z "${!name:-}" ]; then
    echo "$name is not set; stopping (token auth only, never vercel login)." >&2
    exit 1
  fi
done

# A tested build's planted-defect page must never ship.
unset E2E_SELFTEST

vercel pull --yes --environment="$target" --token "$VERCEL_TOKEN" >&2
vercel build ${prod_flag[@]+"${prod_flag[@]}"} --token "$VERCEL_TOKEN" >&2

# The CV script serves the build with `next start`, which reads the site URL at runtime from the same
# environment Vercel built with.
set -a
# shellcheck disable=SC1090
. ".vercel/.env.$target.local"
set +a
pnpm cv >&2
mkdir -p .vercel/output/static/cv
# `vercel build` may hard-link public files into the output; unlink first so the copy is this PDF.
rm -f .vercel/output/static/cv/*.pdf
cp public/cv/*.pdf .vercel/output/static/cv/

# JSON output reads the same in a terminal, in CI and in an agent session; a bare-URL stdout does not.
report="$(vercel deploy --prebuilt ${prod_flag[@]+"${prod_flag[@]}"} --json --token "$VERCEL_TOKEN")"
url="$(printf '%s' "$report" | node -e '
  const r = JSON.parse(require("fs").readFileSync(0, "utf8"));
  const url = r.deployment?.url ?? r.url;
  if (!/^https:\/\/\S+$/.test(url ?? "")) throw new Error("no deployment URL in vercel deploy output");
  process.stdout.write(url);
')"
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  # url: this deployment's own address; site_url: the address it serves as (the production domain).
  echo "url=$url" >> "$GITHUB_OUTPUT"
  echo "site_url=$NEXT_PUBLIC_SITE_URL" >> "$GITHUB_OUTPUT"
fi
echo "$url"
