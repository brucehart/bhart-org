import { htmlResponse } from '../shared';
import { templates } from '../templates/index';

/**
 * Handle media serving routes (/media/*)
 * Returns Response if route matches, null otherwise
 */
export const handleMediaRoutes = async (
  request: Request,
  env: Env,
  url: URL,
  method: string,
): Promise<Response | null> => {
  const path = url.pathname;

  if (!path.startsWith('/media/')) {
    return null;
  }

  if (method !== 'GET' && method !== 'HEAD') {
    return null;
  }

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
};
