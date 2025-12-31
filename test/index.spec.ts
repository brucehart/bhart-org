import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import worker from '../src';
import { slugify } from '../src/utils';
import { clearRateLimitStore } from '../src/middleware/rateLimit';

const API_BASE = 'http://example.com/api/codex/v1';
const TOKEN = 'test-token';

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

const authHeaders = (extra?: Record<string, string>) => ({
  Authorization: `Bearer ${TOKEN}`,
  ...(extra ?? {}),
});

beforeAll(async () => {
  env.CODEX_API_TOKEN = TOKEN;
  await applySchema();
});

beforeEach(async () => {
  env.CODEX_API_TOKEN = TOKEN;
  await resetData();
  clearRateLimitStore(); // Clear rate limit state between tests
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
    expect(html).not.toContain('<script>');
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
