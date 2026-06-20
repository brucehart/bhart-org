import { ARTICLE_AGENT_RUNNER } from '../articleAgentRunner';
import { requireAdminSession } from '../shared';
import { extensionForContentType, slugify } from '../utils';
import type { SessionUser } from '../types';

const DEFAULT_SPRITES_API_BASE = 'https://api.sprites.dev';
const DEFAULT_SPRITE_NAME = 'bhart-org';
const DEFAULT_SPRITE_WORKDIR = '/home/sprite/bhart-org/main';
const DEFAULT_CODEX_API_BASE = 'https://bhart.org/api/codex/v1';
const SPRITE_RUNNER_USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const MAX_PROMPT_LENGTH = 4000;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_REFERENCE_FILES = 5;
const MAX_REFERENCE_FILE_BYTES = 15 * 1024 * 1024;
const MAX_EVENT_MESSAGE_LENGTH = 8000;
const MAX_ERROR_LENGTH = 2000;
const MAX_TITLE_LENGTH = 200;
const MAX_SPRITE_ERROR_SNIPPET_BYTES = 500;

const JOB_ID_RE = /^[A-Za-z0-9_-]{16,80}$/;
const JOB_STATUS = new Set(['queued', 'starting', 'running', 'complete', 'failed', 'canceled']);
const TERMINAL_STATUS = new Set(['complete', 'failed', 'canceled']);

type ArticleAgentStatus = 'queued' | 'starting' | 'running' | 'complete' | 'failed' | 'canceled';

type ArticleAgentJobRow = {
  id: string;
  requested_by: string;
  prompt: string;
  status: ArticleAgentStatus;
  sprite_name: string;
  post_id: string | null;
  post_slug: string | null;
  title: string | null;
  error: string | null;
  callback_token_hash: string;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
};

type ArticleAgentRefRow = {
  id: number;
  job_id: string;
  r2_key: string;
  filename: string;
  content_type: string;
  created_at: string;
};

type ArticleAgentEventRow = {
  id: number;
  event_type: string;
  message: string;
  metadata: string | null;
  created_at: string;
};

type ArticleAgentMessageRow = {
  id: number;
  author_email: string;
  content: string;
  created_at: string;
};

const encoder = new TextEncoder();

const noStoreHeaders = (headers?: HeadersInit) => {
  const next = new Headers(headers);
  next.set('Cache-Control', 'no-store');
  next.set('Referrer-Policy', 'no-referrer');
  return next;
};

const articleAgentJson = (payload: unknown, init?: ResponseInit) => {
  const headers = noStoreHeaders(init?.headers);
  headers.set('content-type', 'application/json');
  return new Response(JSON.stringify(payload), { ...init, headers });
};

const articleAgentText = (payload: string, init?: ResponseInit) => {
  return new Response(payload, { ...init, headers: noStoreHeaders(init?.headers) });
};

const articleAgentError = (status: number, code: string, message: string) => {
  return articleAgentJson({ error: { code, message } }, { status });
};

