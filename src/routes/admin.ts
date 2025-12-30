import { marked } from 'marked';
import {
  createMediaAsset,
  createPost,
  deleteMediaAsset,
  deletePost,
  getMediaAssetById,
  getPostById,
  listAdminPosts,
  listMediaAssets,
  updatePost,
} from '../db';
import {
  buildMediaUrl,
  HEADSHOT_IMAGE,
  htmlResponse,
  redirectResponse,
  requireAdminSession,
  safeReturnPath,
} from '../shared';
import {
  deriveTagsFromFilename,
  estimateReadingTime,
  formatBytes,
  formatDate,
  formatDateTime,
  formatDateTimeLocal,
  getFormValue,
  getImageDimensions,
  humanizeFilename,
  sanitizeFilename,
  slugify,
  splitTags,
  toBoolean,
} from '../utils';
import type { PostStatus } from '../types';
import { templates } from '../templates/index';
import type { PostInput } from '../db';

const listMediaItems = async (env: Env, limit = 24) => {
  try {
    const assets = await listMediaAssets(env.DB, limit);
    return assets.map((asset) => ({
      id: asset.id,
      key: asset.key,
      url: buildMediaUrl(asset.key),
      uploaded: formatDate(asset.uploaded_at),
      alt: asset.alt_text,
      caption: asset.caption ?? '',
      tags: asset.tags.length ? asset.tags.join(', ') : 'none',
      size: formatBytes(asset.size_bytes),
      filename: asset.filename,
      dimensions: asset.width && asset.height ? `${asset.width}x${asset.height}` : 'unknown',
    }));
  } catch {
    return [];
  }
};

const parsePostForm = async (request: Request) => {
  const data = await request.formData();
  const title = getFormValue(data, 'title');
  const slugInput = getFormValue(data, 'slug');
  const summary = getFormValue(data, 'summary');
  const bodyValue = data.get('body_markdown');
  const bodyMarkdown = typeof bodyValue === 'string' ? bodyValue : '';
  const statusInput = getFormValue(data, 'status') as PostStatus;
  const publishedAtInput = getFormValue(data, 'published_at');
  const tagsInput = getFormValue(data, 'tags');
  const authorName = getFormValue(data, 'author_name');
  const authorEmail = getFormValue(data, 'author_email');
  const heroImageUrl = getFormValue(data, 'hero_image_url');
  const heroImageAlt = getFormValue(data, 'hero_image_alt');
  const featured = toBoolean(getFormValue(data, 'featured'));
  const seoTitle = getFormValue(data, 'seo_title');
  const seoDescription = getFormValue(data, 'seo_description');

  const errors: string[] = [];
  if (!title) {
    errors.push('Title is required.');
  }
  if (!summary) {
    errors.push('Summary is required.');
  }
  if (!bodyMarkdown.trim()) {
    errors.push('Body is required.');
  }
  const slug = slugify(slugInput || title);
  if (!slug) {
    errors.push('Slug is required.');
  }

  const tags = splitTags(tagsInput)
    .map((tag) => tag.trim())
    .filter(Boolean);
  if (!tags.length) {
    errors.push('At least one tag is required.');
  }

  if (!authorName) {
    errors.push('Author name is required.');
  }
  if (!authorEmail) {
    errors.push('Author email is required.');
  }

  let publishedAt: string | null = null;
  let status: PostStatus = statusInput === 'published' ? 'published' : 'draft';
  if (status === 'published') {
    if (!publishedAtInput) {
      errors.push('Publish time is required when status is published.');
    } else {
      const parsed = new Date(publishedAtInput);
      if (Number.isNaN(parsed.getTime())) {
        errors.push('Publish time is invalid.');
      } else {
        publishedAt = parsed.toISOString();
      }
    }
  }

  const readingTime = estimateReadingTime(bodyMarkdown);

  return {
    errors,
    values: {
      title,
      slug,
      summary,
      body_markdown: bodyMarkdown,
      status,
      published_at: publishedAt,
      tags,
      author_name: authorName,
      author_email: authorEmail,
      hero_image_url: heroImageUrl || null,
      hero_image_alt: heroImageAlt || null,
      featured,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      reading_time_minutes: readingTime,
    } as PostInput,
    raw: {
      title,
      slug,
      summary,
      body_markdown: bodyMarkdown,
      status,
      published_at: publishedAtInput,
      tags: tagsInput,
      author_name: authorName,
      author_email: authorEmail,
      hero_image_url: heroImageUrl,
      hero_image_alt: heroImageAlt,
      featured,
      seo_title: seoTitle,
      seo_description: seoDescription,
    },
  };
};

