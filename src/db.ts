import { slugify } from './utils';
import type {
  AuthorizedUser,
  MediaAsset,
  MediaAssetRecord,
  NewsItemRecord,
  NewsStatus,
  PostRecord,
  PostWithTags,
  SessionUser,
  TagRecord,
} from './types';

export type PostInput = {
  slug: string;
  title: string;
  summary: string;
  body_markdown: string;
  reading_time_minutes: number;
  status: 'draft' | 'published';
  published_at: string | null;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  featured: boolean;
  author_name: string;
  author_email: string;
  seo_title: string | null;
  seo_description: string | null;
  tags: string[];
};

export type NewsItemInput = {
  category: string;
  title: string;
  body_markdown: string;
  status: NewsStatus;
  published_at: string | null;
};

const parseTags = (value?: string | null): string[] => {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const mapPostRow = (row: PostRecord): PostWithTags => {
  return {
    ...row,
    tag_names: parseTags(row.tag_names),
    tag_slugs: parseTags(row.tag_slugs),
  };
};

const mapMediaRow = (row: MediaAssetRecord): MediaAsset => {
  return {
    ...row,
    tags: parseTags(row.tags),
  };
};

/**
 * Escape special characters in LIKE patterns to prevent SQL pattern injection
 * Escapes: %, _, and \
 */
const escapeLikePattern = (str: string): string => {
  return str.replace(/[\\%_]/g, '\\$&');
};

export const listPublishedPosts = async (
  db: D1Database,
  nowIso: string,
  options: { limit?: number; tagSlug?: string } = {},
): Promise<PostWithTags[]> => {
  const limit = options.limit ?? 12;
  const params: unknown[] = [nowIso];
  let tagFilter = '';
  if (options.tagSlug) {
    tagFilter =
      'AND EXISTS (SELECT 1 FROM post_tags pt2 JOIN tags t2 ON t2.id = pt2.tag_id WHERE pt2.post_id = p.id AND t2.slug = ?)';
    params.push(options.tagSlug);
  }
  params.push(limit);

  const query = `
    SELECT
      p.*, 
      GROUP_CONCAT(t.name, ',') AS tag_names,
      GROUP_CONCAT(t.slug, ',') AS tag_slugs
    FROM posts p
    LEFT JOIN post_tags pt ON pt.post_id = p.id
    LEFT JOIN tags t ON t.id = pt.tag_id
    WHERE p.status = 'published' AND p.published_at IS NOT NULL AND p.published_at <= ?
    ${tagFilter}
    GROUP BY p.id
    ORDER BY p.published_at DESC
    LIMIT ?
  `;

  const { results } = await db.prepare(query).bind(...params).all<PostRecord>();
  return results.map(mapPostRow);
};

export const listPublishedPostsByDateRange = async (
  db: D1Database,
  startIso: string,
  endIso: string,
): Promise<PostWithTags[]> => {
  const query = `
    SELECT
      p.*, 
      GROUP_CONCAT(t.name, ',') AS tag_names,
      GROUP_CONCAT(t.slug, ',') AS tag_slugs
    FROM posts p
    LEFT JOIN post_tags pt ON pt.post_id = p.id
    LEFT JOIN tags t ON t.id = pt.tag_id
    WHERE p.status = 'published'
      AND p.published_at IS NOT NULL
      AND p.published_at >= ?
      AND p.published_at < ?
    GROUP BY p.id
    ORDER BY p.published_at DESC
  `;
  const { results } = await db.prepare(query).bind(startIso, endIso).all<PostRecord>();
  return results.map(mapPostRow);
};

export const listTags = async (db: D1Database, nowIso: string): Promise<TagRecord[]> => {
  const query = `
    SELECT t.*, COUNT(pt.post_id) as post_count
    FROM tags t
    JOIN post_tags pt ON pt.tag_id = t.id
    JOIN posts p ON p.id = pt.post_id
    WHERE p.status = 'published' AND p.published_at IS NOT NULL AND p.published_at <= ?
    GROUP BY t.id
    ORDER BY t.name ASC
  `;
  const { results } = await db.prepare(query).bind(nowIso).all<TagRecord>();
  return results;
};

export type PostMonthCount = {
  month: string;
  post_count: number;
};

export const listPublishedPostMonths = async (
  db: D1Database,
  nowIso: string,
): Promise<PostMonthCount[]> => {
  const query = `
    SELECT
      substr(p.published_at, 1, 7) AS month,
      COUNT(*) AS post_count
    FROM posts p
    WHERE p.status = 'published' AND p.published_at IS NOT NULL AND p.published_at <= ?
    GROUP BY substr(p.published_at, 1, 7)
    ORDER BY month DESC
  `;
  const { results } = await db.prepare(query).bind(nowIso).all<PostMonthCount>();
  return results;
};

export const getPostBySlug = async (db: D1Database, slug: string): Promise<PostWithTags | null> => {
  const query = `
    SELECT
      p.*, 
      GROUP_CONCAT(t.name, ',') AS tag_names,
      GROUP_CONCAT(t.slug, ',') AS tag_slugs
    FROM posts p
    LEFT JOIN post_tags pt ON pt.post_id = p.id
    LEFT JOIN tags t ON t.id = pt.tag_id
    WHERE p.slug = ?
    GROUP BY p.id
    LIMIT 1
  `;
  const row = await db.prepare(query).bind(slug).first<PostRecord>();
  return row ? mapPostRow(row) : null;
};

export const getPostById = async (db: D1Database, id: string): Promise<PostWithTags | null> => {
  const query = `
    SELECT
      p.*, 
      GROUP_CONCAT(t.name, ',') AS tag_names,
      GROUP_CONCAT(t.slug, ',') AS tag_slugs
    FROM posts p
    LEFT JOIN post_tags pt ON pt.post_id = p.id
    LEFT JOIN tags t ON t.id = pt.tag_id
    WHERE p.id = ?
    GROUP BY p.id
    LIMIT 1
  `;
  const row = await db.prepare(query).bind(id).first<PostRecord>();
  return row ? mapPostRow(row) : null;
};

export const listAdminPosts = async (db: D1Database): Promise<PostWithTags[]> => {
  const query = `
    SELECT
      p.*, 
      GROUP_CONCAT(t.name, ',') AS tag_names,
      GROUP_CONCAT(t.slug, ',') AS tag_slugs
    FROM posts p
    LEFT JOIN post_tags pt ON pt.post_id = p.id
    LEFT JOIN tags t ON t.id = pt.tag_id
    GROUP BY p.id
    ORDER BY p.updated_at DESC
  `;
  const { results } = await db.prepare(query).all<PostRecord>();
  return results.map(mapPostRow);
};

export type CodexPostCursor = {
  updatedAt: string;
  id: string;
};

export type ListCodexPostsOptions = {
  limit?: number;
  status?: 'draft' | 'published';
  tagSlug?: string;
  query?: string;
  cursor?: CodexPostCursor;
};

export const listCodexPosts = async (
  db: D1Database,
  options: ListCodexPostsOptions = {},
): Promise<PostWithTags[]> => {
  const params: unknown[] = [];
  const conditions: string[] = [];

  if (options.status) {
    conditions.push('p.status = ?');
    params.push(options.status);
  }

  if (options.tagSlug) {
    conditions.push(
      'EXISTS (SELECT 1 FROM post_tags pt2 JOIN tags t2 ON t2.id = pt2.tag_id WHERE pt2.post_id = p.id AND t2.slug = ?)',
    );
    params.push(options.tagSlug);
  }

  if (options.query) {
    const escapedQuery = escapeLikePattern(options.query.toLowerCase());
    const term = `%${escapedQuery}%`;
    conditions.push(
      '(LOWER(p.title) LIKE ? ESCAPE \'\\\' OR LOWER(p.summary) LIKE ? ESCAPE \'\\\' OR LOWER(p.body_markdown) LIKE ? ESCAPE \'\\\')',
    );
    params.push(term, term, term);
  }

  if (options.cursor) {
    conditions.push('(p.updated_at < ? OR (p.updated_at = ? AND p.id < ?))');
    params.push(options.cursor.updatedAt, options.cursor.updatedAt, options.cursor.id);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = options.limit ?? 20;
  params.push(limit);

  const query = `
    SELECT
      p.*, 
      GROUP_CONCAT(t.name, ',') AS tag_names,
      GROUP_CONCAT(t.slug, ',') AS tag_slugs
    FROM posts p
    LEFT JOIN post_tags pt ON pt.post_id = p.id
    LEFT JOIN tags t ON t.id = pt.tag_id
    ${where}
    GROUP BY p.id
    ORDER BY p.updated_at DESC, p.id DESC
    LIMIT ?
  `;

  const { results } = await db.prepare(query).bind(...params).all<PostRecord>();
  return results.map(mapPostRow);
};

export type CodexNewsCursor = {
  updatedAt: string;
  id: string;
};

export type ListCodexNewsOptions = {
  limit?: number;
  status?: 'draft' | 'published';
  query?: string;
  cursor?: CodexNewsCursor;
};

export const listCodexNewsItems = async (
  db: D1Database,
  options: ListCodexNewsOptions = {},
): Promise<NewsItemRecord[]> => {
  const params: unknown[] = [];
  const conditions: string[] = [];

  if (options.status) {
    conditions.push('status = ?');
    params.push(options.status);
  }

  if (options.query) {
    const escapedQuery = escapeLikePattern(options.query.toLowerCase());
    const term = `%${escapedQuery}%`;
    conditions.push(
      '(LOWER(title) LIKE ? ESCAPE \'\\\' OR LOWER(category) LIKE ? ESCAPE \'\\\' OR LOWER(body_markdown) LIKE ? ESCAPE \'\\\')',
    );
    params.push(term, term, term);
  }

  if (options.cursor) {
    conditions.push('(updated_at < ? OR (updated_at = ? AND id < ?))');
    params.push(options.cursor.updatedAt, options.cursor.updatedAt, options.cursor.id);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = options.limit ?? 20;
  params.push(limit);

  const query = `
    SELECT *
    FROM news_items
    ${where}
    ORDER BY updated_at DESC
    LIMIT ?
  `;

  const { results } = await db.prepare(query).bind(...params).all<NewsItemRecord>();
  return results;
};

export const listAllTags = async (db: D1Database): Promise<TagRecord[]> => {
  const query = `
    SELECT t.*, COUNT(pt.post_id) as post_count
    FROM tags t
    LEFT JOIN post_tags pt ON pt.tag_id = t.id
    LEFT JOIN posts p ON p.id = pt.post_id
    GROUP BY t.id
    ORDER BY t.name ASC
  `;
  const { results } = await db.prepare(query).all<TagRecord>();
  return results;
};

const ensureTags = async (db: D1Database, tags: string[]) => {
  // Prepare tag data
  const tagData: Array<{ name: string; slug: string; id: string }> = [];
  for (const rawTag of tags) {
    const name = rawTag.trim();
    if (!name) {
      continue;
    }
    const slug = slugify(name);
    tagData.push({ name, slug, id: crypto.randomUUID() });
  }

  if (tagData.length === 0) {
    return [];
  }

  // Fetch existing tags in a single query
  const slugs = tagData.map((t) => t.slug);
  const placeholders = slugs.map(() => '?').join(',');
  const existingTags = await db
    .prepare(`SELECT id, slug, name FROM tags WHERE slug IN (${placeholders})`)
    .bind(...slugs)
    .all<{ id: string; slug: string; name: string }>();

  const existingBySlug = new Map<string, { id: string; name: string }>();
  for (const tag of existingTags.results) {
    existingBySlug.set(tag.slug, { id: tag.id, name: tag.name });
  }

  // Build batch operations
  const statements: D1PreparedStatement[] = [];
  const ids: string[] = [];

  for (const tag of tagData) {
    const existing = existingBySlug.get(tag.slug);
    if (existing) {
      ids.push(existing.id);
      // Update name if different
      if (existing.name !== tag.name) {
        statements.push(
          db.prepare('UPDATE tags SET name = ? WHERE id = ?').bind(tag.name, existing.id),
        );
      }
    } else {
      ids.push(tag.id);
      statements.push(
        db.prepare('INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)').bind(tag.id, tag.name, tag.slug),
      );
    }
  }

  // Execute batch if we have statements
  if (statements.length > 0) {
    await db.batch(statements);
  }

  return ids;
};

const setPostTags = async (db: D1Database, postId: string, tagIds: string[]) => {
  // Build batch operations: delete old tags and insert new ones
  const statements: D1PreparedStatement[] = [];
  
  // First statement: delete existing tags
  statements.push(db.prepare('DELETE FROM post_tags WHERE post_id = ?').bind(postId));
  
  // Add insert statements for each tag
  for (const tagId of tagIds) {
    statements.push(
      db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)').bind(postId, tagId),
    );
  }
  
  // Execute all operations in a single batch
  await db.batch(statements);
};

export const createPost = async (db: D1Database, input: PostInput) => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db
    .prepare(
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
      id,
      input.slug,
      input.title,
      input.summary,
      input.body_markdown,
      input.status,
      input.published_at,
      now,
      now,
      input.reading_time_minutes,
      input.hero_image_url,
      input.hero_image_alt,
      input.featured ? 1 : 0,
      input.author_name,
      input.author_email,
      input.seo_title,
      input.seo_description,
    )
    .run();

  const tagIds = await ensureTags(db, input.tags);
  await setPostTags(db, id, tagIds);
  return id;
};

export const updatePost = async (db: D1Database, id: string, input: PostInput) => {
  const now = new Date().toISOString();
  await db
    .prepare(
      `UPDATE posts SET
        slug = ?,
        title = ?,
        summary = ?,
        body_markdown = ?,
        status = ?,
        published_at = ?,
        updated_at = ?,
        reading_time_minutes = ?,
        hero_image_url = ?,
        hero_image_alt = ?,
        featured = ?,
        author_name = ?,
        author_email = ?,
        seo_title = ?,
        seo_description = ?
      WHERE id = ?`
    )
    .bind(
      input.slug,
      input.title,
      input.summary,
      input.body_markdown,
      input.status,
      input.published_at,
      now,
      input.reading_time_minutes,
      input.hero_image_url,
      input.hero_image_alt,
      input.featured ? 1 : 0,
      input.author_name,
      input.author_email,
      input.seo_title,
      input.seo_description,
      id,
    )
    .run();

  const tagIds = await ensureTags(db, input.tags);
  await setPostTags(db, id, tagIds);
};

export const deletePost = async (db: D1Database, id: string) => {
  await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
};

export const listPublishedNewsItems = async (
  db: D1Database,
  nowIso: string,
  limit = 50,
): Promise<NewsItemRecord[]> => {
  const query = `
    SELECT *
    FROM news_items
    WHERE status = 'published' AND published_at IS NOT NULL AND published_at <= ?
    ORDER BY published_at DESC
    LIMIT ?
  `;
  const { results } = await db.prepare(query).bind(nowIso, limit).all<NewsItemRecord>();
  return results;
};

export const listAdminNewsItems = async (db: D1Database): Promise<NewsItemRecord[]> => {
  const query = `
    SELECT *
    FROM news_items
    ORDER BY updated_at DESC
  `;
  const { results } = await db.prepare(query).all<NewsItemRecord>();
  return results;
};

export const getNewsItemById = async (
  db: D1Database,
  id: string,
): Promise<NewsItemRecord | null> => {
  return db.prepare('SELECT * FROM news_items WHERE id = ?').bind(id).first<NewsItemRecord>();
};

export const createNewsItem = async (db: D1Database, input: NewsItemInput) => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO news_items (
        id,
        category,
        title,
        body_markdown,
        status,
        published_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      input.category,
      input.title,
      input.body_markdown,
      input.status,
      input.published_at,
      now,
      now,
    )
    .run();
  return id;
};