export const parseArticleAgentAllowedEmails = (env: Env) => {
  return new Set(
    (env.BHART_ARTICLE_AGENT_ALLOWED_EMAILS ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
};

export const getArticleAgentAccess = (env: Env, user: SessionUser) => {
  const allowed = parseArticleAgentAllowedEmails(env);
  if (allowed.size === 0) {
    return { ok: false as const, status: 503, message: 'Article drafting is not configured.' };
  }
  if (!allowed.has(user.email.toLowerCase())) {
    return { ok: false as const, status: 403, message: 'You are not allowed to launch article drafts.' };
  }
  return { ok: true as const };
};

const requireArticleAgentAdmin = async (request: Request, env: Env) => {
  const sessionUser = await requireAdminSession(request, env);
  if (!sessionUser) {
    return {
      user: null,
      response: articleAgentError(401, 'unauthorized', 'Admin login required.'),
    };
  }
  const access = getArticleAgentAccess(env, sessionUser);
  if (!access.ok) {
    return {
      user: sessionUser,
      response: articleAgentError(access.status, 'forbidden', access.message),
    };
  }
  return { user: sessionUser, response: null };
};

const randomToken = (bytes = 32) => {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  let raw = '';
  for (const byte of data) {
    raw += String.fromCharCode(byte);
  }
  return btoa(raw).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const sha256Hex = async (value: string) => {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const timingSafeEqualString = (provided: string, expected: string) => {
  const expectedBytes = encoder.encode(expected);
  const providedBytes = encoder.encode(provided);
  if (expectedBytes.length === 0) {
    return false;
  }
  if (providedBytes.length !== expectedBytes.length) {
    const padded = new Uint8Array(expectedBytes.length);
    padded.set(providedBytes.slice(0, expectedBytes.length));
    crypto.subtle.timingSafeEqual(padded, expectedBytes);
    return false;
  }
  return crypto.subtle.timingSafeEqual(providedBytes, expectedBytes);
};

const bearerToken = (request: Request) => {
  const header = request.headers.get('authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
};

const spriteConfig = (env: Env) => {
  return {
    apiBase: (env.BHART_ARTICLE_AGENT_SPRITES_API_BASE || DEFAULT_SPRITES_API_BASE).replace(/\/+$/, ''),
    token: env.SPRITES_API_TOKEN || '',
    spriteName: env.BHART_ARTICLE_AGENT_SPRITE_NAME || DEFAULT_SPRITE_NAME,
    workdir: env.BHART_ARTICLE_AGENT_SPRITE_WORKDIR || DEFAULT_SPRITE_WORKDIR,
  };
};

const validateJobId = (jobId: string) => JOB_ID_RE.test(jobId);

const publicJob = (row: ArticleAgentJobRow) => ({
  id: row.id,
  requested_by: row.requested_by,
  prompt: row.prompt,
  status: row.status,
  sprite_name: row.sprite_name,
  post_id: row.post_id,
  post_slug: row.post_slug,
  title: row.title,
  error: row.error,
  article_url: row.post_slug ? `/articles/${row.post_slug}` : null,
  preview_url: row.post_id ? `/admin/preview/${row.post_id}` : null,
  edit_url: row.post_id ? `/admin/posts/${row.post_id}` : null,
  created_at: row.created_at,
  updated_at: row.updated_at,
  started_at: row.started_at,
  completed_at: row.completed_at,
});

const sanitizeEventType = (value: string) => {
  const safe = value.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
  return safe || 'log';
};

const appendArticleAgentEvent = async (
  env: Env,
  jobId: string,
  eventType: string,
  message: string,
  metadata?: unknown,
) => {
  const now = new Date().toISOString();
  const safeType = sanitizeEventType(eventType);
  const safeMessage = message.slice(0, MAX_EVENT_MESSAGE_LENGTH);
  const metadataJson = metadata === undefined ? null : JSON.stringify(metadata).slice(0, 12000);
  await env.DB.prepare(
    `INSERT INTO article_agent_events (job_id, event_type, message, metadata, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(jobId, safeType, safeMessage, metadataJson, now)
    .run();
};

const updateJobStatus = async (
  env: Env,
  jobId: string,
  status: ArticleAgentStatus,
  fields: {
    postId?: string | null;
    postSlug?: string | null;
    title?: string | null;
    error?: string | null;
  } = {},
) => {
  const now = new Date().toISOString();
  const setParts = ['status = ?', 'updated_at = ?'];
  const values: Array<string | null> = [status, now];

  if (status === 'running') {
    setParts.push('started_at = COALESCE(started_at, ?)');
    values.push(now);
  }
  if (TERMINAL_STATUS.has(status)) {
    setParts.push('completed_at = COALESCE(completed_at, ?)');
    values.push(now);
  }
  if (fields.postId !== undefined) {
    setParts.push('post_id = ?');
    values.push(fields.postId);
  }
  if (fields.postSlug !== undefined) {
    setParts.push('post_slug = ?');
    values.push(fields.postSlug);
  }
  if (fields.title !== undefined) {
    setParts.push('title = ?');
    values.push(fields.title ? fields.title.slice(0, MAX_TITLE_LENGTH) : null);
  }
  if (fields.error !== undefined) {
    setParts.push('error = ?');
    values.push(fields.error ? fields.error.slice(0, MAX_ERROR_LENGTH) : null);
  }

  values.push(jobId);
  const result = await env.DB.prepare(
    `UPDATE article_agent_jobs
     SET ${setParts.join(', ')}
     WHERE id = ? AND status NOT IN ('complete', 'failed', 'canceled')`,
  )
    .bind(...values)
    .run();
  return (result.meta.changes ?? 0) > 0;
};

const getAuthorizedJob = async (env: Env, user: SessionUser, jobId: string) => {
  if (!validateJobId(jobId)) {
    return articleAgentError(400, 'invalid_job_id', 'Invalid job id.');
  }
  const row = await env.DB.prepare('SELECT * FROM article_agent_jobs WHERE id = ?')
    .bind(jobId)
    .first<ArticleAgentJobRow>();
  if (!row) {
    return articleAgentError(404, 'not_found', 'Job not found.');
  }
  if (row.requested_by.toLowerCase() !== user.email.toLowerCase()) {
    return articleAgentError(403, 'forbidden', 'Job belongs to a different admin.');
  }
  return row;
};

const getJobForCallback = async (env: Env, request: Request, jobId: string) => {
  if (!validateJobId(jobId)) {
    return articleAgentText('Invalid job id', { status: 400 });
  }
  const token = bearerToken(request);
  if (!token) {
    return articleAgentText('Unauthorized', { status: 401 });
  }
  const row = await env.DB.prepare('SELECT * FROM article_agent_jobs WHERE id = ?')
    .bind(jobId)
    .first<ArticleAgentJobRow>();
  if (!row) {
    return articleAgentText('Not Found', { status: 404 });
  }
  const providedHash = await sha256Hex(token);
  if (!timingSafeEqualString(providedHash, row.callback_token_hash)) {
    return articleAgentText('Unauthorized', { status: 401 });
  }
  return row;
};

const readResponseSnippet = async (response: Response, maxBytes: number) => {
  if (!response.body) {
    return '';
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (total < maxBytes) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      if (!value) {
        continue;
      }
      const remaining = maxBytes - total;
      const chunk = value.byteLength > remaining ? value.slice(0, remaining) : value;
      chunks.push(chunk);
      total += chunk.byteLength;
      if (value.byteLength > remaining) {
        break;
      }
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  if (total === 0) {
    return '';
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes).trim();
};

const cleanUpstreamErrorSnippet = (value: string) => {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return '';
  }
  if (/<\s*(!doctype|html|head|body)\b/i.test(normalized)) {
    return '';
  }
  return normalized.slice(0, MAX_SPRITE_ERROR_SNIPPET_BYTES);
};

const spriteLaunchError = async (response: Response) => {
  const statusText = response.statusText ? ` ${response.statusText}` : '';
  const snippet = cleanUpstreamErrorSnippet(
    await readResponseSnippet(response, MAX_SPRITE_ERROR_SNIPPET_BYTES),
  );
  const message = `Sprite launch failed (${response.status}${statusText}).`;
  return snippet
    ? `${message} ${snippet}`
    : `${message} Check SPRITES_API_TOKEN, BHART_ARTICLE_AGENT_SPRITE_NAME, and Sprites access.`;
};

const quoteShell = (value: string) => `'${value.replace(/'/g, `'\\''`)}'`;

const spriteTaskName = (jobId: string) =>
  `article-agent-${jobId}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') ||
  'article-agent';

const launchSpriteJob = async (
  env: Env,
  baseUrl: string,
  jobId: string,
  callbackToken: string,
) => {
  const config = spriteConfig(env);
  if (!config.token) {
    throw new Error('SPRITES_API_TOKEN is not configured');
  }

  const updated = await updateJobStatus(env, jobId, 'starting');
  if (!updated) {
    return;
  }
  await appendArticleAgentEvent(env, jobId, 'status', `Starting Sprite ${config.spriteName}.`);

  const runnerPath = `/tmp/article-agent-${jobId}.py`;
  const envPath = `/tmp/article-agent-${jobId}.env`;
  const logPath = `/tmp/article-agent-${jobId}.log`;
  const jobUrl = `${baseUrl.replace(/\/+$/, '')}/api/article-agent/jobs/${encodeURIComponent(jobId)}`;
  const taskName = spriteTaskName(jobId);
  const runnerEnvLines = [
    `export BHART_ARTICLE_AGENT_JOB_ID=${quoteShell(jobId)}`,
    `export BHART_ARTICLE_AGENT_TOKEN=${quoteShell(callbackToken)}`,
    `export BHART_ARTICLE_AGENT_BASE_URL=${quoteShell(baseUrl.replace(/\/+$/, ''))}`,
    `export BHART_ARTICLE_AGENT_WORKDIR=${quoteShell(config.workdir)}`,
    `export BHART_ARTICLE_AGENT_TASK_NAME=${quoteShell(taskName)}`,
    `export BHART_CODEX_API_BASE=${quoteShell(DEFAULT_CODEX_API_BASE)}`,
    'export PYTHONUNBUFFERED=1',
  ];
  const writeEnvCommand = `umask 077 && printf '%s\\n' ${runnerEnvLines.map(quoteShell).join(' ')} > "$envfile"`;
  const holdTaskCommand =
    `curl -fsS --unix-socket /.sprite/api.sock -X PUT ` +
    `-H ${quoteShell('Content-Type: application/json')} ` +
    `${quoteShell(`http://sprite/v1/tasks/${taskName}`)} ` +
    `-d ${quoteShell(JSON.stringify({ expire: '5m' }))} >> "$logfile" 2>&1`;
  const runScript = [
    `. ${quoteShell(envPath)}`,
    `rm -f ${quoteShell(envPath)}`,
    `exec /home/sprite/scripts/.venv/bin/python ${quoteShell(runnerPath)}`,
  ].join(' && ');
  const shell = [
    `runner=${quoteShell(runnerPath)}`,
    `envfile=${quoteShell(envPath)}`,
    `logfile=${quoteShell(logPath)}`,
    ': > "$logfile"',
    `printf '%s\\n' ${quoteShell('launcher: downloading runner')} >> "$logfile"`,
    `curl -fsS -A ${quoteShell(SPRITE_RUNNER_USER_AGENT)} -H ${quoteShell(
      `Authorization: Bearer ${callbackToken}`,
    )} ${quoteShell(`${jobUrl}/runner.py`)} -o "$runner" >> "$logfile" 2>&1`,
    'chmod 700 "$runner"',
    writeEnvCommand,
    `printf '%s\\n' ${quoteShell('launcher: acquiring sprite task hold')} >> "$logfile"`,
    holdTaskCommand,
    `printf '%s\\n' ${quoteShell('launcher: starting runner')} >> "$logfile"`,
    `( setsid nohup bash -lc ${quoteShell(runScript)} < /dev/null >> "$logfile" 2>&1 & )`,
    `printf '%s\\n' ${quoteShell('launcher: runner launch returned')} >> "$logfile"`,
  ].join(' && ');

  const url = new URL(`${config.apiBase}/v1/sprites/${encodeURIComponent(config.spriteName)}/exec`);
  url.searchParams.append('cmd', 'bash');
  url.searchParams.append('cmd', '-lc');
  url.searchParams.append('cmd', shell);
  url.searchParams.set('dir', config.workdir);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'User-Agent': SPRITE_RUNNER_USER_AGENT,
    },
  });
  if (!response.ok) {
    throw new Error(await spriteLaunchError(response));
  }
  await appendArticleAgentEvent(env, jobId, 'status', 'Sprite runner launch command accepted.');
};

const cancelSpriteJob = async (env: Env, jobId: string) => {
  const config = spriteConfig(env);
  if (!config.token) {
    return;
  }
  const taskName = spriteTaskName(jobId);
  const url = new URL(`${config.apiBase}/v1/sprites/${encodeURIComponent(config.spriteName)}/exec`);
  url.searchParams.append('cmd', 'bash');
  url.searchParams.append('cmd', '-lc');
  url.searchParams.append(
    'cmd',
    [
      `pkill -TERM -f ${quoteShell(`article-agent-${jobId}.py`)} || true`,
      `curl -fsS --unix-socket /.sprite/api.sock -X DELETE ${quoteShell(
        `http://sprite/v1/tasks/${taskName}`,
      )} >/dev/null 2>&1 || true`,
    ].join('; '),
  );
  url.searchParams.set('dir', config.workdir);
  await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'User-Agent': SPRITE_RUNNER_USER_AGENT,
    },
  });
};

const formFiles = (data: FormData) => {
  const files: File[] = [];
  for (const name of ['refs', 'references', 'reference_files', 'ref_files']) {
    for (const value of data.getAll(name)) {
      if (value instanceof File && value.size > 0) {
        files.push(value);
      }
    }
  }
  return files;
};

const referenceFilename = (file: File, index: number) => {
  const rawName = file.name || `reference-${index}`;
  const lastSegment = rawName.split('/').pop() ?? rawName;
  const rawExt = lastSegment.match(/(\.[A-Za-z0-9]+)$/)?.[1]?.toLowerCase() ?? '';
  const rawBase = rawExt ? lastSegment.slice(0, -rawExt.length) : lastSegment;
  const base = slugify(rawBase) || `reference-${index}`;
  const normalizedExt = rawExt || extensionForContentType(file.type) || '';
  return `${base}${normalizedExt}`;
};

const uploadReferenceFiles = async (env: Env, jobId: string, files: File[]) => {
  let index = 0;
  for (const file of files) {
    index += 1;
    const contentType = file.type || 'application/octet-stream';
    const filename = referenceFilename(file, index);
    const key = `article-agent/${jobId}/${index}-${crypto.randomUUID()}-${filename}`;
    await env.MEDIA_BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType },
    });
    await env.DB.prepare(
      `INSERT INTO article_agent_refs (job_id, r2_key, filename, content_type, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
      .bind(jobId, key, filename, contentType, new Date().toISOString())
      .run();
  }
};

const createArticleAgentJob = async (
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  user: SessionUser,
) => {
  if (!request.headers.get('content-type')?.includes('multipart/form-data')) {
    return articleAgentError(400, 'invalid_request', 'Expected multipart/form-data.');
  }
  const config = spriteConfig(env);
  if (!config.token) {
    return articleAgentError(503, 'disabled', 'SPRITES_API_TOKEN is not configured.');
  }

  const data = await request.formData();
  const promptValue = data.get('prompt');
  const prompt = typeof promptValue === 'string' ? promptValue.trim() : '';
  if (!prompt) {
    return articleAgentError(400, 'invalid_request', 'Prompt is required.');
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return articleAgentError(400, 'invalid_request', 'Prompt is too long.');
  }

  const files = formFiles(data);
  if (files.length > MAX_REFERENCE_FILES) {
    return articleAgentError(400, 'invalid_request', 'Too many reference files.');
  }
  for (const file of files) {
    if (file.size > MAX_REFERENCE_FILE_BYTES) {
      return articleAgentError(413, 'payload_too_large', 'Reference file is too large.');
    }
  }

  const jobId = randomToken(18);
  const callbackToken = randomToken(32);
  const callbackTokenHash = await sha256Hex(callbackToken);
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO article_agent_jobs (
      id, requested_by, prompt, status, sprite_name, callback_token_hash, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(jobId, user.email, prompt, 'queued', config.spriteName, callbackTokenHash, now, now)
    .run();

  await uploadReferenceFiles(env, jobId, files);
  await appendArticleAgentEvent(env, jobId, 'status', 'Article draft job queued.');
  const baseUrl = new URL(request.url).origin;
  ctx.waitUntil(
    launchSpriteJob(env, baseUrl, jobId, callbackToken).catch(async (error) => {
      const message = error instanceof Error ? error.message : 'Sprite launch failed.';
      const updated = await updateJobStatus(env, jobId, 'failed', { error: message });
      if (updated) {
        await appendArticleAgentEvent(env, jobId, 'failed', message);
      }
    }),
  );

  const row = await env.DB.prepare('SELECT * FROM article_agent_jobs WHERE id = ?')
    .bind(jobId)
    .first<ArticleAgentJobRow>();
  return articleAgentJson({ job: row ? publicJob(row) : { id: jobId, status: 'queued' } }, { status: 202 });
};

const listArticleAgentJobs = async (env: Env, user: SessionUser) => {
  const { results } = await env.DB.prepare(
    `SELECT * FROM article_agent_jobs
     WHERE LOWER(requested_by) = LOWER(?)
     ORDER BY created_at DESC
     LIMIT 20`,
  )
    .bind(user.email)
    .all<ArticleAgentJobRow>();
  return articleAgentJson({ jobs: results.map(publicJob) });
};

const getArticleAgentJob = async (env: Env, user: SessionUser, jobId: string) => {
  const row = await getAuthorizedJob(env, user, jobId);
  if (row instanceof Response) {
    return row;
  }
  return articleAgentJson({ job: publicJob(row) });
};

const getArticleAgentEvents = async (
  request: Request,
  env: Env,
  user: SessionUser,
  jobId: string,
  url: URL,
) => {
  const row = await getAuthorizedJob(env, user, jobId);
  if (row instanceof Response) {
    return row;
  }
  const lastHeader = request.headers.get('Last-Event-ID');
  const after = Number(url.searchParams.get('after') || lastHeader || '0');
  const safeAfter = Number.isFinite(after) && after > 0 ? Math.floor(after) : 0;
  const { results } = await env.DB.prepare(
    `SELECT id, event_type, message, metadata, created_at
     FROM article_agent_events
     WHERE job_id = ? AND id > ?
     ORDER BY id ASC
     LIMIT 100`,
  )
    .bind(jobId, safeAfter)
    .all<ArticleAgentEventRow>();

  const chunks = ['retry: 2000\n'];
  if (results.length === 0) {
    chunks.push(': heartbeat\n\n');
  }
  for (const event of results) {
    let metadata: unknown = null;
    if (event.metadata) {
      try {
        metadata = JSON.parse(event.metadata);
      } catch {
        metadata = null;
      }
    }
    chunks.push(`id: ${event.id}\n`);
    chunks.push(`event: ${event.event_type}\n`);
    chunks.push(
      `data: ${JSON.stringify({
        message: event.message,
        metadata,
        created_at: event.created_at,
      })}\n\n`,
    );
  }
  return articleAgentText(chunks.join(''), {
    headers: {
      'Content-Type': 'text/event-stream',
      'X-Accel-Buffering': 'no',
    },
  });
};

const createArticleAgentMessage = async (
  request: Request,
  env: Env,
  user: SessionUser,
  jobId: string,
) => {
  const row = await getAuthorizedJob(env, user, jobId);
  if (row instanceof Response) {
    return row;
  }
  if (TERMINAL_STATUS.has(row.status)) {
    return articleAgentError(409, 'job_inactive', 'Job is not active.');
  }
  const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const content = typeof payload?.content === 'string' ? payload.content.trim() : '';
  if (!content) {
    return articleAgentError(400, 'invalid_request', 'Feedback is required.');
  }
  if (content.length > MAX_MESSAGE_LENGTH) {
    return articleAgentError(400, 'invalid_request', 'Feedback is too long.');
  }
  const result = await env.DB.prepare(
    `INSERT INTO article_agent_messages (job_id, author_email, content, created_at)
     VALUES (?, ?, ?, ?)`,
  )
    .bind(jobId, user.email, content, new Date().toISOString())
    .run();
  await appendArticleAgentEvent(env, jobId, 'feedback', 'Feedback queued for Codex.');
  return articleAgentJson({ id: result.meta.last_row_id });
};

const cancelArticleAgentJob = async (
  env: Env,
  ctx: ExecutionContext,
  user: SessionUser,
  jobId: string,
) => {
  const row = await getAuthorizedJob(env, user, jobId);
  if (row instanceof Response) {
    return row;
  }
  if (!TERMINAL_STATUS.has(row.status)) {
    const updated = await updateJobStatus(env, jobId, 'canceled');
    if (updated) {
      await appendArticleAgentEvent(env, jobId, 'canceled', 'Job canceled from the admin page.');
      ctx.waitUntil(cancelSpriteJob(env, jobId).catch(() => undefined));
    }
  }
  return articleAgentJson({ ok: true });
};

const getRunnerScript = async (request: Request, env: Env, jobId: string) => {
  const row = await getJobForCallback(env, request, jobId);
  if (row instanceof Response) {
    return row;
  }
  return articleAgentText(ARTICLE_AGENT_RUNNER, {
    headers: { 'Content-Type': 'text/x-python; charset=utf-8' },
  });
};

const getRunnerBootstrap = async (request: Request, env: Env, jobId: string) => {
  const row = await getJobForCallback(env, request, jobId);
  if (row instanceof Response) {
    return row;
  }
  const { results } = await env.DB.prepare(
    `SELECT id, filename, content_type
     FROM article_agent_refs
     WHERE job_id = ?
     ORDER BY id ASC`,
  )
    .bind(jobId)
    .all<{ id: number; filename: string; content_type: string }>();
  return articleAgentJson({
    id: row.id,
    prompt: row.prompt,
    status: row.status,
    refs: results.map((ref) => ({
      id: ref.id,
      filename: ref.filename,
      content_type: ref.content_type,
      url: `/api/article-agent/jobs/${encodeURIComponent(jobId)}/refs/${ref.id}`,
    })),
  });
};

const getRunnerReference = async (
  request: Request,
  env: Env,
  jobId: string,
  refId: number,
) => {
  const row = await getJobForCallback(env, request, jobId);
  if (row instanceof Response) {
    return row;
  }
  const ref = await env.DB.prepare(
    `SELECT id, job_id, r2_key, filename, content_type, created_at
     FROM article_agent_refs
     WHERE job_id = ? AND id = ?`,
  )
    .bind(jobId, refId)
    .first<ArticleAgentRefRow>();
  if (!ref) {
    return articleAgentText('Not Found', { status: 404 });
  }
  const object = await env.MEDIA_BUCKET.get(ref.r2_key);
  if (!object) {
    return articleAgentText('Not Found', { status: 404 });
  }
  const headers = noStoreHeaders();
  object.writeHttpMetadata(headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Content-Disposition', `attachment; filename="${ref.filename.replace(/["\r\n]/g, '')}"`);
  return new Response(object.body, { headers });
};

const getRunnerMessages = async (request: Request, env: Env, jobId: string, url: URL) => {
  const row = await getJobForCallback(env, request, jobId);
  if (row instanceof Response) {
    return row;
  }
  const after = Number(url.searchParams.get('after') || '0');
  const safeAfter = Number.isFinite(after) && after > 0 ? Math.floor(after) : 0;
  const { results } = await env.DB.prepare(
    `SELECT id, author_email, content, created_at
     FROM article_agent_messages
     WHERE job_id = ? AND id > ?
     ORDER BY id ASC
     LIMIT 25`,
  )
    .bind(jobId, safeAfter)
    .all<ArticleAgentMessageRow>();
  return articleAgentJson({ messages: results });
};

const createRunnerEvent = async (request: Request, env: Env, jobId: string) => {
  const row = await getJobForCallback(env, request, jobId);
  if (row instanceof Response) {
    return row;
  }
  const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const eventType = typeof payload?.type === 'string' ? payload.type : 'log';
  const message = typeof payload?.message === 'string' ? payload.message : '';
  const metadata = payload?.metadata;
  if (!message) {
    return articleAgentText('Missing message', { status: 400 });
  }
  await appendArticleAgentEvent(env, jobId, eventType, message, metadata);
  return articleAgentJson({ ok: true });
};

const updateRunnerJob = async (request: Request, env: Env, jobId: string) => {
  const row = await getJobForCallback(env, request, jobId);
  if (row instanceof Response) {
    return row;
  }
  const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const status = typeof payload?.status === 'string' ? payload.status : '';
  if (!JOB_STATUS.has(status)) {
    return articleAgentText('Invalid status', { status: 400 });
  }
  if (TERMINAL_STATUS.has(row.status)) {
    return articleAgentJson({ ok: true, ignored: true, status: row.status });
  }

  const postId = typeof payload?.post_id === 'string' ? payload.post_id : undefined;
  const postSlug = typeof payload?.post_slug === 'string' ? payload.post_slug : undefined;
  const title = typeof payload?.title === 'string' ? payload.title : undefined;
  const error = typeof payload?.error === 'string' ? payload.error : undefined;
  await updateJobStatus(env, jobId, status as ArticleAgentStatus, {
    postId,
    postSlug,
    title,
    error,
  });
  await appendArticleAgentEvent(env, jobId, status, `Job status changed to ${status}.`, {
    post_id: postId,
    post_slug: postSlug,
    title,
  });
  return articleAgentJson({ ok: true });
};

export const handleArticleAgentRoutes = async (
  request: Request,
  env: Env,
  url: URL,
  method: string,
  ctx: ExecutionContext,
): Promise<Response | null> => {
  const path = url.pathname;

  if (path.startsWith('/admin/article-agent')) {
    const auth = await requireArticleAgentAdmin(request, env);
    if (auth.response) {
      return auth.response;
    }
    const user = auth.user;
    if (!user) {
      return articleAgentError(401, 'unauthorized', 'Admin login required.');
    }

    if (path === '/admin/article-agent/jobs' && method === 'GET') {
      return listArticleAgentJobs(env, user);
    }
    if (path === '/admin/article-agent/jobs' && method === 'POST') {
      return createArticleAgentJob(request, env, ctx, user);
    }

    const jobMatch = path.match(/^\/admin\/article-agent\/jobs\/([^/]+)$/);
    if (jobMatch && method === 'GET') {
      return getArticleAgentJob(env, user, jobMatch[1]);
    }

    const eventsMatch = path.match(/^\/admin\/article-agent\/jobs\/([^/]+)\/events$/);
    if (eventsMatch && method === 'GET') {
      return getArticleAgentEvents(request, env, user, eventsMatch[1], url);
    }

    const messagesMatch = path.match(/^\/admin\/article-agent\/jobs\/([^/]+)\/messages$/);
    if (messagesMatch && method === 'POST') {
      return createArticleAgentMessage(request, env, user, messagesMatch[1]);
    }

    const cancelMatch = path.match(/^\/admin\/article-agent\/jobs\/([^/]+)\/cancel$/);
    if (cancelMatch && method === 'POST') {
      return cancelArticleAgentJob(env, ctx, user, cancelMatch[1]);
    }

    return articleAgentError(404, 'not_found', 'Article agent route not found.');
  }

  if (path.startsWith('/api/article-agent')) {
    const runnerMatch = path.match(/^\/api\/article-agent\/jobs\/([^/]+)\/runner\.py$/);
    if (runnerMatch && method === 'GET') {
      return getRunnerScript(request, env, runnerMatch[1]);
    }

    const bootstrapMatch = path.match(/^\/api\/article-agent\/jobs\/([^/]+)\/bootstrap$/);
    if (bootstrapMatch && method === 'GET') {
      return getRunnerBootstrap(request, env, bootstrapMatch[1]);
    }

    const refsMatch = path.match(/^\/api\/article-agent\/jobs\/([^/]+)\/refs\/(\d+)$/);
    if (refsMatch && method === 'GET') {
      return getRunnerReference(request, env, refsMatch[1], Number(refsMatch[2]));
    }

    const messagesMatch = path.match(/^\/api\/article-agent\/jobs\/([^/]+)\/messages$/);
    if (messagesMatch && method === 'GET') {
      return getRunnerMessages(request, env, messagesMatch[1], url);
    }

    const eventsMatch = path.match(/^\/api\/article-agent\/jobs\/([^/]+)\/events$/);
    if (eventsMatch && method === 'POST') {
      return createRunnerEvent(request, env, eventsMatch[1]);
    }

    const jobMatch = path.match(/^\/api\/article-agent\/jobs\/([^/]+)$/);
    if (jobMatch && method === 'PATCH') {
      return updateRunnerJob(request, env, jobMatch[1]);
    }

    return articleAgentText('Not Found', { status: 404 });
  }

  return null;
};
