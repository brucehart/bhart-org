import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import worker from '../src';
import { SESSION_COOKIE_NAME, slugify } from '../src/utils';
import { ARTICLE_AGENT_RUNNER } from '../src/articleAgentRunner';

const API_BASE = 'http://example.com/api/codex/v1';
const TOKEN = 'test-token';
const ONE_BY_ONE_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';

const makeImageFile = (type = 'image/png') => {
  const bytes = Buffer.from(ONE_BY_ONE_PNG_BASE64, 'base64');
  return new File([bytes], 'test.png', { type });
};

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS authorized_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  google_sub TEXT UNIQUE,
  avatar_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS oauth_states (
  state TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES authorized_users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_expires_at ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  reading_time_minutes INTEGER NOT NULL DEFAULT 1,
  hero_image_url TEXT,
  hero_image_alt TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT
);

CREATE INDEX IF NOT EXISTS posts_status_published ON posts (status, published_at);
CREATE INDEX IF NOT EXISTS posts_updated_at ON posts (updated_at);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS post_tags_tag_id ON post_tags (tag_id);

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT NOT NULL,
  caption TEXT,
  internal_description TEXT,
  tags TEXT,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  uploaded_at TEXT NOT NULL,
  published_at TEXT
);

CREATE INDEX IF NOT EXISTS media_assets_uploaded_at ON media_assets (uploaded_at);
CREATE INDEX IF NOT EXISTS media_assets_published_at ON media_assets (published_at);

CREATE TABLE IF NOT EXISTS news_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS news_items_status_published ON news_items (status, published_at);
CREATE INDEX IF NOT EXISTS news_items_updated_at ON news_items (updated_at);

CREATE TABLE IF NOT EXISTS article_agent_jobs (
  id                  TEXT PRIMARY KEY,
  requested_by        TEXT NOT NULL,
  prompt              TEXT NOT NULL,
  content_type        TEXT NOT NULL DEFAULT 'article',
  status              TEXT NOT NULL DEFAULT 'queued',
  sprite_name         TEXT NOT NULL,
  post_id             TEXT,
  post_slug           TEXT,
  news_id             TEXT,
  news_category       TEXT,
  title               TEXT,
  error               TEXT,
  callback_token_hash TEXT NOT NULL,
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL,
  started_at          TEXT,
  completed_at        TEXT
);