const renderAdminEdit = async (
  request: Request,
  env: Env,
  view: Record<string, unknown>,
) => {
  const mediaItems = await listMediaItems(env);
  const returnTo =
    typeof view.return_to === 'string'
      ? view.return_to
      : `${new URL(request.url).pathname}${new URL(request.url).search}`;
  return htmlResponse(templates.adminEdit, {
    ...view,
    return_to: returnTo,
    media_items: mediaItems,
  });
};

/**
 * Handle admin panel routes (/admin/*)
 * Returns Response if route matches, null otherwise
 */
export const handleAdminRoutes = async (
  request: Request,
  env: Env,
  url: URL,
  method: string,
): Promise<Response | null> => {
  const path = url.pathname;

  if (!path.startsWith('/admin')) {
    return null;
  }

  // Require session for all admin routes except login/callback (handled by auth routes)
  const sessionUser = await requireAdminSession(request, env);
  if (!sessionUser) {
    return redirectResponse(request, '/admin/login');
  }

  // POST /admin/media/upload
  if (path === '/admin/media/upload' && method === 'POST') {
    const data = await request.formData();
    const file = data.get('image');
    const returnToRaw = data.get('return_to');
    const returnTo = safeReturnPath(
      request,
      typeof returnToRaw === 'string' ? returnToRaw : null,
    );
    if (!(file instanceof File) || file.size === 0) {
      return htmlResponse(
        templates.error,
        { message: 'Please choose an image to upload.' },
        400,
      );
    }
    if (!file.type.startsWith('image/')) {
      return htmlResponse(
        templates.error,
        { message: 'Only image uploads are supported.' },
        400,
      );
    }
    const { base, ext } = sanitizeFilename(file.name || 'image');
    const unique = crypto.randomUUID().slice(0, 8);
    const key = `uploads/${Date.now()}-${unique}-${base}${ext}`;
    const body = await file.arrayBuffer();
    const contentType = file.type || 'application/octet-stream';
    await env.MEDIA_BUCKET.put(key, body, {
      httpMetadata: {
        contentType,
      },
    });
    const nowIso = new Date().toISOString();
    const altText = humanizeFilename(base);
    const tags = deriveTagsFromFilename(base);
    const dimensions = getImageDimensions(body, contentType);
    await createMediaAsset(env.DB, {
      key,
      filename: `${base}${ext}`,
      content_type: contentType,
      size_bytes: file.size,
      width: dimensions.width,
      height: dimensions.height,
      alt_text: altText,
      caption: altText,
      internal_description: 'Uploaded via admin media library.',
      tags,
      author_name: sessionUser.name ?? 'Admin',
      author_email: sessionUser.email,
      uploaded_at: nowIso,
      published_at: nowIso,
    });
    return redirectResponse(request, returnTo);
  }

  // GET /admin/media
  if (path === '/admin/media' && method === 'GET') {
    const mediaItems = await listMediaItems(env);
    return htmlResponse(templates.adminMedia, {
      media_items: mediaItems,
    });
  }

  // POST /admin/media/:id/delete
  const mediaDeleteMatch = path.match(/^\/admin\/media\/([^/]+)\/delete$/);
  if (mediaDeleteMatch && method === 'POST') {
    const mediaId = mediaDeleteMatch[1];
    const asset = await getMediaAssetById(env.DB, mediaId);
    if (!asset) {
      return htmlResponse(templates.notFound, {}, 404);
    }
    await env.MEDIA_BUCKET.delete(asset.key);
    await deleteMediaAsset(env.DB, mediaId);
    return redirectResponse(request, '/admin/media#library');
  }

  // GET /admin
  if (path === '/admin' && method === 'GET') {
    const posts = await listAdminPosts(env.DB);
    const view = {
      user_email: sessionUser.email,
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        status_label: post.status === 'published' ? 'Published' : 'Draft',
        status_class:
          post.status === 'published'
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700',
        tag_list: post.tag_names.length ? post.tag_names.join(', ') : 'No tags',
        published_date: formatDateTime(post.published_at),
        updated_date: formatDateTime(post.updated_at),
      })),
    };
    return htmlResponse(templates.adminList, view);
  }

  // GET /admin/posts/new
  if (path === '/admin/posts/new' && method === 'GET') {
    const view = {
      page_title: 'New Post',
      page_heading: 'Create Post',
      page_subtitle: 'Draft a new story for bhart.org',
      form_action: '/admin/posts',
      title: '',
      slug: '',
      summary: '',
      body_markdown: '',
      status_draft_selected: true,
      status_published_selected: false,
      published_at: '',
      tags: '',
      author_name: sessionUser.name ?? '',
      author_email: sessionUser.email,
      hero_image_url: '',
      hero_image_alt: '',
      featured_checked: false,
      seo_title: '',
      seo_description: '',
      errors: [],
      show_delete: false,
      delete_action: '',
      return_to: '/admin/posts/new#media',
      show_preview: false,
      preview_url: '',
      save_success: false,
    };
    return renderAdminEdit(request, env, view);
  }

  // POST /admin/posts
  if (path === '/admin/posts' && method === 'POST') {
    const parsed = await parsePostForm(request);
    if (parsed.errors.length) {
      return renderAdminEdit(request, env, {
        page_title: 'New Post',
        page_heading: 'Create Post',
        page_subtitle: 'Draft a new story for bhart.org',
        form_action: '/admin/posts',
        status_draft_selected: parsed.values.status === 'draft',
        status_published_selected: parsed.values.status === 'published',
        published_at: parsed.raw.published_at,
        featured_checked: parsed.values.featured,
        errors: parsed.errors,
        show_delete: false,
        delete_action: '',
        return_to: '/admin/posts/new#media',
        show_preview: false,
        preview_url: '',
        save_success: false,
        ...parsed.raw,
      });
    }

    try {
      const id = await createPost(env.DB, parsed.values);
      return redirectResponse(request, `/admin/posts/${id}?saved=1`);
    } catch (error) {
      return renderAdminEdit(request, env, {
        page_title: 'New Post',
        page_heading: 'Create Post',
        page_subtitle: 'Draft a new story for bhart.org',
        form_action: '/admin/posts',
        status_draft_selected: parsed.values.status === 'draft',
        status_published_selected: parsed.values.status === 'published',
        published_at: parsed.raw.published_at,
        featured_checked: parsed.values.featured,
        errors: ['Unable to create post. Check slug uniqueness and required fields.'],
        show_delete: false,
        delete_action: '',
        return_to: '/admin/posts/new#media',
        show_preview: false,
        preview_url: '',
        save_success: false,
        ...parsed.raw,
      });
    }
  }

  // GET /admin/preview/:id
  const previewMatch = path.match(/^\/admin\/preview\/([^/]+)$/);
  if (previewMatch && method === 'GET') {
    const postId = previewMatch[1];
    const post = await getPostById(env.DB, postId);
    if (!post) {
      return htmlResponse(templates.notFound, {}, 404);
    }
    const bodyHtml = marked.parse(post.body_markdown);
    const view = {
      page_title: post.seo_title || `${post.title} - bhart.org`,
      seo_description: post.seo_description || post.summary,
      title: post.title,
      summary: post.summary,
      author_name: post.author_name,
      author_avatar: HEADSHOT_IMAGE,
      published_at: post.published_at ?? '',
      published_date: formatDate(post.published_at),
      reading_time: post.reading_time_minutes,
      hero_image_url: post.hero_image_url,
      hero_image_alt: post.hero_image_alt || post.title,
      body_html: bodyHtml,
      tags: post.tag_names.map((name) => ({ name })),
      preview: true,
      preview_edit_url: `/admin/posts/${post.id}`,
    };
    return htmlResponse(templates.article, view);
  }

  // GET /admin/posts/:id
  const editMatch = path.match(/^\/admin\/posts\/([^/]+)$/);
  if (editMatch && method === 'GET') {
    const postId = editMatch[1];
    const post = await getPostById(env.DB, postId);
    if (!post) {
      return htmlResponse(templates.notFound, {}, 404);
    }
    const saved = url.searchParams.get('saved') === '1';
    const view = {
      page_title: `Edit - ${post.title}`,
      page_heading: 'Edit Post',
      page_subtitle: 'Update the content and publishing details.',
      form_action: `/admin/posts/${post.id}`,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      body_markdown: post.body_markdown,
      status_draft_selected: post.status === 'draft',
      status_published_selected: post.status === 'published',
      published_at: formatDateTimeLocal(post.published_at),
      tags: post.tag_names.length ? post.tag_names.join(', ') : '',
      author_name: post.author_name,
      author_email: post.author_email,
      hero_image_url: post.hero_image_url ?? '',
      hero_image_alt: post.hero_image_alt ?? '',
      featured_checked: post.featured === 1,
      seo_title: post.seo_title ?? '',
      seo_description: post.seo_description ?? '',
      errors: [],
      show_delete: true,
      delete_action: `/admin/posts/${post.id}/delete`,
      return_to: `/admin/posts/${post.id}#media`,
      show_preview: true,
      preview_url: `/admin/preview/${post.id}`,
      save_success: saved,
    };
    return renderAdminEdit(request, env, view);
  }

  // POST /admin/posts/:id
  if (editMatch && method === 'POST') {
    const postId = editMatch[1];
    const parsed = await parsePostForm(request);
    if (parsed.errors.length) {
      return renderAdminEdit(request, env, {
        page_title: 'Edit Post',
        page_heading: 'Edit Post',
        page_subtitle: 'Update the content and publishing details.',
        form_action: `/admin/posts/${postId}`,
        status_draft_selected: parsed.values.status === 'draft',
        status_published_selected: parsed.values.status === 'published',
        published_at: parsed.raw.published_at,
        featured_checked: parsed.values.featured,
        errors: parsed.errors,
        show_delete: true,
        delete_action: `/admin/posts/${postId}/delete`,
        return_to: `/admin/posts/${postId}#media`,
        show_preview: true,
        preview_url: `/admin/preview/${postId}`,
        save_success: false,
        ...parsed.raw,
      });
    }

    try {
      await updatePost(env.DB, postId, parsed.values);
      return redirectResponse(request, `/admin/posts/${postId}?saved=1`);
    } catch (error) {
      return renderAdminEdit(request, env, {
        page_title: 'Edit Post',
        page_heading: 'Edit Post',
        page_subtitle: 'Update the content and publishing details.',
        form_action: `/admin/posts/${postId}`,
        status_draft_selected: parsed.values.status === 'draft',
        status_published_selected: parsed.values.status === 'published',
        published_at: parsed.raw.published_at,
        featured_checked: parsed.values.featured,
        errors: ['Unable to update post. Check slug uniqueness and required fields.'],
        show_delete: true,
        delete_action: `/admin/posts/${postId}/delete`,
        return_to: `/admin/posts/${postId}#media`,
        show_preview: true,
        preview_url: `/admin/preview/${postId}`,
        save_success: false,
        ...parsed.raw,
      });
    }
  }

  // POST /admin/posts/:id/delete
  const deleteMatch = path.match(/^\/admin\/posts\/([^/]+)\/delete$/);
  if (deleteMatch && method === 'POST') {
    const postId = deleteMatch[1];
    await deletePost(env.DB, postId);
    return redirectResponse(request, '/admin');
  }

  return null;
};
