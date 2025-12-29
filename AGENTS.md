# AGENTS.md

## Blog Automation API

Base path: `/api/codex/v1`

Auth: `Authorization: Bearer $CODEX_API_TOKEN`

Local dev: `npm run dev`, then call `http://127.0.0.1:8787/api/codex/v1/...`

### Endpoints

- `GET /posts`
  - Query params: `status=draft|published`, `tag=<slug>`, `q=<text>`, `limit`, `cursor`
  - Returns: `{ posts: [{ id, slug, title, status, updated_at, published_at, tag_slugs }], next_cursor }`
  - `next_cursor` format: `<updated_at>|<id>` (use as the next `cursor`)

- `GET /posts/:id`
  - Returns full post including `body_markdown`, `tag_names`, `tag_slugs`

- `GET /posts/by-slug/:slug`
  - Returns full post (same shape as `/posts/:id`)

- `PATCH /posts/:id`
  - Partial updates. Fields: `title`, `summary`, `body_markdown`, `status`, `published_at`,
    `hero_image_url`, `hero_image_alt`, `featured`, `author_name`, `author_email`,
    `seo_title`, `seo_description`
  - Tags: `tags: ["Tag A", "Tag B"]` or `tags: { set: [...], add: [...], remove: [...] }`
  - Recompute: `recompute: { slugFromTitle: true, readingTime: true }`
  - Concurrency: `expected_updated_at` (ISO timestamp) -> returns `409` on mismatch

- `GET /tags`
  - Returns `{ tags: [{ id, name, slug, post_count }] }`

### Recommended workflow

1. `GET /posts?status=draft&q=...` to locate the target post.
2. `GET /posts/:id` to load the current source-of-truth.
3. Prepare a minimal edit (update only the needed fields).
4. `PATCH /posts/:id` with `expected_updated_at`.

### Example

```bash
curl -sS \
  -H "Authorization: Bearer $CODEX_API_TOKEN" \
  "http://127.0.0.1:8787/api/codex/v1/posts?status=draft&limit=20"
```
