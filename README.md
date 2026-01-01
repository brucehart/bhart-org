# bhart-org

A Cloudflare Workers + D1 powered blog with Mustache templates, Markdown content, Google OAuth admin, and R2 media storage.

## Features

- Public pages: home, about, projects, news, work-with-me, contact, archive, and article detail pages.
- Admin area: Google OAuth login, post/news create/edit/delete, tags, drafts, featured images, and scheduling.
- Markdown articles rendered server-side with RSS feed support.
- Media library backed by R2 with metadata stored in D1.

## Requirements

- Node.js + npm
- Cloudflare Wrangler CLI
- Cloudflare account with Workers, D1, and R2 enabled

## Local Development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

## Configuration

### Wrangler

The Worker is configured in `wrangler.jsonc` with D1 and R2 bindings.

### OAuth

Set the Google OAuth credentials:

```bash
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
```

If you need a fixed redirect URL (custom domain), set:

```bash
wrangler secret put GOOGLE_OAUTH_REDIRECT_URI
```

Authorized redirect URI examples:

- `https://<your-worker>.workers.dev/admin/callback`
- `http://localhost:8787/admin/callback`

### Database

Apply migrations:

```bash
wrangler d1 migrations apply bhart-org
```

Seed an authorized admin user (replace values as needed):

```bash
wrangler d1 execute bhart-org --command "INSERT INTO authorized_users (id, email, name, is_active, created_at) VALUES ('<uuid>', 'you@example.com', 'Your Name', 1, '2024-01-01T00:00:00.000Z');"
```

### R2

Create the media bucket if it does not exist:

```bash
wrangler r2 bucket create bhart-org
```

Images uploaded in the admin are stored in R2 and indexed in D1.

## Routes

- `/` home page
- `/about` about page
- `/projects` projects page
- `/news` news page
- `/work-with-me` services page
- `/contact` contact page
- `/archive` archive page
- `/articles/:slug` article page
- `/rss.xml` RSS feed
- `/admin` post list (requires login)
- `/admin/posts/new` new post
- `/admin/posts/:id` edit post
- `/admin/news/new` new news item
- `/admin/news/:id` edit news item
- `/admin/media` media library
- `/media/<key>` media asset delivery (public)

## Notes

- The media list is sourced from D1. Existing objects in R2 are not shown until uploaded through the admin.
- Images are served via `/media/...` and cached with long-lived headers.

## Deploy

```bash
wrangler deploy
```
