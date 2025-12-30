import { marked } from 'marked';
import { getPostBySlug, listPublishedPosts, listTags } from '../db';
import { formatDate } from '../utils';
import { DEFAULT_CARD_IMAGE, DEFAULT_HERO_IMAGE, HEADSHOT_IMAGE, htmlResponse } from '../shared';
import { templates } from '../templates/index';

/**
 * Handle public blog routes (/, /about, /articles/*, etc.)
 * Returns Response if route matches, null otherwise
 */
export const handlePublicRoutes = async (
  request: Request,
  env: Env,
  url: URL,
  method: string,
): Promise<Response | null> => {
  const path = url.pathname;

  // GET /
  if (path === '/' && method === 'GET') {
    const tagFilter = url.searchParams.get('tag') ?? undefined;
    const nowIso = new Date().toISOString();
    const SIDEBAR_RECENT_POSTS_LIMIT = 5;
    const [posts, tags, recentPosts] = await Promise.all([
      listPublishedPosts(env.DB, nowIso, { limit: 9, tagSlug: tagFilter }),
      listTags(env.DB, nowIso),
      listPublishedPosts(env.DB, nowIso, { limit: SIDEBAR_RECENT_POSTS_LIMIT }),
    ]);

    const latestPost = posts[0];
    const remainingPosts = posts.filter((post) => post.id !== latestPost?.id);
    const listPosts = remainingPosts;
    const heroImage = latestPost?.hero_image_url ?? DEFAULT_HERO_IMAGE;
    const latestExcerptMarkdown = latestPost
      ? latestPost.body_markdown
          .split(/\n{2,}/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
          .slice(0, 2)
          .join('\n\n')
      : '';
    const latestExcerptHtml = latestPost
      ? marked.parse(latestExcerptMarkdown || latestPost.summary)
      : '';

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
      nav_is_home: true,
      hero: latestPost
        ? {
            title: latestPost.title,
            url: `/articles/${latestPost.slug}`,
          }
        : null,
      hero_image: heroImage,
      has_latest_post: Boolean(latestPost),
      latest_post: latestPost
        ? {
            title: latestPost.title,
            summary: latestPost.summary,
            published_date: formatDate(latestPost.published_at),
            reading_time: latestPost.reading_time_minutes,
            primary_tag: latestPost.tag_names[0] ?? 'General',
            url: `/articles/${latestPost.slug}`,
            image_url: latestPost.hero_image_url ?? DEFAULT_CARD_IMAGE,
            excerpt_html: latestExcerptHtml,
          }
        : null,
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
      sidebar_tags: tags.map((tag) => ({
        name: tag.name,
        slug: tag.slug,
        post_count: tag.post_count ?? 0,
      })),
      author_avatar_url: HEADSHOT_IMAGE,
      has_recent_posts: recentPosts.length > 0,
      recent_posts: recentPosts.map((post) => ({
        title: post.title,
        url: `/articles/${post.slug}`,
        published_date: formatDate(post.published_at),
        reading_time: post.reading_time_minutes,
      })),
    };
    return htmlResponse(templates.home, view);
  }

  // GET /about
  if (path === '/about' && method === 'GET') {
    return htmlResponse(templates.about, { nav_is_about: true });
  }

  // GET /projects
  if (path === '/projects' && method === 'GET') {
    return htmlResponse(templates.projects, { nav_is_projects: true });
  }

  // GET /news
  if (path === '/news' && method === 'GET') {
    return htmlResponse(templates.news, { nav_is_news: true });
  }

  // GET /work-with-me
  if (path === '/work-with-me' && method === 'GET') {
    return htmlResponse(templates.workWithMe, { nav_is_work: true });
  }

  // GET /contact
  if (path === '/contact' && method === 'GET') {
    return htmlResponse(templates.contact, { nav_is_contact: true });
  }

  // GET /articles/:slug
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
      seo_description: post.seo_description || post.summary,
      title: post.title,
      summary: post.summary,
      author_name: post.author_name,
      author_avatar: HEADSHOT_IMAGE,
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

  return null;
};
