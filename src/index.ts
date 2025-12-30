import { marked } from 'marked';
import { handleApiRoutes } from './routes/api';
import { handleAuthRoutes } from './routes/auth';
import { handleAdminRoutes } from './routes/admin';
import { handleMediaRoutes } from './routes/media';
import { handlePublicRoutes } from './routes/public';
import { htmlResponse } from './shared';
import { templates } from './templates/index';

marked.setOptions({
  mangle: false,
  headerIds: false,
});

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const method = request.method.toUpperCase();

      // Try each route handler in order
      // 1. API routes (/api/codex/v1/*)
      const apiResponse = await handleApiRoutes(request, env, url, method);
      if (apiResponse) {
        return apiResponse;
      }

      // 2. Auth routes (/admin/login, /admin/callback, /admin/logout)
      const authResponse = await handleAuthRoutes(request, env, url, method);
      if (authResponse) {
        return authResponse;
      }

      // 3. Media routes (/media/*)
      const mediaResponse = await handleMediaRoutes(request, env, url, method);
      if (mediaResponse) {
        return mediaResponse;
      }

      // 4. Admin routes (/admin/*)
      const adminResponse = await handleAdminRoutes(request, env, url, method);
      if (adminResponse) {
        return adminResponse;
      }

      // 5. Public routes (/, /about, /articles/*, etc.)
      const publicResponse = await handlePublicRoutes(request, env, url, method);
      if (publicResponse) {
        return publicResponse;
      }

      // 6. 404 Not Found
      return htmlResponse(templates.notFound, {}, 404);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error.';
      return htmlResponse(templates.error, { message }, 500);
    }
  },
} satisfies ExportedHandler<Env>;
