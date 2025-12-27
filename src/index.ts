import Mustache from 'mustache';
import { marked } from 'marked';
import {
  consumeOauthState,
  createOauthState,
  createMediaAsset,
  createPost,
  createSession,
  deleteMediaAsset,
  deletePost,
  deleteSession,
  getAuthorizedUserByEmail,
  getMediaAssetById,
  getPostById,
  getPostBySlug,
  getSessionUser,
  listAdminPosts,
  listMediaAssets,
  listPublishedPosts,
  listTags,
  updateAuthorizedUserLogin,
  updatePost,
} from './db';
import { templates } from './templates';
import {
  SESSION_COOKIE_NAME,
  estimateReadingTime,
  formatBytes,
  formatDate,
  formatDateTimeLocal,
  deriveTagsFromFilename,
  getFormValue,
  getImageDimensions,
  humanizeFilename,
  sanitizeFilename,
  slugify,
  splitTags,
  toBoolean,
} from './utils';
import type { PostStatus } from './types';

const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1200&q=80';
const DEFAULT_CARD_IMAGE =
  'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1200&q=80';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const OAUTH_STATE_TTL_SECONDS = 60 * 10;

marked.setOptions({
  mangle: false,
  headerIds: false,
});

const htmlResponse = (template: string, view: Record<string, unknown>, status = 200) => {
  return new Response(Mustache.render(template, view), {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
    },
  });
};

const redirectResponse = (request: Request, path: string, headers?: Headers) => {
  const url = new URL(path, request.url);
  const responseHeaders = headers ?? new Headers();
  responseHeaders.set('Location', url.toString());
  return new Response(null, { status: 302, headers: responseHeaders });
};

const parseCookies = (request: Request) => {
  const header = request.headers.get('cookie');
  const cookies: Record<string, string> = {};
  if (!header) {
    return cookies;
  }
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (!name) {
      continue;
    }
    cookies[name] = decodeURIComponent(rest.join('='));
  }
  return cookies;
};

const getCookie = (request: Request, name: string) => {
  const cookies = parseCookies(request);
  return cookies[name];
};

const buildCookieOptions = (request: Request, maxAge?: number) => {
  const isSecure = new URL(request.url).protocol === 'https:';
  const parts = ['Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (isSecure) {
    parts.push('Secure');
  }
  if (typeof maxAge === 'number') {
    parts.push(`Max-Age=${maxAge}`);
  }
  return parts.join('; ');
};

