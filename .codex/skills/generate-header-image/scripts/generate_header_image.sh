#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  generate_header_image.sh --slug <post-slug> [options]
  generate_header_image.sh --post-id <post-id> [options]

Options:
  --prompt <text>                 Prompt text for the image model
  --prompt-file <file>            Read prompt text from a file
  --logo-url <url>                URL for a logo to include (also passed as an input image when supported)
  --alt <text>                    Alt text (if omitted, a basic one is generated)
  --model <owner/name>            Replicate model (default: google/nano-banana-pro)
  --replicate-input <json-file>   JSON file containing the Replicate 'input' object (overrides default input)
  --aspect-ratio <ratio>          Aspect ratio (default: 16:9)
  --resolution <val>              Model resolution (default: 2K)
  --output-format <fmt>           Output format (default: jpg)
  --key-prefix <prefix>           R2 key prefix for media import (default: headers)
  --api-base <url>                Bhart Codex API base (default: https://bhart-org.bruce-hart.workers.dev/api/codex/v1)

Env:
  CODEX_BHART_API_TOKEN
  REPLICATE_API_TOKEN

Examples:
  bash generate_header_image.sh --slug web-tools-my-tiny-tool-factory-on-cloudflare-workers \
    --prompt-file prompt.txt \
    --logo-url https://bhart.org/media/webtools.png \
    --model openai/gpt-image-1.5
EOF
}

need_bin() {
  command -v "$1" >/dev/null 2>&1 || { echo "Missing required binary: $1" >&2; exit 1; }
}

need_env() {
  local name="$1"
  if [ -z "${!name:-}" ]; then
    echo "Missing required env var: $name" >&2
    exit 1
  fi
}

post_id=""
post_slug=""
prompt=""
prompt_file=""
logo_url=""
alt_text=""
replicate_model="google/nano-banana-pro"
replicate_input_file=""
key_prefix="headers"
api_base="https://bhart-org.bruce-hart.workers.dev/api/codex/v1"
aspect_ratio="16:9"
resolution="2K"
output_format="jpg"
safety_filter_level="block_only_high"

while [ $# -gt 0 ]; do
  case "$1" in
    --post-id) post_id="${2:-}"; shift 2 ;;
    --slug) post_slug="${2:-}"; shift 2 ;;
    --prompt) prompt="${2:-}"; shift 2 ;;
    --prompt-file) prompt_file="${2:-}"; shift 2 ;;
    --logo-url) logo_url="${2:-}"; shift 2 ;;
    --alt) alt_text="${2:-}"; shift 2 ;;
    --model) replicate_model="${2:-}"; shift 2 ;;
    --replicate-input) replicate_input_file="${2:-}"; shift 2 ;;
    --aspect-ratio) aspect_ratio="${2:-}"; shift 2 ;;
    --resolution) resolution="${2:-}"; shift 2 ;;
    --output-format) output_format="${2:-}"; shift 2 ;;
    --key-prefix) key_prefix="${2:-}"; shift 2 ;;
    --api-base) api_base="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; usage; exit 1 ;;
  esac
done

need_bin curl
need_bin jq
need_env CODEX_BHART_API_TOKEN
need_env REPLICATE_API_TOKEN

if [ -n "$prompt_file" ]; then
  if [ ! -f "$prompt_file" ]; then
    echo "Prompt file not found: $prompt_file" >&2
    exit 1
  fi
  prompt="$(cat "$prompt_file")"
fi

if [ -z "$prompt" ]; then
  echo "Missing --prompt or --prompt-file" >&2
  usage
  exit 1
fi

if [ -z "$post_id" ] && [ -z "$post_slug" ]; then
  echo "Missing --post-id or --slug" >&2
  usage
  exit 1
fi

auth_header=( -H "Authorization: Bearer $CODEX_BHART_API_TOKEN" )

if [ -n "$post_slug" ]; then
  encoded_slug="$(jq -rn --arg s "$post_slug" '$s|@uri')"
  post_json="$(curl -sS "${auth_header[@]}" "$api_base/posts/by-slug/$encoded_slug")"
else
  post_json="$(curl -sS "${auth_header[@]}" "$api_base/posts/$post_id")"
fi

post_id="$(jq -r '.post.id' <<<"$post_json")"
expected_updated_at="$(jq -r '.post.updated_at' <<<"$post_json")"
post_title="$(jq -r '.post.title' <<<"$post_json")"
author_name="$(jq -r '.post.author_name' <<<"$post_json")"
author_email="$(jq -r '.post.author_email' <<<"$post_json")"

if [ -z "$alt_text" ]; then
  if [ -n "$logo_url" ]; then
    alt_text="Header graphic for \"$post_title\" featuring the project logo and abstract tool tiles on a dark gradient background."
  else
    alt_text="Header graphic for \"$post_title\" with abstract tool tiles on a dark gradient background."
  fi
fi

