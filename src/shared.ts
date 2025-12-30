import Mustache from 'mustache';
import type { PostWithTags } from './types';
import { templates, partials } from './templates/index';
import { slugify, SESSION_COOKIE_NAME } from './utils';
import { getSessionUser } from './db';

// Constants
export const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1200&q=80';
export const DEFAULT_CARD_IMAGE =
  'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1200&q=80';
export const HEADSHOT_IMAGE = '/media/hedcut.png';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/your-handle';
export const GITHUB_URL = 'https://github.com/your-handle';
export const BASE_VIEW = {
  linkedin_url: LINKEDIN_URL,
  github_url: GITHUB_URL,
};
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
export const OAUTH_STATE_TTL_SECONDS = 60 * 10;

// Types
export type CodexTagPatch =
  | string[]
  | {
      set?: string[];
      add?: string[];
      remove?: string[];
    };

// Response helpers
export const jsonResponse = (payload: unknown, status = 200) => {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });
};

export const jsonError = (status: number, code: string, message: string, details?: unknown) => {
  return jsonResponse(
    {
      error: {
        code,
        message,
        ...(details === undefined ? {} : { details }),
      },
    },
    status,
  );
};

export const htmlResponse = (template: string, view: Record<string, unknown>, status = 200) => {
  return new Response(Mustache.render(template, { ...BASE_VIEW, ...view }, partials), {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
    },
  });
};

export const redirectResponse = (request: Request, path: string, headers?: Headers) => {
  const url = new URL(path, request.url);
  const responseHeaders = headers ?? new Headers();
  responseHeaders.set('Location', url.toString());
  return new Response(null, { status: 302, headers: responseHeaders });
};

// Validation helpers
export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

export const parseIsoTimestamp = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
};

export const normalizeOptionalString = (value: unknown) => {
  if (value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

export const normalizeRequiredString = (value: unknown) => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

export const normalizeTagList = (values: unknown[]) => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of values) {
    if (typeof raw !== 'string') {
      continue;
    }
    const trimmed = raw.trim();
    if (!trimmed) {
      continue;
    }
    const key = slugify(trimmed);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(trimmed);
  }
  return result;
};

export const parseTagPatch = (current: string[], patch: CodexTagPatch) => {
  if (Array.isArray(patch)) {
    return normalizeTagList(patch);
  }
  if (!isPlainObject(patch)) {
    return null;
  }

  const base = Array.isArray(patch.set) ? normalizeTagList(patch.set) : normalizeTagList(current);
  const withAdds = Array.isArray(patch.add)
    ? normalizeTagList([...base, ...patch.add])
    : base;

  if (!Array.isArray(patch.remove)) {
    return withAdds;
  }

  const removeKeys = new Set(
    patch.remove
      .filter((tag) => typeof tag === 'string')
      .map((tag) => slugify(tag.trim()))
      .filter(Boolean),
  );
  return withAdds.filter((tag) => !removeKeys.has(slugify(tag)));
};

export const readJsonBody = async (request: Request) => {
  try {
    return { ok: true, data: (await request.json()) as unknown };
  } catch {
    return {
      ok: false,
      response: jsonError(400, 'invalid_json', 'Request body must be valid JSON.'),
    };
  }
};

// Authentication helpers
export const requireCodexToken = (request: Request, env: Env) => {
  const expected = env.CODEX_API_TOKEN?.trim();
  if (!expected) {
    return jsonError(500, 'token_missing', 'CODEX_API_TOKEN is not configured.');
  }
  const authorization = request.headers.get('authorization') ?? '';
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return jsonError(401, 'unauthorized', 'Missing bearer token.');
  }
  const token = authorization.slice(7).trim();
  if (!token || token !== expected) {
    return jsonError(403, 'forbidden', 'Invalid token.');
  }
  return null;
};

export const logCodexAudit = (method: string, path: string, postId?: string | null) => {
  const id = postId ?? '-';
  console.log(
    `[codex-api] ${method} ${path} id=${id} actor=codex-token at=${new Date().toISOString()}`,
  );
};

export const serializePost = (post: PostWithTags) => {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    body_markdown: post.body_markdown,
    status: post.status,
    published_at: post.published_at,
    created_at: post.created_at,
    updated_at: post.updated_at,
    reading_time_minutes: post.reading_time_minutes,
    hero_image_url: post.hero_image_url,
    hero_image_alt: post.hero_image_alt,
    featured: post.featured === 1,
    author_name: post.author_name,
    author_email: post.author_email,
    seo_title: post.seo_title,
    seo_description: post.seo_description,
    tag_names: post.tag_names,
    tag_slugs: post.tag_slugs,
  };
};

// Cookie helpers
export const parseCookies = (request: Request) => {
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

export const getCookie = (request: Request, name: string) => {
  const cookies = parseCookies(request);
  return cookies[name];
};

export const buildCookieOptions = (request: Request, maxAge?: number) => {
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

export const buildSessionCookie = (request: Request, value: string, maxAge: number) => {
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}; ${buildCookieOptions(request, maxAge)}`;
};

export const clearSessionCookie = (request: Request) => {
  return `${SESSION_COOKIE_NAME}=; ${buildCookieOptions(request, 0)}`;
};

// Session helpers
export const requireAdminSession = async (request: Request, env: Env) => {
  const sessionId = getCookie(request, SESSION_COOKIE_NAME);
  if (!sessionId) {
    return null;
  }
  return getSessionUser(env.DB, sessionId);
};

export const safeReturnPath = (request: Request, value: string | null) => {
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

// OAuth helpers
export const getRedirectUri = (request: Request, env: Env) => {
  return env.GOOGLE_OAUTH_REDIRECT_URI ?? new URL('/admin/callback', request.url).toString();
};

// Media helpers
export const buildMediaUrl = (key: string) => {
  return `/media/${key}`;
};
