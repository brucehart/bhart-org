# AGENTS.md

## Blog Automation API

Base path: `/api/codex/v1`

Auth: `Authorization: Bearer $CODEX_BHART_API_TOKEN`

Production: `https://bhart.org/api/codex/v1/...`

Local dev: `npm run dev`, then call `http://localhost:8787/api/codex/v1/...`

### Endpoints

- `GET /posts`
  - Query params: `status=draft|published`, `tag=<slug>`, `q=<text>`, `limit`, `cursor`
  - Returns: `{ posts: [{ id, slug, title, status, updated_at, published_at, tag_slugs }], next_cursor }`
  - `next_cursor` format: `<updated_at>|<id>` (use as the next `cursor`)

- `GET /posts/:id`
  - Returns full post including `body_markdown`, `tag_names`, `tag_slugs`

- `GET /posts/by-slug/:slug`
  - Returns full post (same shape as `/posts/:id`)

- `POST /posts`
  - Creates a new post.
  - Required: `title`, `summary`, `body_markdown`, `tags`, `author_name`, `author_email`
  - Optional: `slug` (otherwise computed from `title`), `status` (`draft` default), `published_at` (required if `status=published`),
    `hero_image_url`, `hero_image_alt`, `featured`, `seo_title`, `seo_description`

- `PATCH /posts/:id`
  - Partial updates. Fields: `title`, `summary`, `body_markdown`, `status`, `published_at`,
    `hero_image_url`, `hero_image_alt`, `featured`, `author_name`, `author_email`,
    `seo_title`, `seo_description`
  - Tags: `tags: ["Tag A", "Tag B"]` or `tags: { set: [...], add: [...], remove: [...] }`
  - Recompute: `recompute: { slugFromTitle: true, readingTime: true }`
  - Concurrency: `expected_updated_at` (ISO timestamp) -> returns `409` on mismatch

- `GET /news`
  - Query params: `status=draft|published`, `q=<text>`, `limit`, `cursor`
  - Returns: `{ news_items: [{ id, title, category, status, updated_at, published_at }], next_cursor }`
  - `next_cursor` format: `<updated_at>|<id>` (use as the next `cursor`)

- `GET /news/:id`
  - Returns full news item including `body_markdown`

- `POST /news`
  - Creates a new news item.
  - Required: `category`, `title`, `body_markdown`
  - Optional: `status` (`draft` default), `published_at` (required if `status=published`)

- `PATCH /news/:id`
  - Partial updates. Fields: `category`, `title`, `body_markdown`, `status`, `published_at`
  - Concurrency: `expected_updated_at` (ISO timestamp) -> returns `409` on mismatch

- `GET /tags`
  - Returns `{ tags: [{ id, name, slug, post_count }] }`

### Recommended workflow

1. `GET /posts?status=draft&q=...` to locate the target post.
2. `GET /posts/:id` to load the current source-of-truth.
3. Prepare a minimal edit (update only the needed fields).
4. `PATCH /posts/:id` with `expected_updated_at`.

News workflow mirrors posts:
1. `GET /news?status=draft&q=...` to locate the target item.
2. `GET /news/:id` to load the current source-of-truth.
3. Prepare a minimal edit (update only the needed fields).
4. `PATCH /news/:id` with `expected_updated_at`.

### Example

```bash
curl -sS \
  -H "Authorization: Bearer $CODEX_BHART_API_TOKEN" \
  "https://bhart.org/api/codex/v1/posts?status=draft&limit=20"
```

## Sprite Content Drafting

Admin UI: `/admin/draft-article`

The workspace can create either:

- article drafts through the `draft-article` skill and `POST /posts`
- news item drafts through the `create-news-item` skill and `POST /news`

Browser job API:

- `GET /admin/article-agent/jobs`
- `POST /admin/article-agent/jobs`
- `GET /admin/article-agent/jobs/:id`
- `GET /admin/article-agent/jobs/:id/events`
- `POST /admin/article-agent/jobs/:id/messages`
- `POST /admin/article-agent/jobs/:id/cancel`

Runner callback API:

- `GET /api/article-agent/jobs/:id/runner.py`
- `GET /api/article-agent/jobs/:id/bootstrap`
- `GET /api/article-agent/jobs/:id/refs/:refId`
- `GET /api/article-agent/jobs/:id/messages?after=:id`
- `POST /api/article-agent/jobs/:id/events`
- `PATCH /api/article-agent/jobs/:id`

Required Worker secrets:

- `SPRITES_API_TOKEN`
- `BHART_ARTICLE_AGENT_ALLOWED_EMAILS`
- existing `CODEX_API_TOKEN`

Sprite-side Codex auth must be project-specific. This project uses `BHART_ARTICLE_AGENT_CODEX_HOME=/home/sprite/.codex-bhart-org`, so Codex auth should live at `/home/sprite/.codex-bhart-org/auth.json`. Do not copy `auth.json` from another Sprite or project; create a fresh login inside this Sprite with `mkdir -p /home/sprite/.codex-bhart-org && CODEX_HOME=/home/sprite/.codex-bhart-org codex login --device-auth`.

Sprite-side secrets live in `/home/sprite/.config/secrets/codex.env` and should include `CODEX_BHART_API_TOKEN` plus `BHART_CODEX_API_BASE=https://bhart.org/api/codex/v1`.

The article-agent runner must use the existing `draft-article` skill for articles and the existing `create-news-item` skill for news items. Successful runs end with `BHART_ARTICLE_AGENT_RESULT_JSON=` followed by compact JSON. Article runs include real `post_id`, `slug`, `title`, and `status`; news runs include real `news_id`, `title`, `category`, and `status`.

## Writing Style

- Voice: informal, smart, humble, curious; avoid hype, keep it human and specific.
- Thesis-first: open with a hook and state the main point early (often as a bold line or a short standalone sentence).
- Idea-driven: bring 2–4 interesting ideas/mental models, not just a changelog; show reasoning and tradeoffs.
- Structure: short paragraphs, lots of whitespace, and `##` section headings that read like claims.
- Tone mechanics: use punchy emphasis lines; occasional “not X, but Y” contrasts; admit uncertainty when appropriate.
- Content mix: AI + tech opinions, “where we’re headed” sketches, personal stories, side projects, and occasional fun internet stuff.
- Endings: invite readers to reach out, collaborate, or discuss.
