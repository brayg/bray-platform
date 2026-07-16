#!/usr/bin/env bash
# Case-insensitive gate: no Scenarios-era wire vocabulary in platform package source
# except documented allowlist (see CONTRIBUTING.md).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

is_allowed() {
  local file="$1"
  local content="$2"

  # (a) explicit deprecation marker
  if [[ "$content" == *DEPRECATED* ]]; then
    return 0
  fi

  # (c) doc-comments (block or line)
  if [[ "$content" =~ ^[[:space:]]*(\*|/\*\*) ]]; then
    return 0
  fi

  # (b) legacy* identifiers in star-map path modules
  if [[ "$file" == *star-map-paths.ts ]] || [[ "$file" == *TeamStarMapComponents.tsx ]]; then
    if [[ "$content" =~ legacy[A-Za-z0-9_]* ]]; then
      return 0
    fi
  fi

  return 1
}

violations=0

while IFS= read -r entry; do
  [[ -z "$entry" ]] && continue
  file=$(printf '%s\n' "$entry" | sed -n 's/^\(.*\):[0-9][0-9]*:.*/\1/p')
  line_num=$(printf '%s\n' "$entry" | sed -n 's/^.*:\([0-9][0-9]*\):.*/\1/p')
  content=$(printf '%s\n' "$entry" | sed -n 's/^.*:[0-9][0-9]*:\(.*\)/\1/p')

  if is_allowed "$file" "$content"; then
    continue
  fi

  echo "VOCABULARY: ${file#./}:${line_num}:${content}"
  violations=$((violations + 1))
done < <(grep -rni 'scenario\|roleplay' packages/*/src 2>/dev/null || true)

if [[ "$violations" -gt 0 ]]; then
  echo ""
  echo "Found $violations case-insensitive scenario/roleplay match(es) outside the allowlist."
  echo "See CONTRIBUTING.md — Scenarios vocabulary gate."
  exit 1
fi

echo "Scenarios vocabulary gate: OK"
