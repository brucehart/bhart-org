#!/usr/bin/env bash
set -euo pipefail
API_BASE="https://bhart-org.bruce-hart.workers.dev/api/codex/v1"
AUTH_HEADER=( -H "Authorization: Bearer $CODEX_BHART_API_TOKEN" )

need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing $1" >&2; exit 1; }; }
need curl
need jq

process_status() {
  local status="$1"
  local cursor=""
  while :; do
    local url="$API_BASE/posts?status=$status&limit=50"
    if [ -n "$cursor" ]; then
      url+="&cursor=$(jq -rn --arg c "$cursor" '$c|@uri')"
    fi
    local list_json
    list_json="$(curl -sS "${AUTH_HEADER[@]}" "$url")"
    local ids
    ids="$(jq -r '.posts[].id' <<<"$list_json")"
    if [ -z "$ids" ]; then
      break
    fi
    while IFS= read -r id; do
      [ -z "$id" ] && continue
      local post_json
      post_json="$(curl -sS "${AUTH_HEADER[@]}" "$API_BASE/posts/$id")"
      local updated_at
      updated_at="$(jq -r '.post.updated_at' <<<"$post_json")"
      local tag_names
      tag_names="$(jq -r '.post.tag_names[]?' <<<"$post_json")"
      if [ -z "$tag_names" ]; then
        continue
      fi
      local lower_list
      lower_list="$(jq -r '.post.tag_names | map(ascii_downcase) | unique | @json' <<<"$post_json")"
      local current_list
      current_list="$(jq -r '.post.tag_names | @json' <<<"$post_json")"
      if [ "$current_list" = "$lower_list" ]; then
        continue
      fi
      echo "Updating $id ($status) tags: $current_list -> $lower_list" >&2
      local payload
      payload="$(jq -n --argjson tags "$lower_list" --arg expected "$updated_at" '{tags: $tags, expected_updated_at: $expected}')"
      local patched
      patched="$(curl -sS "${AUTH_HEADER[@]}" -H "Content-Type: application/json" -X PATCH -d "$payload" "$API_BASE/posts/$id")"
      local ok
      ok="$(jq -r '.post.id // empty' <<<"$patched")"
      if [ -z "$ok" ]; then
        echo "Failed to update $id" >&2
        echo "$patched" | jq . >&2 || true
        exit 1
      fi
    done <<<"$ids"

    local next_cursor
    next_cursor="$(jq -r '.next_cursor // empty' <<<"$list_json")"
    if [ -z "$next_cursor" ]; then
      break
    fi
    cursor="$next_cursor"
  done
}

process_status "draft"
process_status "published"

echo "DONE" >&2