export const updateNewsItem = async (
  db: D1Database,
  id: string,
  input: NewsItemInput,
) => {
  const now = new Date().toISOString();
  await db
    .prepare(
      `UPDATE news_items SET
        category = ?,
        title = ?,
        body_markdown = ?,
        status = ?,
        published_at = ?,
        updated_at = ?
      WHERE id = ?`
    )
    .bind(
      input.category,
      input.title,
      input.body_markdown,
      input.status,
      input.published_at,
      now,
      id,
    )
    .run();
};

export const deleteNewsItem = async (db: D1Database, id: string) => {
  await db.prepare('DELETE FROM news_items WHERE id = ?').bind(id).run();
};

export const getAuthorizedUserByEmail = async (db: D1Database, email: string) => {
  return db
    .prepare('SELECT * FROM authorized_users WHERE email = ? AND is_active = 1')
    .bind(email)
    .first<AuthorizedUser>();
};

export const updateAuthorizedUserLogin = async (
  db: D1Database,
  userId: string,
  data: { name: string | null; google_sub: string | null; avatar_url: string | null },
) => {
  await db
    .prepare(
      `UPDATE authorized_users
       SET name = COALESCE(?, name),
           google_sub = COALESCE(?, google_sub),
           avatar_url = COALESCE(?, avatar_url),
           last_login_at = ?
       WHERE id = ?`
    )
    .bind(data.name, data.google_sub, data.avatar_url, new Date().toISOString(), userId)
    .run();
};

