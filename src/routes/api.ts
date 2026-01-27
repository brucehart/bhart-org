import {
  deriveTagsFromFilename,
  estimateReadingTime,
  extensionForContentType,
  getImageDimensions,
  sanitizeFilename,
  slugify,
} from '../utils';
import {
  createPost,
  createNewsItem,
  createMediaAsset,
  getNewsItemById,
  getPostById,
  getPostBySlug,
  listCodexNewsItems,
  listAllTags,
  listCodexPosts,
  updateNewsItem,
  updatePost,
} from '../db';
import type { CodexNewsCursor, CodexPostCursor, NewsItemInput, PostInput } from '../db';
import type { PostStatus } from '../types';
import type { NewsStatus } from '../types';
import {
  buildMediaUrl,
  jsonError,
  jsonResponse,
  logCodexAudit,
  normalizeOptionalString,
  normalizeRequiredString,
  parseIsoTimestamp,
  parseTagPatch,
  readJsonBody,
  requireCodexToken,
  serializePost,
  isPlainObject,
  type CodexTagPatch,
} from '../shared';
import { checkRateLimit } from '../middleware/rateLimit';

const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
};

const MAX_MEDIA_IMPORT_BYTES = 20 * 1024 * 1024; // 20 MB

const serializeNewsItem = (item: {
  id: string;
  category: string;
  title: string;
  body_markdown: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}) => {
  return {
    id: item.id,
    category: item.category,
    title: item.title,
    body_markdown: item.body_markdown,
    status: item.status,
    published_at: item.published_at,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
};

/**
 * Handle Codex API routes (/api/codex/v1/*)
 * Returns Response if route matches, null otherwise
 */
export const handleApiRoutes = async (
  request: Request,
  env: Env,
  url: URL,
  method: string,
): Promise<Response | null> => {
  const path = url.pathname;
  const codexPrefix = '/api/codex/v1';

  if (!path.startsWith(codexPrefix)) {
    return null;
  }

  // Check rate limit
  const rateLimitError = await checkRateLimit(request, env, RATE_LIMIT_CONFIG);
  if (rateLimitError) {
    return rateLimitError;
  }

  // Check authentication
  const authError = requireCodexToken(request, env);
  if (authError) {
    return authError;
  }

  const codexPath = path.slice(codexPrefix.length) || '/';

  // POST /media/import
  if (codexPath === '/media/import' && method === 'POST') {
    logCodexAudit(method, path, '');

    const payloadResult = await readJsonBody(request);
    if (!payloadResult.ok) {
      return payloadResult.response;
    }
    if (!isPlainObject(payloadResult.data)) {
      return jsonError(400, 'invalid_request', 'Request body must be a JSON object.');
    }

    const payload = payloadResult.data as Record<string, unknown>;
    const sourceUrl = normalizeRequiredString(payload.source_url);
    const altText = normalizeRequiredString(payload.alt_text);
    const authorName = normalizeRequiredString(payload.author_name);
    const authorEmail = normalizeRequiredString(payload.author_email);
    const filenameRaw = normalizeOptionalString(payload.filename);
    const keyPrefixRaw = normalizeOptionalString(payload.key_prefix);
    const captionRaw = normalizeOptionalString(payload.caption);
    const internalDescriptionRaw = normalizeOptionalString(payload.internal_description);
    const tagsRaw = payload.tags;

    const errors: string[] = [];
    if (!sourceUrl) errors.push('source_url is required.');
    if (!altText) errors.push('alt_text is required.');
    if (!authorName) errors.push('author_name is required.');
    if (!authorEmail) errors.push('author_email is required.');

    let parsedUrl: URL | null = null;
    if (sourceUrl) {
      try {
        parsedUrl = new URL(sourceUrl);
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          errors.push('source_url must be http(s).');
        }
      } catch {
        errors.push('source_url must be a valid URL.');
      }
    }

    let tags: string[] | null = null;
    if (tagsRaw !== undefined) {
      if (!Array.isArray(tagsRaw) || tagsRaw.some((item) => typeof item !== 'string')) {
        errors.push('tags must be an array of strings.');
      } else {
        tags = tagsRaw.map((item) => item.trim()).filter(Boolean);
      }
    }

    let keyPrefix = 'uploads';
    if (keyPrefixRaw !== undefined && keyPrefixRaw !== null) {
      const trimmed = keyPrefixRaw.trim().replace(/^\/+/, '').replace(/\/+$/, '');
      if (!trimmed) {
        errors.push('key_prefix must be a non-empty string when provided.');
      } else if (trimmed.includes('..')) {
        errors.push('key_prefix must not contain "..".');
      } else {
        keyPrefix = trimmed;
      }
    }

    if (errors.length > 0) {
      return jsonError(400, 'invalid_request', errors.join(' '));
    }

    const sourceUrlFinal = sourceUrl as string;
    const altTextFinal = altText as string;
    const authorNameFinal = authorName as string;
    const authorEmailFinal = authorEmail as string;

    const upstream = await fetch(sourceUrlFinal, {
      headers: {
        accept: 'image/*',
      },
    });

    if (!upstream.ok) {
      return jsonError(502, 'bad_gateway', `Failed to download source_url (status ${upstream.status}).`);
    }

    const contentTypeHeader = upstream.headers.get('content-type') ?? '';
    const contentType = contentTypeHeader.split(';')[0]?.trim() || 'application/octet-stream';
    if (!contentType.startsWith('image/')) {
      return jsonError(400, 'invalid_request', 'source_url must resolve to an image content-type.');
    }

    const body = await upstream.arrayBuffer();
    const sizeBytes = body.byteLength;
    if (sizeBytes <= 0) {
      return jsonError(400, 'invalid_request', 'Downloaded image was empty.');
    }
    if (sizeBytes > MAX_MEDIA_IMPORT_BYTES) {
      return jsonError(413, 'payload_too_large', `Image exceeds ${MAX_MEDIA_IMPORT_BYTES} bytes.`);
    }

    const filenameFromUrl = parsedUrl ? parsedUrl.pathname.split('/').pop() || 'image' : 'image';
    const filename = filenameRaw ?? filenameFromUrl;
    const { base, ext } = sanitizeFilename(filename);
    const mimeExtension = extensionForContentType(contentType);
    const normalizedExt = mimeExtension || ext || '.png';
    const unique = crypto.randomUUID().slice(0, 8);
    const key = `${keyPrefix}/${Date.now()}-${unique}-${base}${normalizedExt}`;

    await env.MEDIA_BUCKET.put(key, body, {
      httpMetadata: {
        contentType,
      },
    });

    const nowIso = new Date().toISOString();
    const derivedTags = tags ?? Array.from(new Set([...deriveTagsFromFilename(base), 'header', 'generated']));
    const dimensions = getImageDimensions(body, contentType);
    const mediaId = await createMediaAsset(env.DB, {
      key,
      filename: `${base}${normalizedExt}`,
      content_type: contentType,
      size_bytes: sizeBytes,
      width: dimensions.width,
      height: dimensions.height,
      alt_text: altTextFinal,
      caption: captionRaw ?? altTextFinal,
      internal_description:
        internalDescriptionRaw ??
        `Imported via Codex API from ${parsedUrl ? parsedUrl.hostname : 'source_url'}.`,
      tags: derivedTags,
      author_name: authorNameFinal,
      author_email: authorEmailFinal,
      uploaded_at: nowIso,
      published_at: nowIso,
    });

    return jsonResponse({
      media: {
        id: mediaId,
        key,
        url: buildMediaUrl(key),
        content_type: contentType,
        size_bytes: sizeBytes,
        width: dimensions.width,
        height: dimensions.height,
        alt_text: altTextFinal,
      },
    });
  }

  // GET /posts/by-slug/:slug
  const slugMatch = codexPath.match(/^\/posts\/by-slug\/([^/]+)$/);
  if (slugMatch && method === 'GET') {
    const slug = decodeURIComponent(slugMatch[1]);
    logCodexAudit(method, path, slug);
    const post = await getPostBySlug(env.DB, slug);
    if (!post) {
      return jsonError(404, 'not_found', 'Post not found.');
    }
    return jsonResponse({ post: serializePost(post) });
  }

  // GET /posts/:id
  const postMatch = codexPath.match(/^\/posts\/([^/]+)$/);
  if (postMatch && method === 'GET') {
    const postId = decodeURIComponent(postMatch[1]);
    logCodexAudit(method, path, postId);
    const post = await getPostById(env.DB, postId);
    if (!post) {
      return jsonError(404, 'not_found', 'Post not found.');
    }
    return jsonResponse({ post: serializePost(post) });
  }

  // PATCH /posts/:id
  if (postMatch && method === 'PATCH') {
    const postId = decodeURIComponent(postMatch[1]);
    logCodexAudit(method, path, postId);
    const post = await getPostById(env.DB, postId);
    if (!post) {
      return jsonError(404, 'not_found', 'Post not found.');
    }

    const payloadResult = await readJsonBody(request);
    if (!payloadResult.ok) {
      return payloadResult.response;
    }

    if (!isPlainObject(payloadResult.data)) {
      return jsonError(400, 'invalid_request', 'Request body must be a JSON object.');
    }

    const payload = payloadResult.data;
    const errors: string[] = [];
    const updates: Partial<PostInput> = {};

    const expectedUpdatedAtRaw = payload.expected_updated_at;
    let expectedUpdatedAt: string | null = null;
    if (expectedUpdatedAtRaw !== undefined) {
      if (typeof expectedUpdatedAtRaw !== 'string') {
        errors.push('expected_updated_at must be an ISO timestamp string.');
      } else {
        const parsed = parseIsoTimestamp(expectedUpdatedAtRaw);
        if (!parsed) {
          errors.push('expected_updated_at must be a valid ISO timestamp.');
        } else {
          expectedUpdatedAt = parsed;
        }
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'title')) {
      const title = normalizeRequiredString(payload.title);
      if (!title) {
        errors.push('title is required.');
      } else {
        updates.title = title;
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'summary')) {
      const summary = normalizeRequiredString(payload.summary);
      if (!summary) {
        errors.push('summary is required.');
      } else {
        updates.summary = summary;
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'body_markdown')) {
      if (typeof payload.body_markdown !== 'string') {
        errors.push('body_markdown must be a string.');
      } else if (!payload.body_markdown.trim()) {
        errors.push('body_markdown is required.');
      } else {
        updates.body_markdown = payload.body_markdown;
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
      if (payload.status !== 'draft' && payload.status !== 'published') {
        errors.push('status must be draft or published.');
      } else {
        updates.status = payload.status;
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'published_at')) {
      const raw = payload.published_at;
      if (raw === null) {
        updates.published_at = null;
      } else if (typeof raw === 'string') {
        const parsed = parseIsoTimestamp(raw);
        if (!parsed) {
          errors.push('published_at must be a valid ISO timestamp.');
        } else {
          updates.published_at = parsed;
        }
      } else {
        errors.push('published_at must be a string or null.');
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'hero_image_url')) {
      const heroImageUrl = normalizeOptionalString(payload.hero_image_url);
      if (heroImageUrl === undefined) {
        errors.push('hero_image_url must be a string or null.');
      } else {
        updates.hero_image_url = heroImageUrl;
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'hero_image_alt')) {
      const heroImageAlt = normalizeOptionalString(payload.hero_image_alt);
      if (heroImageAlt === undefined) {
        errors.push('hero_image_alt must be a string or null.');
      } else {
        updates.hero_image_alt = heroImageAlt;
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'featured')) {
      if (typeof payload.featured !== 'boolean') {
        errors.push('featured must be a boolean.');
      } else {
        updates.featured = payload.featured;
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'author_name')) {
      const authorName = normalizeRequiredString(payload.author_name);
      if (!authorName) {
        errors.push('author_name is required.');
      } else {
        updates.author_name = authorName;
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'author_email')) {
      const authorEmail = normalizeRequiredString(payload.author_email);
      if (!authorEmail) {
        errors.push('author_email is required.');
      } else {
        updates.author_email = authorEmail;
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'seo_title')) {
      const seoTitle = normalizeOptionalString(payload.seo_title);
      if (seoTitle === undefined) {
        errors.push('seo_title must be a string or null.');
      } else {
        updates.seo_title = seoTitle;
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'seo_description')) {
      const seoDescription = normalizeOptionalString(payload.seo_description);
      if (seoDescription === undefined) {
        errors.push('seo_description must be a string or null.');
      } else {
        updates.seo_description = seoDescription;
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'tags')) {
      const tagsPatch = parseTagPatch(post.tag_names, payload.tags as CodexTagPatch);
      if (!tagsPatch) {
        errors.push('tags must be an array or an object with set/add/remove.');
      } else {
        updates.tags = tagsPatch;
      }
    }

    let recomputeSlug = false;
    let recomputeReadingTime = false;
    if (Object.prototype.hasOwnProperty.call(payload, 'recompute')) {
      if (!isPlainObject(payload.recompute)) {
        errors.push('recompute must be an object.');
      } else {
        const recompute = payload.recompute;
        if (
          Object.prototype.hasOwnProperty.call(recompute, 'slugFromTitle') &&
          typeof recompute.slugFromTitle !== 'boolean'
        ) {
          errors.push('recompute.slugFromTitle must be a boolean.');
        } else if (recompute.slugFromTitle === true) {
          recomputeSlug = true;
        }

        if (
          Object.prototype.hasOwnProperty.call(recompute, 'readingTime') &&
          typeof recompute.readingTime !== 'boolean'
        ) {
          errors.push('recompute.readingTime must be a boolean.');
        } else if (recompute.readingTime === true) {
          recomputeReadingTime = true;
        }
      }
    }

    if (errors.length) {
      return jsonError(400, 'invalid_request', 'Validation failed.', errors);
    }

    if (expectedUpdatedAt && post.updated_at !== expectedUpdatedAt) {
      return jsonError(409, 'conflict', 'Post has been updated since last read.', {
        expected_updated_at: expectedUpdatedAt,
        current_updated_at: post.updated_at,
      });
    }

    const nextInput: PostInput = {
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      body_markdown: post.body_markdown,
      status: post.status,
      published_at: post.published_at,
      hero_image_url: post.hero_image_url,
      hero_image_alt: post.hero_image_alt,
      featured: post.featured === 1,
      author_name: post.author_name,
      author_email: post.author_email,
      seo_title: post.seo_title,
      seo_description: post.seo_description,
      reading_time_minutes: post.reading_time_minutes,
      tags: post.tag_names,
    };

    Object.assign(nextInput, updates);

    if (recomputeSlug) {
      const nextSlug = slugify(nextInput.title);
      if (!nextSlug) {
        return jsonError(400, 'invalid_request', 'Unable to compute slug from title.');
      }
      nextInput.slug = nextSlug;
    }

    const bodyChanged =
      updates.body_markdown !== undefined && updates.body_markdown !== post.body_markdown;
    if (bodyChanged || recomputeReadingTime) {
      nextInput.reading_time_minutes = estimateReadingTime(nextInput.body_markdown);
    }

    if (!nextInput.title.trim()) {
      errors.push('title is required.');
    }
    if (!nextInput.summary.trim()) {
      errors.push('summary is required.');
    }
    if (!nextInput.body_markdown.trim()) {
      errors.push('body_markdown is required.');
    }
    if (!nextInput.author_name.trim()) {
      errors.push('author_name is required.');
    }
    if (!nextInput.author_email.trim()) {
      errors.push('author_email is required.');
    }
    if (!nextInput.tags.length) {
      errors.push('At least one tag is required.');
    }

    if (nextInput.status === 'draft') {
      nextInput.published_at = null;
    } else if (!nextInput.published_at) {
      errors.push('published_at is required when status is published.');
    }

    if (errors.length) {
      return jsonError(400, 'invalid_request', 'Validation failed.', errors);
    }

    await updatePost(env.DB, postId, nextInput);
    const updated = await getPostById(env.DB, postId);
    if (!updated) {
      return jsonError(500, 'update_failed', 'Post updated but could not be reloaded.');
    }
    return jsonResponse({ post: serializePost(updated) });
  }

  // GET /news/:id
  const newsMatch = codexPath.match(/^\/news\/([^/]+)$/);
  if (newsMatch && method === 'GET') {
    const newsId = decodeURIComponent(newsMatch[1]);
    logCodexAudit(method, path, newsId);
    const item = await getNewsItemById(env.DB, newsId);
    if (!item) {
      return jsonError(404, 'not_found', 'News item not found.');
    }
    return jsonResponse({ news_item: serializeNewsItem(item) });
  }

  // PATCH /news/:id
  if (newsMatch && method === 'PATCH') {
    const newsId = decodeURIComponent(newsMatch[1]);
    logCodexAudit(method, path, newsId);
    const item = await getNewsItemById(env.DB, newsId);
    if (!item) {
      return jsonError(404, 'not_found', 'News item not found.');
    }

    const payloadResult = await readJsonBody(request);
    if (!payloadResult.ok) {
      return payloadResult.response;
    }

    if (!isPlainObject(payloadResult.data)) {
      return jsonError(400, 'invalid_request', 'Request body must be a JSON object.');
    }

    const payload = payloadResult.data;
    const errors: string[] = [];
    const updates: Partial<NewsItemInput> = {};

    const expectedUpdatedAtRaw = payload.expected_updated_at;
    let expectedUpdatedAt: string | null = null;
    if (expectedUpdatedAtRaw !== undefined) {
      if (typeof expectedUpdatedAtRaw !== 'string') {
        errors.push('expected_updated_at must be an ISO timestamp string.');
      } else {
        const parsed = parseIsoTimestamp(expectedUpdatedAtRaw);
        if (!parsed) {
          errors.push('expected_updated_at must be a valid ISO timestamp.');
        } else {
          expectedUpdatedAt = parsed;
        }
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'category')) {
      const category = normalizeRequiredString(payload.category);
      if (!category) {
        errors.push('category is required.');
      } else {
        updates.category = category;
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'title')) {
      const title = normalizeRequiredString(payload.title);
      if (!title) {
        errors.push('title is required.');
      } else {
        updates.title = title;
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'body_markdown')) {
      if (typeof payload.body_markdown !== 'string') {
        errors.push('body_markdown must be a string.');
      } else if (!payload.body_markdown.trim()) {
        errors.push('body_markdown is required.');
      } else {
        updates.body_markdown = payload.body_markdown;
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
      if (payload.status !== 'draft' && payload.status !== 'published') {
        errors.push('status must be draft or published.');
      } else {
        updates.status = payload.status;
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'published_at')) {
      const raw = payload.published_at;
      if (raw === null) {
        updates.published_at = null;
      } else if (typeof raw === 'string') {
        const parsed = parseIsoTimestamp(raw);
        if (!parsed) {
          errors.push('published_at must be a valid ISO timestamp.');
        } else {
          updates.published_at = parsed;
        }
      } else {
        errors.push('published_at must be a string or null.');
      }
    }

    if (errors.length) {
      return jsonError(400, 'invalid_request', 'Validation failed.', errors);
    }

    if (expectedUpdatedAt && item.updated_at !== expectedUpdatedAt) {
      return jsonError(409, 'conflict', 'News item has been updated since last read.', {
        expected_updated_at: expectedUpdatedAt,
        current_updated_at: item.updated_at,
      });
    }

    const nextInput: NewsItemInput = {
      category: item.category,
      title: item.title,
      body_markdown: item.body_markdown,
      status: item.status as NewsStatus,
      published_at: item.published_at,
    };

    Object.assign(nextInput, updates);

    if (!nextInput.category.trim()) {
      errors.push('category is required.');
    }
    if (!nextInput.title.trim()) {
      errors.push('title is required.');
    }
    if (!nextInput.body_markdown.trim()) {
      errors.push('body_markdown is required.');
    }

    if (nextInput.status === 'draft') {
      nextInput.published_at = null;
    } else if (!nextInput.published_at) {
      errors.push('published_at is required when status is published.');
    }

    if (errors.length) {
      return jsonError(400, 'invalid_request', 'Validation failed.', errors);
    }

    await updateNewsItem(env.DB, newsId, nextInput);
    const updated = await getNewsItemById(env.DB, newsId);
    if (!updated) {
      return jsonError(500, 'server_error', 'Unable to load updated news item.');
    }
    return jsonResponse({ news_item: serializeNewsItem(updated) });
  }

  // POST /news
  if (codexPath === '/news' && method === 'POST') {
    logCodexAudit(method, path);

    const payloadResult = await readJsonBody(request);
    if (!payloadResult.ok) {
      return payloadResult.response;
    }

    if (!isPlainObject(payloadResult.data)) {
      return jsonError(400, 'invalid_request', 'Request body must be a JSON object.');
    }

    const payload = payloadResult.data;
    const errors: string[] = [];

    const category = normalizeRequiredString(payload.category);
    if (!category) {
      errors.push('category is required.');
    }

    const title = normalizeRequiredString(payload.title);
    if (!title) {
      errors.push('title is required.');
    }

    const bodyMarkdown =
      typeof payload.body_markdown === 'string' ? payload.body_markdown.trim() : '';
    if (!bodyMarkdown) {
      errors.push('body_markdown is required.');
    }

    let status: NewsStatus = payload.status === 'published' ? 'published' : 'draft';
    if (payload.status && payload.status !== 'draft' && payload.status !== 'published') {
      errors.push('status must be draft or published.');
    }

    let publishedAt: string | null = null;
    if (payload.published_at !== undefined) {
      if (payload.published_at === null) {
        publishedAt = null;
      } else if (typeof payload.published_at === 'string') {
        const parsed = parseIsoTimestamp(payload.published_at);
        if (!parsed) {
          errors.push('published_at must be a valid ISO timestamp.');
        } else {
          publishedAt = parsed;
        }
      } else {
        errors.push('published_at must be a string or null.');
      }
    }

    if (status === 'published' && !publishedAt) {
      errors.push('published_at is required when status is published.');
    }

    if (errors.length) {
      return jsonError(400, 'invalid_request', 'Validation failed.', errors);
    }

    const id = await createNewsItem(env.DB, {
      category: category ?? '',
      title: title ?? '',
      body_markdown: bodyMarkdown,
      status,
      published_at: publishedAt,
    });

    const created = await getNewsItemById(env.DB, id);
    if (!created) {
      return jsonError(500, 'server_error', 'Unable to load created news item.');
    }
    return jsonResponse({ news_item: serializeNewsItem(created) }, 201);
  }

  // GET /news
  if (codexPath === '/news' && method === 'GET') {
    logCodexAudit(method, path);
    const statusParam = url.searchParams.get('status') ?? undefined;
    if (statusParam && statusParam !== 'draft' && statusParam !== 'published') {
      return jsonError(400, 'invalid_request', 'status must be draft or published.');
    }
    const query = url.searchParams.get('q')?.trim() || undefined;
    const limitRaw = url.searchParams.get('limit');
    let limit = 20;
    if (limitRaw) {
      const parsed = Number(limitRaw);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return jsonError(400, 'invalid_request', 'limit must be a positive number.');
      }
      limit = Math.min(Math.floor(parsed), 100);
    }

    const cursorRaw = url.searchParams.get('cursor');
    let cursor: CodexNewsCursor | undefined;
    if (cursorRaw) {
      const [updatedAtRaw, id] = cursorRaw.split('|');
      const parsed = updatedAtRaw ? parseIsoTimestamp(updatedAtRaw) : null;
      if (!parsed || !id) {
        return jsonError(400, 'invalid_request', 'cursor must be "<updated_at>|<id>".');
      }
      cursor = { updatedAt: parsed, id };
    }

    const items = await listCodexNewsItems(env.DB, {
      status: statusParam as NewsStatus | undefined,
      query,
      limit: limit + 1,
      cursor,
    });

    const hasNext = items.length > limit;
    const pageItems = hasNext ? items.slice(0, limit) : items;
    const last = pageItems[pageItems.length - 1];
    const nextCursor = hasNext && last ? `${last.updated_at}|${last.id}` : null;

    return jsonResponse({
      news_items: pageItems.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        status: item.status,
        updated_at: item.updated_at,
        published_at: item.published_at,
      })),
      next_cursor: nextCursor,
    });
  }

  // POST /posts
  if (codexPath === '/posts' && method === 'POST') {
    logCodexAudit(method, path);

    const payloadResult = await readJsonBody(request);
    if (!payloadResult.ok) {
      return payloadResult.response;
    }

    if (!isPlainObject(payloadResult.data)) {
      return jsonError(400, 'invalid_request', 'Request body must be a JSON object.');
    }

    const payload = payloadResult.data;
    const errors: string[] = [];

    const title = normalizeRequiredString(payload.title);
    if (!title) {
      errors.push('title is required.');
    }

    const summary = normalizeRequiredString(payload.summary);
    if (!summary) {
      errors.push('summary is required.');
    }

    const bodyMarkdown = payload.body_markdown;
    if (typeof bodyMarkdown !== 'string') {
      errors.push('body_markdown must be a string.');
    } else if (!bodyMarkdown.trim()) {
      errors.push('body_markdown is required.');
    }

    const slugInput =
      typeof payload.slug === 'string' && payload.slug.trim() ? payload.slug.trim() : null;
    const slug = title ? slugify(slugInput || title) : null;
    if (!slug) {
      errors.push('slug is required.');
    }

    const authorName = normalizeRequiredString(payload.author_name);
    if (!authorName) {
      errors.push('author_name is required.');
    }

    const authorEmail = normalizeRequiredString(payload.author_email);
    if (!authorEmail) {
      errors.push('author_email is required.');
    }

    const statusRaw = payload.status;
    const status: PostStatus = statusRaw === undefined ? 'draft' : (statusRaw as PostStatus);
    if (status !== 'draft' && status !== 'published') {
      errors.push('status must be draft or published.');
    }

    const tagsPatch = Object.prototype.hasOwnProperty.call(payload, 'tags')
      ? parseTagPatch([], payload.tags as CodexTagPatch)
      : null;
    if (!tagsPatch) {
      errors.push('tags must be provided as an array or patch object.');
    } else if (!tagsPatch.length) {
      errors.push('At least one tag is required.');
    }

    let heroImageUrl: string | null = null;
    if (Object.prototype.hasOwnProperty.call(payload, 'hero_image_url')) {
      const value = normalizeOptionalString(payload.hero_image_url);
      if (value === undefined) {
        errors.push('hero_image_url must be a string or null.');
      } else {
        heroImageUrl = value;
      }
    }

    let heroImageAlt: string | null = null;
    if (Object.prototype.hasOwnProperty.call(payload, 'hero_image_alt')) {
      const value = normalizeOptionalString(payload.hero_image_alt);
      if (value === undefined) {
        errors.push('hero_image_alt must be a string or null.');
      } else {
        heroImageAlt = value;
      }
    }

    let seoTitle: string | null = null;
    if (Object.prototype.hasOwnProperty.call(payload, 'seo_title')) {
      const value = normalizeOptionalString(payload.seo_title);
      if (value === undefined) {
        errors.push('seo_title must be a string or null.');
      } else {
        seoTitle = value;
      }
    }

    let seoDescription: string | null = null;
    if (Object.prototype.hasOwnProperty.call(payload, 'seo_description')) {
      const value = normalizeOptionalString(payload.seo_description);
      if (value === undefined) {
        errors.push('seo_description must be a string or null.');
      } else {
        seoDescription = value;
      }
    }

    let featured = false;
    if (Object.prototype.hasOwnProperty.call(payload, 'featured')) {
      if (typeof payload.featured !== 'boolean') {
        errors.push('featured must be a boolean.');
      } else {
        featured = payload.featured;
      }
    }

    const publishedAtRaw = payload.published_at;
    let publishedAt: string | null = null;
    if (status === 'published') {
      if (typeof publishedAtRaw !== 'string') {
        errors.push('published_at is required when status is published.');
      } else {
        const parsed = parseIsoTimestamp(publishedAtRaw);
        if (!parsed) {
          errors.push('published_at must be a valid ISO timestamp.');
        } else {
          publishedAt = parsed;
        }
      }
    } else if (publishedAtRaw !== undefined && publishedAtRaw !== null) {
      errors.push('published_at must be null or omitted when status is draft.');
    }

    if (errors.length) {
      return jsonError(400, 'invalid_request', 'Validation failed.', errors);
    }

    const input: PostInput = {
      slug: slug!,
      title: title!,
      summary: summary!,
      body_markdown: bodyMarkdown as string,
      status,
      published_at: publishedAt,
      hero_image_url: heroImageUrl,
      hero_image_alt: heroImageAlt,
      featured,
      author_name: authorName!,
      author_email: authorEmail!,
      seo_title: seoTitle,
      seo_description: seoDescription,
      reading_time_minutes: estimateReadingTime(bodyMarkdown as string),
      tags: tagsPatch!,
    };

    try {
      const id = await createPost(env.DB, input);
      const created = await getPostById(env.DB, id);
      if (!created) {
        return jsonError(500, 'create_failed', 'Post created but could not be reloaded.');
      }
      return jsonResponse({ post: serializePost(created) }, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      return jsonError(
        409,
        'conflict',
        'Unable to create post. Check slug uniqueness and required fields.',
        message ? { message } : undefined,
      );
    }
  }

  // GET /posts
  if (codexPath === '/posts' && method === 'GET') {
    logCodexAudit(method, path);
    const statusParam = url.searchParams.get('status') ?? undefined;
    if (statusParam && statusParam !== 'draft' && statusParam !== 'published') {
      return jsonError(400, 'invalid_request', 'status must be draft or published.');
    }
    const tagSlug = url.searchParams.get('tag')?.trim() || undefined;
    const query = url.searchParams.get('q')?.trim() || undefined;
    const limitRaw = url.searchParams.get('limit');
    let limit = 20;
    if (limitRaw) {
      const parsed = Number(limitRaw);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return jsonError(400, 'invalid_request', 'limit must be a positive number.');
      }
      limit = Math.min(Math.floor(parsed), 100);
    }

    const cursorRaw = url.searchParams.get('cursor');
    let cursor: CodexPostCursor | undefined;
    if (cursorRaw) {
      const [updatedAtRaw, id] = cursorRaw.split('|');
      const parsed = updatedAtRaw ? parseIsoTimestamp(updatedAtRaw) : null;
      if (!parsed || !id) {
        return jsonError(400, 'invalid_request', 'cursor must be "<updated_at>|<id>".');
      }
      cursor = { updatedAt: parsed, id };
    }

    const items = await listCodexPosts(env.DB, {
      status: statusParam as PostStatus | undefined,
      tagSlug,
      query,
      limit: limit + 1,
      cursor,
    });

    const hasNext = items.length > limit;
    const pageItems = hasNext ? items.slice(0, limit) : items;
    const last = pageItems[pageItems.length - 1];
    const nextCursor = hasNext && last ? `${last.updated_at}|${last.id}` : null;

    return jsonResponse({
      posts: pageItems.map((postItem) => ({
        id: postItem.id,
        slug: postItem.slug,
        title: postItem.title,
        status: postItem.status,
        updated_at: postItem.updated_at,
        published_at: postItem.published_at,
        tag_slugs: postItem.tag_slugs,
      })),
      next_cursor: nextCursor,
    });
  }

  // GET /tags
  if (codexPath === '/tags' && method === 'GET') {
    logCodexAudit(method, path);
    const tags = await listAllTags(env.DB);
    return jsonResponse({ tags });
  }

  return jsonError(404, 'not_found', 'Route not found.');
};
