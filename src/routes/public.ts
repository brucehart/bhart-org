import { marked } from 'marked';
import {
  getPostBySlug,
  listPublishedPostMonths,
  listPublishedPosts,
  listPublishedPostsByDateRange,
  listTags,
} from '../db';
import { formatDate } from '../utils';
import { DEFAULT_CARD_IMAGE, DEFAULT_HERO_IMAGE, HEADSHOT_IMAGE, htmlResponse } from '../shared';
import { templates } from '../templates/index';

const escapeXml = (value: string) => {
  return value.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return char;
    }
  });
};

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
    const [posts, tags, recentPosts, monthCounts] = await Promise.all([
      listPublishedPosts(env.DB, nowIso, { limit: 9, tagSlug: tagFilter }),
      listTags(env.DB, nowIso),
      listPublishedPosts(env.DB, nowIso, { limit: SIDEBAR_RECENT_POSTS_LIMIT }),
      listPublishedPostMonths(env.DB, nowIso),
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

    const monthLabels = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthGroups: { year: string; months: { label: string; count: number; month: string }[] }[] = [];
    const monthGroupByYear = new Map<
      string,
      { year: string; months: { label: string; count: number; month: string }[] }
    >();

    for (const row of monthCounts) {
      const [year, month] = row.month.split('-');
      const monthIndex = Number.parseInt(month, 10) - 1;
      if (!year || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
        continue;
      }
      let group = monthGroupByYear.get(year);
      if (!group) {
        group = { year, months: [] };
        monthGroupByYear.set(year, group);
        monthGroups.push(group);
      }
      group.months.push({ label: monthLabels[monthIndex], count: row.post_count, month });
    }

    const currentYear = new Date().getFullYear().toString();
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
      has_posts_by_month: monthGroups.length > 0,
      posts_by_month_groups: monthGroups.map((group) => ({
        year: group.year,
        year_url: `/archive?year=${group.year}`,
        is_open: group.year === currentYear,
        months: group.months.map((month) => ({
          label: month.label,
          count: month.count,
          month_url: `/archive?year=${group.year}&month=${month.month}`,
        })),
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

  // GET /rss.xml
  if (path === '/rss.xml' && method === 'GET') {
    const nowIso = new Date().toISOString();
    const posts = await listPublishedPosts(env.DB, nowIso, { limit: 50 });
    const origin = new URL(request.url).origin;
    const feedUrl = `${origin}/rss.xml`;
    const items = posts
      .map((post) => {
        const link = `${origin}/articles/${post.slug}`;
        const title = escapeXml(post.title);
        const description = escapeXml(post.summary);
        const pubDate = post.published_at
          ? new Date(post.published_at).toUTCString()
          : new Date().toUTCString();
        return [
          '<item>',
          `<title>${title}</title>`,
          `<link>${link}</link>`,
          `<guid isPermaLink="true">${link}</guid>`,
          `<pubDate>${pubDate}</pubDate>`,
          `<description>${description}</description>`,
          '</item>',
        ].join('');
      })
      .join('');

    const rss = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
      '<channel>',
      '<title>bhart.org</title>',
      `<link>${origin}</link>`,
      '<description>AI, tech, and personal writing from Bruce Hart.</description>',
      `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`,
      `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
      '<language>en-us</language>',
      items,
      '</channel>',
      '</rss>',
    ].join('');

    return new Response(rss, {
      status: 200,
      headers: {
        'content-type': 'application/rss+xml; charset=utf-8',
      },
    });
  }

  // GET /about
  if (path === '/about' && method === 'GET') {
    return htmlResponse(templates.about, { nav_is_about: true });
  }

  // GET /projects
  if (path === '/projects' && method === 'GET') {
    return htmlResponse(templates.projects, { nav_is_projects: true });
  }

  // GET /archive
  if (path === '/archive' && method === 'GET') {
    const yearParam = url.searchParams.get('year');
    const monthParam = url.searchParams.get('month');
    if (!yearParam || !/^\d{4}$/.test(yearParam)) {
      return htmlResponse(templates.notFound, {}, 404);
    }
    const year = Number.parseInt(yearParam, 10);
    const month = monthParam ? Number.parseInt(monthParam, 10) : null;
    if (monthParam && (!Number.isInteger(month) || month < 1 || month > 12)) {
      return htmlResponse(templates.notFound, {}, 404);
    }
    const startDate = month
      ? new Date(Date.UTC(year, month - 1, 1))
      : new Date(Date.UTC(year, 0, 1));
    const endDate = month
      ? new Date(Date.UTC(year, month, 1))
      : new Date(Date.UTC(year + 1, 0, 1));
    const now = new Date();
    const endIso = endDate > now ? now.toISOString() : endDate.toISOString();
    const posts = await listPublishedPostsByDateRange(env.DB, startDate.toISOString(), endIso);
    const monthLabels = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const archiveTitle = month
      ? `${monthLabels[month - 1]} ${year}`
      : `${year}`;
    return htmlResponse(templates.archive, {
      nav_is_home: true,
      page_title: `bhart.org - ${archiveTitle} Archive`,
      archive_title: archiveTitle,
      has_posts: posts.length > 0,
      posts: posts.map((post) => ({
        title: post.title,
        published_date: formatDate(post.published_at),
        reading_time: post.reading_time_minutes,
        url: `/articles/${post.slug}`,
      })),
    });
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