export const createSession = async (db: D1Database, userId: string, ttlSeconds: number) => {
  const id = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000).toISOString();
  await db
    .prepare('INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .bind(id, userId, now.toISOString(), expiresAt)
    .run();
  return { id, expiresAt };
};

export const getSessionUser = async (db: D1Database, sessionId: string) => {
  const now = new Date().toISOString();
  return db
    .prepare(
      `SELECT u.id, u.email, u.name, u.avatar_url
       FROM sessions s
       JOIN authorized_users u ON u.id = s.user_id
       WHERE s.id = ? AND s.expires_at > ? AND u.is_active = 1`
    )
    .bind(sessionId, now)
    .first<SessionUser>();
};

export const deleteSession = async (db: D1Database, sessionId: string) => {
  await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
};

export const createOauthState = async (db: D1Database, state: string, ttlSeconds: number) => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000).toISOString();
  await db
    .prepare('INSERT INTO oauth_states (state, created_at, expires_at) VALUES (?, ?, ?)')
    .bind(state, now.toISOString(), expiresAt)
    .run();
};

export const consumeOauthState = async (db: D1Database, state: string) => {
  const now = new Date().toISOString();
  const existing = await db
    .prepare('SELECT state FROM oauth_states WHERE state = ? AND expires_at > ?')
    .bind(state, now)
    .first<{ state: string }>();
  if (!existing) {
    return false;
  }
  await db.prepare('DELETE FROM oauth_states WHERE state = ?').bind(state).run();
  return true;
};