const buildSessionCookie = (request: Request, value: string, maxAge: number) => {
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}; ${buildCookieOptions(request, maxAge)}`;
};

const clearSessionCookie = (request: Request) => {
  return `${SESSION_COOKIE_NAME}=; ${buildCookieOptions(request, 0)}`;
};

const getRedirectUri = (request: Request, env: Env) => {
  return env.GOOGLE_OAUTH_REDIRECT_URI ?? new URL('/admin/callback', request.url).toString();
};

const buildGoogleAuthUrl = async (request: Request, env: Env) => {
  const state = crypto.randomUUID();
  await createOauthState(env.DB, state, OAUTH_STATE_TTL_SECONDS);
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  url.searchParams.set('redirect_uri', getRedirectUri(request, env));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', state);
  url.searchParams.set('prompt', 'select_account');
  return url.toString();
};

const requireAdminSession = async (request: Request, env: Env) => {
  const sessionId = getCookie(request, SESSION_COOKIE_NAME);
  if (!sessionId) {
    return null;
  }
  return getSessionUser(env.DB, sessionId);
};

const buildMediaUrl = (key: string) => {
  return `/media/${key}`;
};

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
      dimensions:
        asset.width && asset.height ? `${asset.width}x${asset.height}` : 'unknown',
    }));
  } catch {
    return [];
  }
};

const safeReturnPath = (request: Request, value: string | null) => {
  if (!value) {
    return '/admin';
  }
  try {
    const parsed = new URL(value, request.url);
    const origin = new URL(request.url).origin;
    if (parsed.origin !== origin) {
      return '/admin';
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/admin';
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

  const tags = splitTags(tagsInput).map((tag) => tag.trim()).filter(Boolean);
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
    },
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method.toUpperCase();

      if (path === '/admin/login') {
        const session = await requireAdminSession(request, env);
        if (session) {
          return redirectResponse(request, '/admin');
        }
        return htmlResponse(templates.login, {});
      }

      if (path === '/admin/login/start') {
        const authUrl = await buildGoogleAuthUrl(request, env);
        return redirectResponse(request, authUrl);
      }

      if (path === '/admin/callback') {
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        if (!code || !state) {
          return htmlResponse(templates.error, { message: 'Missing OAuth response.' }, 400);
        }

        const validState = await consumeOauthState(env.DB, state);
        if (!validState) {
          return htmlResponse(templates.error, { message: 'OAuth state invalid or expired.' }, 400);
        }

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            redirect_uri: getRedirectUri(request, env),
            grant_type: 'authorization_code',
          }).toString(),
        });

        if (!tokenResponse.ok) {
          return htmlResponse(templates.error, { message: 'Unable to complete OAuth exchange.' }, 500);
        }

        const tokenData = (await tokenResponse.json()) as {
          access_token?: string;
        };

        if (!tokenData.access_token) {
          return htmlResponse(templates.error, { message: 'No access token returned.' }, 500);
        }

        const userResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        if (!userResponse.ok) {
          return htmlResponse(templates.error, { message: 'Unable to read Google profile.' }, 500);
        }

        const userInfo = (await userResponse.json()) as {
          email?: string;
          email_verified?: boolean;
          name?: string;
          sub?: string;
          picture?: string;
        };

        if (!userInfo.email || !userInfo.email_verified) {
          return htmlResponse(templates.error, { message: 'Google account email not verified.' }, 403);
        }

        const authorizedUser = await getAuthorizedUserByEmail(env.DB, userInfo.email);
        if (!authorizedUser) {
          return htmlResponse(templates.unauthorized, {}, 403);
        }

        await updateAuthorizedUserLogin(env.DB, authorizedUser.id, {
          name: userInfo.name ?? null,
          google_sub: userInfo.sub ?? null,
          avatar_url: userInfo.picture ?? null,
        });

        const session = await createSession(env.DB, authorizedUser.id, SESSION_TTL_SECONDS);
        const headers = new Headers();
        headers.append('Set-Cookie', buildSessionCookie(request, session.id, SESSION_TTL_SECONDS));
        return redirectResponse(request, '/admin', headers);
      }

      if (path === '/admin/logout' && method === 'POST') {
        const sessionId = getCookie(request, SESSION_COOKIE_NAME);
        if (sessionId) {
          await deleteSession(env.DB, sessionId);
        }
        const headers = new Headers();
        headers.append('Set-Cookie', clearSessionCookie(request));
        return redirectResponse(request, '/', headers);
      }

      if (path.startsWith('/media/') && (method === 'GET' || method === 'HEAD')) {
        const key = decodeURIComponent(path.replace('/media/', ''));
        if (!key) {
          return htmlResponse(templates.notFound, {}, 404);
        }
        const object = await env.MEDIA_BUCKET.get(key);
        if (!object) {
          return htmlResponse(templates.notFound, {}, 404);
        }
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('cache-control', 'public, max-age=31536000, immutable');
        return new Response(method === 'HEAD' ? null : object.body, {
          status: 200,
          headers,
        });
      }

      if (path.startsWith('/admin')) {
        const sessionUser = await requireAdminSession(request, env);
        if (!sessionUser) {
          return redirectResponse(request, '/admin/login');
        }

        if (path === '/admin/media/upload' && method === 'POST') {
          const data = await request.formData();
          const file = data.get('image');
          const returnToRaw = data.get('return_to');
          const returnTo = safeReturnPath(request, typeof returnToRaw === 'string' ? returnToRaw : null);
          if (!(file instanceof File) || file.size === 0) {
            return htmlResponse(templates.error, { message: 'Please choose an image to upload.' }, 400);
          }
          if (!file.type.startsWith('image/')) {
            return htmlResponse(templates.error, { message: 'Only image uploads are supported.' }, 400);
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

        if (path === '/admin/media' && method === 'GET') {
          const mediaItems = await listMediaItems(env);
          return htmlResponse(templates.adminMedia, {
            media_items: mediaItems,
          });
        }

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
              updated_date: formatDate(post.updated_at),
            })),
          };
          return htmlResponse(templates.adminList, view);
        }

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
          };
          return renderAdminEdit(request, env, view);
        }

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
              ...parsed.raw,
            });
          }

          try {
            const id = await createPost(env.DB, parsed.values);
            return redirectResponse(request, `/admin/posts/${id}`);
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
              ...parsed.raw,
            });
          }
        }

        const editMatch = path.match(/^\/admin\/posts\/([^/]+)$/);
        if (editMatch && method === 'GET') {
          const postId = editMatch[1];
          const post = await getPostById(env.DB, postId);
          if (!post) {
            return htmlResponse(templates.notFound, {}, 404);
          }
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
          };
          return renderAdminEdit(request, env, view);
        }

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
              ...parsed.raw,
            });
          }

          try {
            await updatePost(env.DB, postId, parsed.values);
            return redirectResponse(request, `/admin/posts/${postId}`);
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
              ...parsed.raw,
            });
          }
        }

        const deleteMatch = path.match(/^\/admin\/posts\/([^/]+)\/delete$/);
        if (deleteMatch && method === 'POST') {
          const postId = deleteMatch[1];
          await deletePost(env.DB, postId);
          return redirectResponse(request, '/admin');
        }
      }

      if (path === '/' && method === 'GET') {
        const tagFilter = url.searchParams.get('tag') ?? undefined;
        const nowIso = new Date().toISOString();
        const [posts, tags] = await Promise.all([
          listPublishedPosts(env.DB, nowIso, { limit: 9, tagSlug: tagFilter }),
          listTags(env.DB, nowIso),
        ]);

        const featured = posts.find((post) => post.featured === 1) ?? posts[0];
        const remainingPosts = posts.filter((post) => post.id !== featured?.id);
        const listPosts = remainingPosts.length ? remainingPosts : posts;
        const heroImage = featured?.hero_image_url ?? DEFAULT_HERO_IMAGE;

        const tagFilters = [
          {
            name: 'All',
            url: '/',
            chip_class: tagFilter
              ? 'flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white border border-gray-200 hover:border-primary/50 px-5 text-sm font-medium text-text-main transition-colors'
              : 'flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-text-main px-5 text-sm font-medium text-white transition-colors',
          },
          ...tags.map((tag) => ({
            name: tag.name,
            url: `/?tag=${tag.slug}`,
            chip_class:
              tag.slug === tagFilter
                ? 'flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-text-main px-5 text-sm font-medium text-white transition-colors'
                : 'flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white border border-gray-200 hover:border-primary/50 px-5 text-sm font-medium text-text-main transition-colors',
          })),
        ];

        const view = {
          site_title: 'bhart.org - AI, Tech and Personal Blog',
          hero: featured
            ? {
                title: featured.title,
                url: `/articles/${featured.slug}`,
              }
            : null,
          hero_image: heroImage,
          tag_filters: tagFilters,
          has_posts: listPosts.length > 0,
          posts: listPosts.map((post) => ({
            id: post.id,
            title: post.title,
            summary: post.summary,
            published_date: formatDate(post.published_at),
            reading_time: post.reading_time_minutes,
            primary_tag: post.tag_names[0] ?? 'General',
            url: `/articles/${post.slug}`,
            image_url: post.hero_image_url ?? DEFAULT_CARD_IMAGE,
          })),
        };
        return htmlResponse(templates.home, view);
      }

      if (path === '/about' && method === 'GET') {
        return htmlResponse(templates.about, {});
      }

      const articleMatch = path.match(/^\/articles\/([^/]+)$/);
      if (articleMatch && method === 'GET') {
        const slug = articleMatch[1];
        const post = await getPostBySlug(env.DB, slug);
        if (!post) {
          return htmlResponse(templates.notFound, {}, 404);
        }
        const nowIso = new Date().toISOString();
        if (post.status !== 'published' || !post.published_at || post.published_at > nowIso) {
          return htmlResponse(templates.notFound, {}, 404);
        }
        const bodyHtml = marked.parse(post.body_markdown);
        const view = {
          page_title: post.seo_title || `${post.title} - bhart.org`,
          title: post.title,
          summary: post.summary,
          author_name: post.author_name,
          author_avatar: post.hero_image_url ?? DEFAULT_HERO_IMAGE,
          published_at: post.published_at,
          published_date: formatDate(post.published_at),
          reading_time: post.reading_time_minutes,
          hero_image_url: post.hero_image_url,
          hero_image_alt: post.hero_image_alt || post.title,
          body_html: bodyHtml,
          tags: post.tag_names.map((name) => ({ name })),
        };
        return htmlResponse(templates.article, view);
      }

      return htmlResponse(templates.notFound, {}, 404);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error.';
      return htmlResponse(templates.error, { message }, 500);
    }
  },
} satisfies ExportedHandler<Env>;