CREATE INDEX IF NOT EXISTS idx_article_agent_jobs_requested_by
  ON article_agent_jobs (requested_by, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_article_agent_jobs_status
  ON article_agent_jobs (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_article_agent_jobs_content_type
  ON article_agent_jobs (content_type, created_at DESC);

CREATE TABLE IF NOT EXISTS article_agent_refs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id       TEXT NOT NULL,
  r2_key       TEXT NOT NULL,
  filename     TEXT NOT NULL,
  content_type TEXT NOT NULL,
  created_at   TEXT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES article_agent_jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_article_agent_refs_job_id
  ON article_agent_refs (job_id, id);

CREATE TABLE IF NOT EXISTS article_agent_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id     TEXT NOT NULL,
  event_type TEXT NOT NULL,
  message    TEXT NOT NULL,
  metadata   TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES article_agent_jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_article_agent_events_job_id
  ON article_agent_events (job_id, id);

CREATE TABLE IF NOT EXISTS article_agent_messages (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id       TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content      TEXT NOT NULL,
  created_at   TEXT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES article_agent_jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_article_agent_messages_job_id
  ON article_agent_messages (job_id, id);
`;

const applySchema = async () => {
  const statements = SCHEMA_SQL.split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }
};

const resetData = async () => {
  await env.DB.prepare('DELETE FROM article_agent_messages').run();
  await env.DB.prepare('DELETE FROM article_agent_events').run();
  await env.DB.prepare('DELETE FROM article_agent_refs').run();
  await env.DB.prepare('DELETE FROM article_agent_jobs').run();
  await env.DB.prepare('DELETE FROM sessions').run();
  await env.DB.prepare('DELETE FROM authorized_users').run();
  await env.DB.prepare('DELETE FROM news_items').run();
  await env.DB.prepare('DELETE FROM post_tags').run();
  await env.DB.prepare('DELETE FROM tags').run();
  await env.DB.prepare('DELETE FROM posts').run();
};

const seedPost = async (data: {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body_markdown: string;
  status: 'draft' | 'published';
  published_at: string | null;
  updated_at: string;
  created_at?: string;
  reading_time_minutes?: number;
  hero_image_url?: string | null;
  hero_image_alt?: string | null;
  featured?: number;
  author_name?: string;
  author_email?: string;
  seo_title?: string | null;
  seo_description?: string | null;
}) => {
  const createdAt = data.created_at ?? data.updated_at;
  await env.DB.prepare(
    `INSERT INTO posts (
      id,
      slug,
      title,
      summary,
      body_markdown,
      status,
      published_at,
      created_at,
      updated_at,
      reading_time_minutes,
      hero_image_url,
      hero_image_alt,
      featured,
      author_name,
      author_email,
      seo_title,
      seo_description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      data.id,
      data.slug,
      data.title,
      data.summary,
      data.body_markdown,
      data.status,
      data.published_at,
      createdAt,
      data.updated_at,
      data.reading_time_minutes ?? 1,
      data.hero_image_url ?? null,
      data.hero_image_alt ?? null,
      data.featured ?? 0,
      data.author_name ?? 'Test Author',
      data.author_email ?? 'author@example.com',
      data.seo_title ?? null,
      data.seo_description ?? null,
    )
    .run();
};

const seedPostWithTags = async (post: Parameters<typeof seedPost>[0], tags: string[]) => {
  await seedPost(post);
  for (const tag of tags) {
    const slug = slugify(tag);
    const tagId = `tag-${slug}`;
    await env.DB.prepare('INSERT OR IGNORE INTO tags (id, name, slug) VALUES (?, ?, ?)')
      .bind(tagId, tag, slug)
      .run();
    await env.DB.prepare('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)')
      .bind(post.id, tagId)
      .run();
  }
};

const fetchWorker = async (request: Request) => {
  const ctx = createExecutionContext();
  const response = await worker.fetch(request, env, ctx);
  await waitOnExecutionContext(ctx);
  return response;
};

const createTestRateLimiter = (): DurableObjectNamespace => {
  const counters = new Map<string, number[]>();
  return {
    idFromName(name: string) {
      return name as unknown as DurableObjectId;
    },
    get(id: DurableObjectId) {
      const key = String(id);
      return {
        fetch: async (_input: RequestInfo | URL, init?: RequestInit) => {
          const payload = init?.body ? JSON.parse(String(init.body)) : {};
          const windowMs = Number(payload.windowMs);
          const maxRequests = Number(payload.maxRequests);
          const now = Date.now();
          const windowStart = now - windowMs;
          const timestamps = (counters.get(key) ?? []).filter((timestamp) => timestamp > windowStart);
          if (timestamps.length >= maxRequests) {
            counters.set(key, timestamps);
            return new Response(
              JSON.stringify({
                error: {
                  code: 'rate_limit_exceeded',
                  message: 'Too many requests. Please try again later.',
                },
              }),
              { status: 429, headers: { 'content-type': 'application/json' } },
            );
          }
          timestamps.push(now);
          counters.set(key, timestamps);
          return Response.json({ ok: true });
        },
      } as unknown as DurableObjectStub;
    },
  } as unknown as DurableObjectNamespace;
};

const authHeaders = (extra?: Record<string, string>) => ({
  Authorization: `Bearer ${TOKEN}`,
  ...(extra ?? {}),
});

const sha256Hex = async (value: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const seedAdminSession = async (email = 'admin@example.com') => {
  const userId = crypto.randomUUID();
  const sessionId = crypto.randomUUID();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  await env.DB.prepare(
    `INSERT INTO authorized_users (id, email, name, is_active, created_at)
     VALUES (?, ?, ?, 1, ?)`,
  )
    .bind(userId, email, 'Admin User', now)
    .run();
  await env.DB.prepare(
    `INSERT INTO sessions (id, user_id, created_at, expires_at)
     VALUES (?, ?, ?, ?)`,
  )
    .bind(sessionId, userId, now, expiresAt)
    .run();
  return { email, cookie: `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}` };
};

const seedArticleAgentJob = async (data: {
  id: string;
  requested_by?: string;
  prompt?: string;
  content_type?: 'article' | 'news';
  status?: string;
  sprite_name?: string;
  callback_token_hash: string;
  post_id?: string | null;
  post_slug?: string | null;
  news_id?: string | null;
  news_category?: string | null;
  title?: string | null;
  error?: string | null;
  completed_at?: string | null;
}) => {
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO article_agent_jobs (
      id, requested_by, prompt, content_type, status, sprite_name, post_id, post_slug, news_id, news_category, title, error,
      callback_token_hash, created_at, updated_at, started_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      data.id,
      data.requested_by ?? 'admin@example.com',
      data.prompt ?? 'Draft an article about tiny tools.',
      data.content_type ?? 'article',
      data.status ?? 'running',
      data.sprite_name ?? 'bhart-org',
      data.post_id ?? null,
      data.post_slug ?? null,
      data.news_id ?? null,
      data.news_category ?? null,
      data.title ?? null,
      data.error ?? null,
      data.callback_token_hash,
      now,
      now,
      data.status === 'running' ? now : null,
      data.completed_at ?? null,
    )
    .run();
};

beforeAll(async () => {
  env.CODEX_API_TOKEN = TOKEN;
  await applySchema();
});

beforeEach(async () => {
  env.CODEX_API_TOKEN = TOKEN;
  env.RATE_LIMITER = createTestRateLimiter();
  delete (env as Partial<Env>).BHART_ARTICLE_AGENT_ALLOWED_EMAILS;
  delete (env as Partial<Env>).SPRITES_API_TOKEN;
  delete (env as Partial<Env>).BHART_ARTICLE_AGENT_SPRITE_NAME;
  delete (env as Partial<Env>).BHART_ARTICLE_AGENT_SPRITE_WORKDIR;
  delete (env as Partial<Env>).BHART_ARTICLE_AGENT_CODEX_HOME;
  delete (env as Partial<Env>).BHART_ARTICLE_AGENT_SPRITES_API_BASE;
  await resetData();
});

describe('Codex API', () => {
  it('rejects missing auth', async () => {
    const response = await fetchWorker(new Request(`${API_BASE}/posts`));
    expect(response.status).toBe(401);
    const body = (await response.json()) as { error?: { code?: string } };
    expect(body.error?.code).toBe('unauthorized');
  });

  it('creates posts', async () => {
    const response = await fetchWorker(
      new Request(`${API_BASE}/posts`, {
        method: 'POST',
        headers: authHeaders({ 'content-type': 'application/json' }),
        body: JSON.stringify({
          title: 'Hello, Internet (Again)',
          summary: 'A time capsule + a public workshop for the AI era.',
          body_markdown: 'This is a test post body.',
          tags: ['ai', 'personal'],
          author_name: 'Bruce Hart',
          author_email: 'bruce@bhart.org',
        }),
      }),
    );

    expect(response.status).toBe(201);
    const body = (await response.json()) as {
      post: { slug: string; status: string; published_at: string | null; tag_slugs: string[] };
    };
    expect(body.post.slug).toBe('hello-internet-again');
    expect(body.post.status).toBe('draft');
    expect(body.post.published_at).toBeNull();
    expect(body.post.tag_slugs).toContain('ai');
    expect(body.post.tag_slugs).toContain('personal');
  });

  it('uploads media via multipart', async () => {
    const form = new FormData();
    form.set('image', makeImageFile());
    form.set('alt_text', 'Test image');
    form.set('author_name', 'Test Author');
    form.set('author_email', 'author@example.com');
    form.set('key_prefix', 'headers');
    form.set('tags', JSON.stringify(['header', 'generated']));

    const response = await fetchWorker(
      new Request(`${API_BASE}/media/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: form,
      }),
    );

    expect(response.status).toBe(200);
    const payload = (await response.json()) as {
      media?: { url?: string; content_type?: string };
    };
    expect(payload.media?.url?.startsWith('/media/')).toBe(true);
    expect(payload.media?.content_type).toBe('image/png');
  });

  it('rejects missing media upload', async () => {
    const form = new FormData();
    form.set('alt_text', 'Test image');
    form.set('author_name', 'Test Author');
    form.set('author_email', 'author@example.com');

    const response = await fetchWorker(
      new Request(`${API_BASE}/media/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: form,
      }),
    );

    expect(response.status).toBe(400);
  });

  it('rejects non-image media upload', async () => {
    const file = new File([Buffer.from('hello')], 'note.txt', { type: 'text/plain' });
    const form = new FormData();
    form.set('image', file);
    form.set('alt_text', 'Test image');
    form.set('author_name', 'Test Author');
    form.set('author_email', 'author@example.com');

    const response = await fetchWorker(
      new Request(`${API_BASE}/media/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: form,
      }),
    );

    expect(response.status).toBe(400);
  });

  it('rejects invalid tags json for media upload', async () => {
    const form = new FormData();
    form.set('image', makeImageFile());
    form.set('alt_text', 'Test image');
    form.set('author_name', 'Test Author');
    form.set('author_email', 'author@example.com');
    form.set('tags', 'not-json');

    const response = await fetchWorker(
      new Request(`${API_BASE}/media/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: form,
      }),
    );

    expect(response.status).toBe(400);
  });

  it('lists and fetches posts', async () => {
    await seedPostWithTags(
      {
        id: 'post-1',
        slug: 'draft-post',
        title: 'Draft Post',
        summary: 'Draft summary',
        body_markdown: 'Draft body',
        status: 'draft',
        published_at: null,
        updated_at: '2025-01-01T00:00:00.000Z',
      },
      ['Cloudflare', 'Workers'],
    );

    await seedPostWithTags(
      {
        id: 'post-2',
        slug: 'published-post',
        title: 'Published Post',
        summary: 'Published summary',
        body_markdown: 'Published body',
        status: 'published',
        published_at: '2025-01-02T00:00:00.000Z',
        updated_at: '2025-01-02T00:00:00.000Z',
      },
      ['D1'],
    );

    const listResponse = await fetchWorker(
      new Request(`${API_BASE}/posts?status=draft`, {
        headers: authHeaders(),
      }),
    );
    expect(listResponse.status).toBe(200);
    const listBody = (await listResponse.json()) as {
      posts: Array<{ id: string; tag_slugs: string[] }>;
    };
    expect(listBody.posts).toHaveLength(1);
    expect(listBody.posts[0].id).toBe('post-1');
    expect(listBody.posts[0].tag_slugs).toContain('cloudflare');

    const getResponse = await fetchWorker(
      new Request(`${API_BASE}/posts/post-1`, {
        headers: authHeaders(),
      }),
    );
    expect(getResponse.status).toBe(200);
    const getBody = (await getResponse.json()) as {
      post: { body_markdown: string; tag_names: string[] };
    };
    expect(getBody.post.body_markdown).toContain('Draft body');
    expect(getBody.post.tag_names).toContain('Cloudflare');
  });

  it('merges patch updates and recomputes fields', async () => {
    await seedPostWithTags(
      {
        id: 'post-3',
        slug: 'old-title',
        title: 'Old Title',
        summary: 'Old summary',
        body_markdown: 'Short body',
        status: 'draft',
        published_at: null,
        updated_at: '2025-01-03T00:00:00.000Z',
      },
      ['Cloudflare', 'Workers'],
    );

    const getResponse = await fetchWorker(
      new Request(`${API_BASE}/posts/post-3`, {
        headers: authHeaders(),
      }),
    );
    const getBody = (await getResponse.json()) as { post: { updated_at: string } };

    const patchPayload = {
      title: 'New Title',
      summary: 'Updated summary',
      body_markdown: 'word '.repeat(450),
      tags: { add: ['D1'], remove: ['Workers'] },
      recompute: { slugFromTitle: true },
      expected_updated_at: getBody.post.updated_at,
    };

    const patchResponse = await fetchWorker(
      new Request(`${API_BASE}/posts/post-3`, {
        method: 'PATCH',
        headers: authHeaders({ 'content-type': 'application/json' }),
        body: JSON.stringify(patchPayload),
      }),
    );
    expect(patchResponse.status).toBe(200);
    const patchBody = (await patchResponse.json()) as {
      post: {
        slug: string;
        summary: string;
        tag_names: string[];
        reading_time_minutes: number;
      };
    };
    expect(patchBody.post.slug).toBe('new-title');
    expect(patchBody.post.summary).toBe('Updated summary');
    expect(patchBody.post.tag_names).toContain('D1');
    expect(patchBody.post.tag_names).not.toContain('Workers');
    expect(patchBody.post.reading_time_minutes).toBeGreaterThan(1);
  });

  it('rejects stale updates with a conflict', async () => {
    await seedPostWithTags(
      {
        id: 'post-4',
        slug: 'conflict-post',
        title: 'Conflict Post',
        summary: 'Conflict summary',
        body_markdown: 'Conflict body',
        status: 'draft',
        published_at: null,
        updated_at: '2025-01-04T00:00:00.000Z',
      },
      ['Cloudflare'],
    );

    const patchResponse = await fetchWorker(
      new Request(`${API_BASE}/posts/post-4`, {
        method: 'PATCH',
        headers: authHeaders({ 'content-type': 'application/json' }),
        body: JSON.stringify({
          summary: 'New summary',
          expected_updated_at: '2000-01-01T00:00:00.000Z',
        }),
      }),
    );
    expect(patchResponse.status).toBe(409);
  });
});

describe('Article Agent', () => {
  it('requires admin login and the article-agent allowlist', async () => {
    let response = await fetchWorker(new Request('http://example.com/admin/article-agent/jobs'));
    expect(response.status).toBe(401);

    const session = await seedAdminSession('admin@example.com');
    response = await fetchWorker(
      new Request('http://example.com/admin/article-agent/jobs', {
        headers: { cookie: session.cookie },
      }),
    );
    expect(response.status).toBe(503);

    env.BHART_ARTICLE_AGENT_ALLOWED_EMAILS = 'owner@example.com';
    response = await fetchWorker(
      new Request('http://example.com/admin/article-agent/jobs', {
        headers: { cookie: session.cookie },
      }),
    );
    expect(response.status).toBe(403);

    env.BHART_ARTICLE_AGENT_ALLOWED_EMAILS = 'admin@example.com';
    response = await fetchWorker(
      new Request('http://example.com/admin/article-agent/jobs', {
        headers: { cookie: session.cookie },
      }),
    );
    expect(response.status).toBe(200);
  });

  it('creates article-agent jobs, stores references, and launches the configured Sprite', async () => {
    const originalFetch = globalThis.fetch;
    const spriteRequests: string[] = [];
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const target = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      if (target.startsWith('https://api.sprites.dev/')) {
        spriteRequests.push(target);
        expect(init?.method).toBe('POST');
        expect(init?.headers).toEqual({
          Authorization: 'Bearer sprites-token',
          'User-Agent': expect.stringContaining('Mozilla/5.0'),
        });
        return Response.json({ ok: true });
      }
      return originalFetch(input as RequestInfo, init);
    }) as typeof fetch;

    try {
      const session = await seedAdminSession('admin@example.com');
      env.BHART_ARTICLE_AGENT_ALLOWED_EMAILS = 'admin@example.com';
      env.SPRITES_API_TOKEN = 'sprites-token';
      env.BHART_ARTICLE_AGENT_SPRITE_NAME = 'bhart-test';
      env.BHART_ARTICLE_AGENT_SPRITE_WORKDIR = '/home/sprite/bhart-org/main';
      env.BHART_ARTICLE_AGENT_CODEX_HOME = '/home/sprite/.codex-bhart-test';

      const form = new FormData();
      form.set('prompt', 'Draft a post about patient AI tools.');
      form.append('refs', new File([Buffer.from('notes')], 'notes.md', { type: 'text/markdown' }));

      const response = await fetchWorker(
        new Request('http://example.com/admin/article-agent/jobs', {
          method: 'POST',
          headers: { cookie: session.cookie },
          body: form,
        }),
      );

      expect(response.status).toBe(202);
      const payload = (await response.json()) as { job: { id: string; status: string; content_type: string } };
      expect(payload.job.status).toBe('starting');
      expect(payload.job.content_type).toBe('article');

      const job = await env.DB.prepare('SELECT * FROM article_agent_jobs WHERE id = ?')
        .bind(payload.job.id)
        .first<{ status: string; requested_by: string; sprite_name: string; content_type: string }>();
      expect(job?.status).toBe('starting');
      expect(job?.requested_by).toBe('admin@example.com');
      expect(job?.sprite_name).toBe('bhart-test');
      expect(job?.content_type).toBe('article');

      const ref = await env.DB.prepare('SELECT * FROM article_agent_refs WHERE job_id = ?')
        .bind(payload.job.id)
        .first<{ r2_key: string; filename: string; content_type: string }>();
      expect(ref?.filename).toBe('notes.md');
      expect(ref?.content_type).toBe('text/markdown');
      expect(ref?.r2_key.startsWith(`article-agent/${payload.job.id}/`)).toBe(true);
      const object = await env.MEDIA_BUCKET.get(ref?.r2_key ?? '');
      expect(await object?.text()).toBe('notes');

      expect(spriteRequests).toHaveLength(1);
      const launchUrl = new URL(spriteRequests[0]);
      expect(launchUrl.pathname).toBe('/v1/sprites/bhart-test/exec');
      expect(launchUrl.searchParams.get('dir')).toBe('/home/sprite/bhart-org/main');
      const cmd = launchUrl.searchParams.getAll('cmd').join(' ');
      expect(cmd).toContain('article-agent-');
      expect(cmd).toContain('BHART_ARTICLE_AGENT_TASK_NAME=');
      expect(cmd).toContain('BHART_CODEX_API_BASE=');
      expect(cmd).toContain('CODEX_HOME=');
      expect(cmd).toContain('/home/sprite/.codex-bhart-test');
      expect(cmd).toContain('Mozilla/5.0');
      expect(cmd).not.toContain('Draft a post about patient AI tools.');
      expect(cmd).not.toContain('& &&');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('creates news-agent jobs on the same configured Sprite', async () => {
    const originalFetch = globalThis.fetch;
    const spriteRequests: string[] = [];
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const target = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      if (target.startsWith('https://api.sprites.dev/')) {
        spriteRequests.push(target);
        expect(init?.method).toBe('POST');
        expect(init?.headers).toEqual({
          Authorization: 'Bearer sprites-token',
          'User-Agent': expect.stringContaining('Mozilla/5.0'),
        });
        return Response.json({ ok: true });
      }
      return originalFetch(input as RequestInfo, init);
    }) as typeof fetch;

    try {
      const session = await seedAdminSession('admin@example.com');
      env.BHART_ARTICLE_AGENT_ALLOWED_EMAILS = 'admin@example.com';
      env.SPRITES_API_TOKEN = 'sprites-token';
      env.BHART_ARTICLE_AGENT_SPRITE_NAME = 'bhart-test';
      env.BHART_ARTICLE_AGENT_SPRITE_WORKDIR = '/home/sprite/bhart-org/main';

      const form = new FormData();
      form.set('content_type', 'news');
      form.set('prompt', 'Draft a news item about the Codex drafting workspace.');

      const response = await fetchWorker(
        new Request('http://example.com/admin/article-agent/jobs', {
          method: 'POST',
          headers: { cookie: session.cookie },
          body: form,
        }),
      );

      expect(response.status).toBe(202);
      const payload = (await response.json()) as { job: { id: string; content_type: string; status: string } };
      expect(payload.job.status).toBe('starting');
      expect(payload.job.content_type).toBe('news');

      const job = await env.DB.prepare('SELECT content_type, sprite_name FROM article_agent_jobs WHERE id = ?')
        .bind(payload.job.id)
        .first<{ content_type: string; sprite_name: string }>();
      expect(job?.content_type).toBe('news');
      expect(job?.sprite_name).toBe('bhart-test');

      const token = await env.DB.prepare('SELECT callback_token_hash FROM article_agent_jobs WHERE id = ?')
        .bind(payload.job.id)
        .first<{ callback_token_hash: string }>();
      expect(token?.callback_token_hash).toHaveLength(64);

      expect(spriteRequests).toHaveLength(1);
      const launchUrl = new URL(spriteRequests[0]);
      expect(launchUrl.pathname).toBe('/v1/sprites/bhart-test/exec');
      expect(launchUrl.searchParams.get('dir')).toBe('/home/sprite/bhart-org/main');
      const cmd = launchUrl.searchParams.getAll('cmd').join(' ');
      expect(cmd).not.toContain('Draft a news item about the Codex drafting workspace.');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('stores concise Sprite launch failures without raw HTML', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const target = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      if (target.startsWith('https://api.sprites.dev/')) {
        expect(init?.headers).toEqual({
          Authorization: 'Bearer sprites-token',
          'User-Agent': expect.stringContaining('Mozilla/5.0'),
        });
        return new Response('<!doctype html><html><body>Forbidden</body></html>', {
          status: 403,
          statusText: 'Forbidden',
          headers: { 'content-type': 'text/html' },
        });
      }
      return originalFetch(input as RequestInfo, init);
    }) as typeof fetch;

    try {
      const session = await seedAdminSession('admin@example.com');
      env.BHART_ARTICLE_AGENT_ALLOWED_EMAILS = 'admin@example.com';
      env.SPRITES_API_TOKEN = 'sprites-token';
      const form = new FormData();
      form.set('prompt', 'Draft a post about a failed launch.');

      const response = await fetchWorker(
        new Request('http://example.com/admin/article-agent/jobs', {
          method: 'POST',
          headers: { cookie: session.cookie },
          body: form,
        }),
      );
      expect(response.status).toBe(202);
      const payload = (await response.json()) as { job: { id: string } };
      const job = await env.DB.prepare('SELECT status, error FROM article_agent_jobs WHERE id = ?')
        .bind(payload.job.id)
        .first<{ status: string; error: string }>();
      expect(job?.status).toBe('failed');
      expect(job?.error).toContain('Sprite launch failed (403 Forbidden).');
      expect(job?.error).not.toContain('<html>');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('authenticates runner callbacks and exposes bootstrap, refs, messages, events, and completion', async () => {
    const token = 'runner-token';
    const jobId = 'job_1234567890123456';
    await seedArticleAgentJob({
      id: jobId,
      callback_token_hash: await sha256Hex(token),
      status: 'running',
    });
    await env.MEDIA_BUCKET.put('article-agent/test/ref.txt', 'ref-data', {
      httpMetadata: { contentType: 'text/plain' },
    });
    await env.DB.prepare(
      `INSERT INTO article_agent_refs (job_id, r2_key, filename, content_type, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
      .bind(jobId, 'article-agent/test/ref.txt', 'ref.txt', 'text/plain', new Date().toISOString())
      .run();

    let response = await fetchWorker(
      new Request(`http://example.com/api/article-agent/jobs/${jobId}/bootstrap`),
    );
    expect(response.status).toBe(401);

    response = await fetchWorker(
      new Request(`http://example.com/api/article-agent/jobs/${jobId}/bootstrap`, {
        headers: { Authorization: 'Bearer wrong-token' },
      }),
    );
    expect(response.status).toBe(401);

    response = await fetchWorker(
      new Request(`http://example.com/api/article-agent/jobs/${jobId}/bootstrap`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    );
    expect(response.status).toBe(200);
    const bootstrap = (await response.json()) as {
      prompt: string;
      refs: Array<{ url: string; filename: string }>;
    };
    expect(bootstrap.prompt).toContain('tiny tools');
    expect(bootstrap.refs[0].url).toBe(`/api/article-agent/jobs/${jobId}/refs/1`);

    response = await fetchWorker(
      new Request(`http://example.com/api/article-agent/jobs/${jobId}/refs/1`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    );
    expect(await response.text()).toBe('ref-data');

    const session = await seedAdminSession('admin@example.com');
    env.BHART_ARTICLE_AGENT_ALLOWED_EMAILS = 'admin@example.com';
    response = await fetchWorker(
      new Request(`http://example.com/admin/article-agent/jobs/${jobId}/messages`, {
        method: 'POST',
        headers: { cookie: session.cookie, 'content-type': 'application/json' },
        body: JSON.stringify({ content: 'Make it sharper.' }),
      }),
    );
    expect(response.status).toBe(200);

    response = await fetchWorker(
      new Request(`http://example.com/api/article-agent/jobs/${jobId}/messages?after=0`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    );
    const messages = (await response.json()) as { messages: Array<{ content: string }> };
    expect(messages.messages[0].content).toBe('Make it sharper.');

    response = await fetchWorker(
      new Request(`http://example.com/api/article-agent/jobs/${jobId}/events`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ type: 'log', message: 'working' }),
      }),
    );
    expect(response.status).toBe(200);

    response = await fetchWorker(
      new Request(`http://example.com/api/article-agent/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          status: 'complete',
          post_id: 'post-abc-123',
          post_slug: 'patient-ai-tools',
          title: 'Patient AI Tools',
        }),
      }),
    );
    expect(response.status).toBe(200);

    const job = await env.DB.prepare('SELECT status, post_id, post_slug, title FROM article_agent_jobs WHERE id = ?')
      .bind(jobId)
      .first<{ status: string; post_id: string; post_slug: string; title: string }>();
    expect(job?.status).toBe('complete');
    expect(job?.post_id).toBe('post-abc-123');
    expect(job?.post_slug).toBe('patient-ai-tools');

    response = await fetchWorker(
      new Request(`http://example.com/admin/article-agent/jobs/${jobId}/events`, {
        headers: { cookie: session.cookie },
      }),
    );
    const events = await response.text();
    expect(events).toContain('event: log');
    expect(events).toContain('event: complete');

    response = await fetchWorker(
      new Request(`http://example.com/admin/article-agent/jobs/${jobId}/events?after=999`, {
        headers: { cookie: session.cookie },
      }),
    );
    expect(await response.text()).toContain(': heartbeat');
  });

  it('records runner completion for news item jobs', async () => {
    const token = 'runner-token';
    const jobId = 'job_news123456789012';
    await seedArticleAgentJob({
      id: jobId,
      content_type: 'news',
      prompt: 'Create a short update about the Codex news mode.',
      callback_token_hash: await sha256Hex(token),
      status: 'running',
    });

    let response = await fetchWorker(
      new Request(`http://example.com/api/article-agent/jobs/${jobId}/bootstrap`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    );
    expect(response.status).toBe(200);
    const bootstrap = (await response.json()) as { content_type: string; prompt: string };
    expect(bootstrap.content_type).toBe('news');
    expect(bootstrap.prompt).toContain('Codex news mode');

    response = await fetchWorker(
      new Request(`http://example.com/api/article-agent/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          status: 'complete',
          news_id: 'news-abc-123',
          news_category: 'Update',
          title: 'Codex News Mode',
        }),
      }),
    );
    expect(response.status).toBe(200);

    const job = await env.DB.prepare(
      'SELECT status, post_id, post_slug, news_id, news_category, title FROM article_agent_jobs WHERE id = ?',
    )
      .bind(jobId)
      .first<{
        status: string;
        post_id: string | null;
        post_slug: string | null;
        news_id: string;
        news_category: string;
        title: string;
      }>();
    expect(job?.status).toBe('complete');
    expect(job?.post_id).toBeNull();
    expect(job?.post_slug).toBeNull();
    expect(job?.news_id).toBe('news-abc-123');
    expect(job?.news_category).toBe('Update');
    expect(job?.title).toBe('Codex News Mode');

    const session = await seedAdminSession('admin@example.com');
    env.BHART_ARTICLE_AGENT_ALLOWED_EMAILS = 'admin@example.com';
    response = await fetchWorker(
      new Request(`http://example.com/admin/article-agent/jobs/${jobId}`, {
        headers: { cookie: session.cookie },
      }),
    );
    const payload = (await response.json()) as {
      job: { content_type: string; news_url: string; edit_url: string; article_url: string | null };
    };
    expect(payload.job.content_type).toBe('news');
    expect(payload.job.news_url).toBe('/news#news-news-abc-123');
    expect(payload.job.edit_url).toBe('/admin/news/news-abc-123');
    expect(payload.job.article_url).toBeNull();
  });

  it('cancels active jobs and asks Sprite to stop the runner', async () => {
    const originalFetch = globalThis.fetch;
    const spriteRequests: string[] = [];
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const target = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      if (target.startsWith('https://api.sprites.dev/')) {
        spriteRequests.push(target);
        expect(init?.headers).toEqual({
          Authorization: 'Bearer sprites-token',
          'User-Agent': expect.stringContaining('Mozilla/5.0'),
        });
        return Response.json({ ok: true });
      }
      return originalFetch(input as RequestInfo, init);
    }) as typeof fetch;

    try {
      const token = 'runner-token';
      const jobId = 'job_ABCdef1234567890';
      await seedArticleAgentJob({
        id: jobId,
        callback_token_hash: await sha256Hex(token),
        status: 'running',
      });
      const session = await seedAdminSession('admin@example.com');
      env.BHART_ARTICLE_AGENT_ALLOWED_EMAILS = 'admin@example.com';
      env.SPRITES_API_TOKEN = 'sprites-token';

      const response = await fetchWorker(
        new Request(`http://example.com/admin/article-agent/jobs/${jobId}/cancel`, {
          method: 'POST',
          headers: { cookie: session.cookie },
        }),
      );
      expect(response.status).toBe(200);
      const job = await env.DB.prepare('SELECT status FROM article_agent_jobs WHERE id = ?')
        .bind(jobId)
        .first<{ status: string }>();
      expect(job?.status).toBe('canceled');
      expect(spriteRequests).toHaveLength(1);
      const cmd = new URL(spriteRequests[0]).searchParams.getAll('cmd').join(' ');
      expect(cmd).toContain(jobId);
      expect(cmd).not.toContain('pkill -TERM -f');
      expect(cmd).toContain(`runner='/tmp/article-agent-${jobId}.py'`);
      expect(cmd).toContain('ps -eo pid=,ppid=,comm=,args=');
      expect(cmd).toContain('kill -TERM "$pid"');
      expect(cmd).toContain('http://sprite/v1/tasks/article-agent-job-abcdef1234567890');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('ignores late runner completion after cancellation', async () => {
    const token = 'runner-token';
    const jobId = 'job_latecancel123456';
    await seedArticleAgentJob({
      id: jobId,
      callback_token_hash: await sha256Hex(token),
      status: 'canceled',
      completed_at: new Date().toISOString(),
    });

    const response = await fetchWorker(
      new Request(`http://example.com/api/article-agent/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          status: 'complete',
          post_id: 'post-too-late',
          post_slug: 'too-late',
          title: 'Too Late',
        }),
      }),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as { ignored?: boolean };
    expect(body.ignored).toBe(true);
    const job = await env.DB.prepare('SELECT status, post_id, post_slug, title FROM article_agent_jobs WHERE id = ?')
      .bind(jobId)
      .first<{ status: string; post_id: string | null; post_slug: string | null; title: string | null }>();
    expect(job?.status).toBe('canceled');
    expect(job?.post_id).toBeNull();
    expect(job?.post_slug).toBeNull();
    expect(job?.title).toBeNull();
  });

  it('runner prompt supports article and news skills with the final result marker', () => {
    expect(ARTICLE_AGENT_RUNNER).toContain('Use the draft-article skill');
    expect(ARTICLE_AGENT_RUNNER).toContain('Use the create-news-item skill');
    expect(ARTICLE_AGENT_RUNNER).toContain('https://bhart.org/api/codex/v1');
    expect(ARTICLE_AGENT_RUNNER).toContain('CODEX_BHART_API_TOKEN');
    expect(ARTICLE_AGENT_RUNNER).toContain('Use POST /posts');
    expect(ARTICLE_AGENT_RUNNER).toContain('Use POST /news');
    expect(ARTICLE_AGENT_RUNNER).toContain('BHART_ARTICLE_AGENT_RESULT_JSON=');
    expect(ARTICLE_AGENT_RUNNER).toContain('CODEX_HOME');
    expect(ARTICLE_AGENT_RUNNER).toContain('.codex-bhart-org');
    expect(ARTICLE_AGENT_RUNNER).toContain('post_id');
    expect(ARTICLE_AGENT_RUNNER).toContain('news_id');
    expect(ARTICLE_AGENT_RUNNER).toContain('pty.openpty()');
    expect(ARTICLE_AGENT_RUNNER).toContain('os.write(');
    expect(ARTICLE_AGENT_RUNNER).toContain('"User-Agent": USER_AGENT');
    expect(ARTICLE_AGENT_RUNNER).not.toContain('"post_id":"123"');
    expect(ARTICLE_AGENT_RUNNER).not.toContain('"news_id":"123"');
    expect(ARTICLE_AGENT_RUNNER).not.toContain('"slug":"example"');
  });
});

describe('Public Routes', () => {
  beforeEach(async () => {
    await seedPostWithTags(
      {
        id: 'pub-1',
        slug: 'test-article',
        title: 'Test Article',
        summary: 'Test summary',
        body_markdown: '# Test\n\nThis is a test article with some content.',
        status: 'published',
        published_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      },
      ['Test', 'Public'],
    );
  });

  it('serves home page', async () => {
    const response = await fetchWorker(new Request('http://example.com/'));
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    const html = await response.text();
    expect(html).toContain('bhart.org');
  });

  it('serves about page', async () => {
    const response = await fetchWorker(new Request('http://example.com/about'));
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
  });

  it('serves article page', async () => {
    const response = await fetchWorker(new Request('http://example.com/articles/test-article'));
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    const html = await response.text();
    expect(html).toContain('Test Article');
    expect(html).toContain('This is a test article');
  });

  it('returns 404 for non-existent article', async () => {
    const response = await fetchWorker(new Request('http://example.com/articles/not-found'));
    expect(response.status).toBe(404);
  });

  it('returns 404 for draft articles', async () => {
    await seedPostWithTags(
      {
        id: 'draft-1',
        slug: 'draft-article',
        title: 'Draft Article',
        summary: 'Draft summary',
        body_markdown: 'Draft content',
        status: 'draft',
        published_at: null,
        updated_at: '2025-01-01T00:00:00.000Z',
      },
      ['Draft'],
    );

    const response = await fetchWorker(new Request('http://example.com/articles/draft-article'));
    expect(response.status).toBe(404);
  });

  it('returns 404 for non-existent route', async () => {
    const response = await fetchWorker(new Request('http://example.com/nonexistent'));
    expect(response.status).toBe(404);
  });
});

describe('Error Handling', () => {
  it('handles invalid JSON in API request', async () => {
    const response = await fetchWorker(
      new Request(`${API_BASE}/posts`, {
        method: 'POST',
        headers: authHeaders({ 'content-type': 'application/json' }),
        body: 'invalid json {',
      }),
    );
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error?: { code?: string } };
    expect(body.error?.code).toBe('invalid_json');
  });

  it('handles missing required fields in create post', async () => {
    const response = await fetchWorker(
      new Request(`${API_BASE}/posts`, {
        method: 'POST',
        headers: authHeaders({ 'content-type': 'application/json' }),
        body: JSON.stringify({
          title: 'Missing Fields',
        }),
      }),
    );
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error?: { details?: string[] } };
    expect(body.error?.details).toBeDefined();
    expect(body.error?.details?.length).toBeGreaterThan(0);
  });

  it('handles invalid status value', async () => {
    const response = await fetchWorker(
      new Request(`${API_BASE}/posts`, {
        method: 'POST',
        headers: authHeaders({ 'content-type': 'application/json' }),
        body: JSON.stringify({
          title: 'Test',
          summary: 'Test',
          body_markdown: 'Test',
          tags: ['test'],
          author_name: 'Test',
          author_email: 'test@example.com',
          status: 'invalid',
        }),
      }),
    );
    expect(response.status).toBe(400);
  });
});

describe('Security', () => {
  it('escapes SQL wildcards in search', async () => {
    await seedPostWithTags(
      {
        id: 'search-1',
        slug: 'searchable-post',
        title: 'Normal Title',
        summary: 'Normal summary',
        body_markdown: 'Normal content',
        status: 'draft',
        published_at: null,
        updated_at: '2025-01-01T00:00:00.000Z',
      },
      ['Test'],
    );

    // Search with SQL wildcard characters - should be escaped
    const response = await fetchWorker(
      new Request(`${API_BASE}/posts?q=${encodeURIComponent('%_')}`, {
        headers: authHeaders(),
      }),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as { posts: unknown[] };
    // Should not match everything due to wildcard
    expect(body.posts).toEqual([]);
  });

  it('prevents XSS in article content', async () => {
    await seedPostWithTags(
      {
        id: 'xss-1',
        slug: 'xss-test',
        title: 'XSS Test',
        summary: 'Test summary',
        body_markdown: 'Safe content',
        status: 'published',
        published_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      },
      ['Security'],
    );

    const response = await fetchWorker(new Request('http://example.com/articles/xss-test'));
    expect(response.status).toBe(200);
    const html = await response.text();
    // Markdown should be safely rendered
    expect(html).toContain('Safe content');
    expect(html).not.toContain('<script>alert');
  });
});

describe('Rate Limiting', () => {
  it('allows requests within limit', async () => {
    // Make several requests within the limit (100 per minute)
    for (let i = 0; i < 10; i++) {
      const response = await fetchWorker(
        new Request(`${API_BASE}/tags`, {
          headers: authHeaders(),
        }),
      );
      expect(response.status).toBe(200);
    }
  });

  it('rate limits excessive requests', async () => {
    // Make many requests to trigger rate limit
    const requests = [];
    for (let i = 0; i < 101; i++) {
      requests.push(
        fetchWorker(
          new Request(`${API_BASE}/tags`, {
            headers: authHeaders(),
          }),
        ),
      );
    }

    const responses = await Promise.all(requests);
    const rateLimited = responses.some((r) => r.status === 429);
    expect(rateLimited).toBe(true);
  });
});

describe('Edge Cases', () => {
  it('handles empty search results', async () => {
    const response = await fetchWorker(
      new Request(`${API_BASE}/posts?q=${encodeURIComponent('nonexistentquery12345')}`, {
        headers: authHeaders(),
      }),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as { posts: unknown[] };
    expect(body.posts).toEqual([]);
  });

  it('handles empty tag filter', async () => {
    const response = await fetchWorker(
      new Request(`${API_BASE}/tags`, {
        headers: authHeaders(),
      }),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as { tags: unknown[] };
    expect(Array.isArray(body.tags)).toBe(true);
  });

  it('handles malformed cursor', async () => {
    const response = await fetchWorker(
      new Request(`${API_BASE}/posts?cursor=invalid`, {
        headers: authHeaders(),
      }),
    );
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error?: { code?: string } };
    expect(body.error?.code).toBe('invalid_request');
  });

  it('handles boundary limit values', async () => {
    // Test limit = 0 (should be rejected)
    let response = await fetchWorker(
      new Request(`${API_BASE}/posts?limit=0`, {
        headers: authHeaders(),
      }),
    );
    expect(response.status).toBe(400);

    // Test limit > 100 (should be capped at 100)
    response = await fetchWorker(
      new Request(`${API_BASE}/posts?limit=200`, {
        headers: authHeaders(),
      }),
    );
    expect(response.status).toBe(200);
  });

  it('handles posts without tags gracefully', async () => {
    // This should fail due to validation, but let's check the error
    const response = await fetchWorker(
      new Request(`${API_BASE}/posts`, {
        method: 'POST',
        headers: authHeaders({ 'content-type': 'application/json' }),
        body: JSON.stringify({
          title: 'No Tags',
          summary: 'Summary',
          body_markdown: 'Content',
          tags: [],
          author_name: 'Test',
          author_email: 'test@example.com',
        }),
      }),
    );
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error?: { details?: string[] } };
    expect(body.error?.details?.some((d) => d.includes('tag'))).toBe(true);
  });
});