export type MediaAssetInput = {
  key: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string;
  caption: string | null;
  internal_description: string | null;
  tags: string[];
  author_name: string;
  author_email: string;
  uploaded_at: string;
  published_at: string | null;
};

export const createMediaAsset = async (db: D1Database, input: MediaAssetInput) => {
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO media_assets (
        id,
        key,
        filename,
        content_type,
        size_bytes,
        width,
        height,
        alt_text,
        caption,
        internal_description,
        tags,
        author_name,
        author_email,
        uploaded_at,
        published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      input.key,
      input.filename,
      input.content_type,
      input.size_bytes,
      input.width,
      input.height,
      input.alt_text,
      input.caption,
      input.internal_description,
      input.tags.join(','),
      input.author_name,
      input.author_email,
      input.uploaded_at,
      input.published_at,
    )
    .run();
  return id;
};

export const listMediaAssets = async (db: D1Database, limit = 24): Promise<MediaAsset[]> => {
  const { results } = await db
    .prepare('SELECT * FROM media_assets ORDER BY uploaded_at DESC LIMIT ?')
    .bind(limit)
    .all<MediaAssetRecord>();
  return results.map(mapMediaRow);
};

export const getMediaAssetById = async (db: D1Database, id: string): Promise<MediaAsset | null> => {
  const row = await db.prepare('SELECT * FROM media_assets WHERE id = ?').bind(id).first<MediaAssetRecord>();
  return row ? mapMediaRow(row) : null;
};

export const deleteMediaAsset = async (db: D1Database, id: string) => {
  await db.prepare('DELETE FROM media_assets WHERE id = ?').bind(id).run();
};
