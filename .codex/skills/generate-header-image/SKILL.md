---
name: generate-header-image
description: Generate a blog post header image via Replicate, import it into Bhart R2 media storage, and set the post hero_image_url + hero_image_alt via the Bhart Codex API.
---

# Generate Header Image

Use this skill when the user wants to create or replace an existing post's header/hero image.

This workflow:
1) generates an image with Replicate
2) imports the generated image URL into the bhart.org R2 media bucket (so it is served from `/media/...`)
3) updates the target post's `hero_image_url` + `hero_image_alt`

## Requirements

- `CODEX_BHART_API_TOKEN` (for Bhart Blog Automation API)
- `REPLICATE_API_TOKEN` (for Replicate)

## Bhart API note

This skill uses a Codex API media helper endpoint:
- `POST /api/codex/v1/media/import`
  - Downloads `source_url` (must be an image) into the `MEDIA_BUCKET` R2 bucket
  - Creates a `media_assets` row in D1
  - Returns `{ media: { id, key, url, ... } }` where `url` is a site-local `/media/<key>` URL

## Recommended workflow

1) Identify the post:
   - `GET /posts/by-slug/:slug` (preferred) or `GET /posts/:id`
2) Generate alt text:
   - Keep it short, descriptive, and literal (what the image shows), not marketing copy.
3) Generate the image on Replicate:
   - Prefer passing the logo as an input image if the model supports it (e.g. OpenAI image models support `input_images`).
4) Import into R2:
   - Call `POST /media/import` with `source_url`, `alt_text`, and the post author fields.
5) Update the post hero fields:
   - `PATCH /posts/:id` with `hero_image_url`, `hero_image_alt`, and `expected_updated_at`.

## Script (preferred)

Run:

`bash .codex/skills/generate-header-image/scripts/generate_header_image.sh --slug <post-slug> --prompt-file <prompt.txt> --logo-url <https://.../logo.png>`

Notes:
- Set `--model` and `--replicate-input` if you are using a model that needs custom input fields.
- Default model is `google/nano-banana-pro`.
- Default aspect ratio is `16:9` (header-friendly); override via `--aspect-ratio`.
- If you omit `--replicate-input`, the script uses a default input compatible with `google/nano-banana-pro` (`prompt`, `image_input`, `aspect_ratio`, `resolution`, `output_format`).