replicate_input_json=""
if [ -n "$replicate_input_file" ]; then
  if [ ! -f "$replicate_input_file" ]; then
    echo "Replicate input JSON file not found: $replicate_input_file" >&2
    exit 1
  fi
  replicate_input_json="$(cat "$replicate_input_file")"
else
  # Default input for google/nano-banana-pro. For other models, pass --replicate-input to match that model's schema.
  replicate_input_json="$(jq -n \
    --arg prompt "$prompt" \
    --arg aspect_ratio "$aspect_ratio" \
    --arg resolution "$resolution" \
    --arg output_format "$output_format" \
    --arg safety_filter_level "$safety_filter_level" \
    --arg logo "$logo_url" \
    '{
      prompt: $prompt,
      aspect_ratio: $aspect_ratio,
      resolution: $resolution,
      output_format: $output_format,
      safety_filter_level: $safety_filter_level
    }
    + (if ($logo|length) > 0 then { image_input: [ $logo ] } else {} end)'
  )"
fi

echo "Creating Replicate prediction for model: $replicate_model" >&2
prediction_json="$(curl -sS \
  -H "Authorization: Token $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --argjson input "$replicate_input_json" '{input: $input}')" \
  "https://api.replicate.com/v1/models/$replicate_model/predictions")"

prediction_id="$(jq -r '.id' <<<"$prediction_json")"
if [ -z "$prediction_id" ] || [ "$prediction_id" = "null" ]; then
  echo "Failed to create prediction. Response:" >&2
  echo "$prediction_json" | jq . >&2 || true
  exit 1
fi

status="$(jq -r '.status' <<<"$prediction_json")"
while [ "$status" = "starting" ] || [ "$status" = "processing" ]; do
  sleep 2
  prediction_json="$(curl -sS -H "Authorization: Token $REPLICATE_API_TOKEN" "https://api.replicate.com/v1/predictions/$prediction_id")"
  status="$(jq -r '.status' <<<"$prediction_json")"
done

if [ "$status" != "succeeded" ]; then
  echo "Prediction failed with status: $status" >&2
  echo "$prediction_json" | jq . >&2 || true
  exit 1
fi

output_url="$(jq -r '
  if (.output|type) == "string" then .output
  elif (.output|type) == "array" then (.output[0] // empty)
  elif (.output|type) == "object" and (.output.url? != null) then .output.url
  else empty end
' <<<"$prediction_json")"

if [ -z "$output_url" ] || [ "$output_url" = "null" ]; then
  echo "Could not determine output URL from prediction output." >&2
  echo "$prediction_json" | jq . >&2 || true
  exit 1
fi

echo "Importing generated image into R2 via Bhart Codex API..." >&2
media_payload="$(jq -n \
  --arg source_url "$output_url" \
  --arg alt_text "$alt_text" \
  --arg author_name "$author_name" \
  --arg author_email "$author_email" \
  --arg key_prefix "$key_prefix" \
  --arg internal_description "Generated via Replicate ($replicate_model), prediction $prediction_id" \
  '{
    source_url: $source_url,
    alt_text: $alt_text,
    author_name: $author_name,
    author_email: $author_email,
    key_prefix: $key_prefix,
    internal_description: $internal_description,
    tags: ["header", "generated", "replicate"]
  }')"

media_json="$(curl -sS "${auth_header[@]}" \
  -H "Content-Type: application/json" \
  -d "$media_payload" \
  "$api_base/media/import")"

media_url="$(jq -r '.media.url // empty' <<<"$media_json")"
if [ -z "$media_url" ]; then
  err_code="$(jq -r '.error.code // empty' <<<"$media_json")"
  if [ "$err_code" = "not_found" ]; then
    echo "Warning: media import endpoint not found; falling back to external image URL." >&2
    media_url="$output_url"
  else
    echo "Media import failed. Response:" >&2
    echo "$media_json" | jq . >&2 || true
    exit 1
  fi
fi

echo "Updating post hero image fields..." >&2
patch_payload="$(jq -n \
  --arg hero_image_url "$media_url" \
  --arg hero_image_alt "$alt_text" \
  --arg expected_updated_at "$expected_updated_at" \
  '{hero_image_url: $hero_image_url, hero_image_alt: $hero_image_alt, expected_updated_at: $expected_updated_at}')"

patched="$(curl -sS "${auth_header[@]}" \
  -H "Content-Type: application/json" \
  -X PATCH \
  -d "$patch_payload" \
  "$api_base/posts/$post_id")"

patched_post_id="$(jq -r '.post.id // empty' <<<"$patched")"
if [ -z "$patched_post_id" ]; then
  echo "Post update failed. Response:" >&2
  echo "$patched" | jq . >&2 || true
  exit 1
fi

echo "$patched" | jq -r '"OK\npost_id=\(.post.id)\nslug=\(.post.slug)\nhero_image_url=\(.post.hero_image_url)\nhero_image_alt=\(.post.hero_image_alt)\n"' >&2
