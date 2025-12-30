import { estimateReadingTime, slugify } from '../utils';
import {
  createPost,
  getPostById,
  getPostBySlug,
  listAllTags,
  listCodexPosts,
  updatePost,
} from '../db';
import type { CodexPostCursor, PostInput } from '../db';
import type { PostStatus } from '../types';
import {
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
  const rateLimitError = checkRateLimit(request, RATE_LIMIT_CONFIG);
  if (rateLimitError) {
    return rateLimitError;
  }

  // Check authentication
  const authError = requireCodexToken(request, env);
  if (authError) {
    return authError;
  }

  const codexPath = path.slice(codexPrefix.length) || '/';

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
