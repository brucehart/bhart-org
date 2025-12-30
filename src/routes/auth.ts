import {
  buildSessionCookie,
  clearSessionCookie,
  getCookie,
  getRedirectUri,
  htmlResponse,
  OAUTH_STATE_TTL_SECONDS,
  redirectResponse,
  requireAdminSession,
  SESSION_TTL_SECONDS,
} from '../shared';
import {
  consumeOauthState,
  createOauthState,
  createSession,
  deleteSession,
  getAuthorizedUserByEmail,
  updateAuthorizedUserLogin,
} from '../db';
import { SESSION_COOKIE_NAME } from '../utils';
import { templates } from '../templates/index';

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

/**
 * Handle authentication routes (/admin/login, /admin/callback, /admin/logout)
 * Returns Response if route matches, null otherwise
 */
export const handleAuthRoutes = async (
  request: Request,
  env: Env,
  url: URL,
  method: string,
): Promise<Response | null> => {
  const path = url.pathname;

  // GET /admin/login
  if (path === '/admin/login') {
    const session = await requireAdminSession(request, env);
    if (session) {
      return redirectResponse(request, '/admin');
    }
    return htmlResponse(templates.login, {});
  }

  // GET /admin/login/start
  if (path === '/admin/login/start') {
    const authUrl = await buildGoogleAuthUrl(request, env);
    return redirectResponse(request, authUrl);
  }

  // GET /admin/callback
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
      return htmlResponse(
        templates.error,
        { message: 'Unable to complete OAuth exchange.' },
        500,
      );
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
      return htmlResponse(
        templates.error,
        { message: 'Google account email not verified.' },
        403,
      );
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

  // POST /admin/logout
  if (path === '/admin/logout' && method === 'POST') {
    const sessionId = getCookie(request, SESSION_COOKIE_NAME);
    if (sessionId) {
      await deleteSession(env.DB, sessionId);
    }
    const headers = new Headers();
    headers.append('Set-Cookie', clearSessionCookie(request));
    return redirectResponse(request, '/', headers);
  }

  return null;
};
