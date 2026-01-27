import { marked } from 'marked';
import { EmailMessage } from 'cloudflare:email';
import {
  getPostBySlug,
  listPublishedPostMonths,
  listPublishedPosts,
  listPublishedPostsByDateRange,
  listPublishedNewsItems,
  listTags,
  searchPublishedPosts,
} from '../db';
import { createEasternDate, formatDate, formatRssDate, getEasternYear } from '../utils';
import {
  DEFAULT_HERO_IMAGE,
  HEADSHOT_IMAGE,
  htmlResponse,
  normalizeRequiredString,
  resolveHeroImageUrl,
  redirectResponse,
} from '../shared';
import { templates } from '../templates/index';
import { checkRateLimit, getRateLimitClientId } from '../middleware/rateLimit';

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

const formatSitemapDate = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const cleanHeaderValue = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();

const CONTACT_RATE_LIMIT_CONFIG = {
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 5,
};

const CONTACT_MIN_FILL_MS = 3000;
const CONTACT_MESSAGE_LIMIT = 5000;

const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  '10minutemail.net',
  'dispostable.com',
  'guerrillamail.com',
  'mailinator.com',
  'mailnesia.com',
  'mohmal.com',
  'tempmail.com',
  'throwawaymail.com',
  'yopmail.com',
]);

const getEmailDomain = (value: string) => {
  const parts = value.toLowerCase().split('@');
  return parts.length === 2 ? parts[1] : '';
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
  const showEmailSubscribe = env.SHOW_EMAIL_SUBSCRIBE?.trim().toLowerCase() !== 'no';

  // GET /
  if (path === '/' && method === 'GET') {
    const tagFilter = url.searchParams.get('tag') ?? undefined;
    const nowIso = new Date().toISOString();
    const SIDEBAR_RECENT_POSTS_LIMIT = 5;
    const SIDEBAR_RECENT_NEWS_LIMIT = 3;
    const [posts, tags, recentPosts, monthCounts, recentNews] = await Promise.all([
      listPublishedPosts(env.DB, nowIso, { limit: 9, tagSlug: tagFilter }),
      listTags(env.DB, nowIso),
      listPublishedPosts(env.DB, nowIso, { limit: SIDEBAR_RECENT_POSTS_LIMIT }),
      listPublishedPostMonths(env.DB, nowIso),
      listPublishedNewsItems(env.DB, nowIso, SIDEBAR_RECENT_NEWS_LIMIT),
    ]);

    const latestPost = posts[0];
    const remainingPosts = posts.filter((post) => post.id !== latestPost?.id);
    const listPosts = remainingPosts;
    const heroImage =
      resolveHeroImageUrl(latestPost?.hero_image_url ?? null) ?? DEFAULT_HERO_IMAGE;
    const latestPostImage = latestPost?.hero_image_url
      ? resolveHeroImageUrl(latestPost.hero_image_url)
      : null;
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

    const currentYear = getEasternYear();
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
            image_url: latestPostImage,
            image_alt: latestPostImage ? latestPost.hero_image_alt || latestPost.title : null,
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
        image_url: post.hero_image_url ? resolveHeroImageUrl(post.hero_image_url) : null,
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
      has_recent_news: recentNews.length > 0,
      recent_news: recentNews.map((item) => ({
        title: item.title,
        category: item.category,
        published_date: formatDate(item.published_at),
      })),
      show_email_subscribe: showEmailSubscribe,
    };
    return htmlResponse(templates.home, view);
  }

  // GET /robots.txt
  if (path === '/robots.txt' && (method === 'GET' || method === 'HEAD')) {
    const origin = new URL(request.url).origin;
    const robots = [
      'User-agent: *',
      'Disallow:',
      `Sitemap: ${origin}/sitemap.xml`,
      '',
    ].join('\n');
    return new Response(method === 'HEAD' ? null : robots, {
      status: 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
      },
    });
  }

  // GET /sitemap.xml
  if (path === '/sitemap.xml' && (method === 'GET' || method === 'HEAD')) {
    const nowIso = new Date().toISOString();
    const origin = new URL(request.url).origin;
    const posts = await listPublishedPosts(env.DB, nowIso, { limit: 1000 });

    const staticUrls = [
      `${origin}/`,
      `${origin}/about`,
      `${origin}/projects`,
      `${origin}/news`,
      `${origin}/work-with-me`,
      `${origin}/contact`,
      `${origin}/rss.xml`,
    ];

    const staticEntries = staticUrls.map((loc) => {
      return `<url><loc>${escapeXml(loc)}</loc></url>`;
    });

    const postEntries = posts.map((post) => {
      const loc = `${origin}/articles/${post.slug}`;
      const lastmod = formatSitemapDate(post.updated_at ?? post.published_at);
      const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
      return `<url><loc>${escapeXml(loc)}</loc>${lastmodTag}</url>`;
    });

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...staticEntries,
      ...postEntries,
      '</urlset>',
    ].join('');

    return new Response(method === 'HEAD' ? null : xml, {
      status: 200,
      headers: {
        'content-type': 'application/xml; charset=utf-8',
      },
    });
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
        const pubDate = formatRssDate(post.published_at);
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
      `<lastBuildDate>${formatRssDate()}</lastBuildDate>`,
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
    return htmlResponse(templates.about, {
      nav_is_about: true,
      show_email_subscribe: showEmailSubscribe,
    });
  }

  // GET /projects
  if (path === '/projects' && method === 'GET') {
    return htmlResponse(templates.projects, {
      nav_is_projects: true,
      show_email_subscribe: showEmailSubscribe,
    });
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
      ? createEasternDate(year, month, 1)
      : createEasternDate(year, 1, 1);
    const endDate = month
      ? createEasternDate(year, month + 1, 1)
      : createEasternDate(year + 1, 1, 1);
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
      show_email_subscribe: showEmailSubscribe,
    });
  }

  // GET /search
  if (path === '/search' && method === 'GET') {
    const query = url.searchParams.get('q')?.trim() ?? '';
    const nowIso = new Date().toISOString();
    const results = query ? await searchPublishedPosts(env.DB, nowIso, query) : [];
    const resultLabel = results.length === 1 ? 'result' : 'results';
    return htmlResponse(templates.search, {
      nav_is_home: true,
      page_title: query ? `Search: ${query} - bhart.org` : 'Search - bhart.org',
      search_query: query,
      has_query: Boolean(query),
      result_count: results.length,
      result_label: resultLabel,
      has_results: results.length > 0,
      results: results.map((post) => ({
        title: post.title,
        published_date: formatDate(post.published_at),
        reading_time: post.reading_time_minutes,
        url: `/articles/${post.slug}`,
      })),
      show_email_subscribe: showEmailSubscribe,
    });
  }

  // GET /news
  if (path === '/news' && method === 'GET') {
    const nowIso = new Date().toISOString();
    const newsItems = await listPublishedNewsItems(env.DB, nowIso);
    return htmlResponse(templates.news, {
      nav_is_news: true,
      show_email_subscribe: showEmailSubscribe,
      has_news_items: newsItems.length > 0,
      news_items: newsItems.map((item) => ({
        category: item.category,
        title: item.title,
        body_html: marked.parse(item.body_markdown),
        published_date: formatDate(item.published_at),
      })),
    });
  }

  // GET /work-with-me
  if (path === '/work-with-me' && method === 'GET') {
    return htmlResponse(templates.workWithMe, {
      nav_is_work: true,
      show_email_subscribe: showEmailSubscribe,
    });
  }

  // GET /contact
  if (path === '/contact' && method === 'GET') {
    const contactSent = url.searchParams.get('sent') === '1';
    const contactNoticeSuccess = contactSent;
    const contactNoticeMessage = contactSent ? 'Thanks for the note — I’ll get back to you soon.' : '';
    return htmlResponse(templates.contact, {
      nav_is_contact: true,
      show_email_subscribe: showEmailSubscribe,
      contact_notice_success: contactNoticeSuccess,
      contact_notice_message: contactNoticeSuccess ? contactNoticeMessage : '',
      contact_started_at: Date.now().toString(),
    });
  }

  // POST /contact
  if (path === '/contact' && method === 'POST') {
    const rateLimitError = await checkRateLimit(
      request,
      env,
      CONTACT_RATE_LIMIT_CONFIG,
      getRateLimitClientId(request, true),
    );
    if (rateLimitError) {
      return htmlResponse(
        templates.contact,
        {
          nav_is_contact: true,
          show_email_subscribe: showEmailSubscribe,
          contact_notice_error: true,
          contact_notice_message: 'Too many requests. Please wait a bit and try again.',
          contact_started_at: Date.now().toString(),
        },
        429,
      );
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return htmlResponse(
        templates.contact,
        {
          nav_is_contact: true,
          show_email_subscribe: showEmailSubscribe,
          contact_notice_error: true,
          contact_notice_message: 'Please submit the form again.',
          contact_started_at: Date.now().toString(),
        },
        400,
      );
    }

    const fromRaw = normalizeRequiredString(form.get('from'));
    const subjectRaw = normalizeRequiredString(form.get('subject'));
    const messageRaw = normalizeRequiredString(form.get('message'));
    const contactView = {
      nav_is_contact: true,
      show_email_subscribe: showEmailSubscribe,
      contact_from: typeof fromRaw === 'string' ? fromRaw : '',
      contact_subject: typeof subjectRaw === 'string' ? subjectRaw : '',
      contact_message: typeof messageRaw === 'string' ? messageRaw : '',
      contact_started_at: Date.now().toString(),
    };

    const honeypotValue = normalizeRequiredString(form.get('company'));
    if (honeypotValue) {
      return redirectResponse(request, '/contact?sent=1');
    }

    const startedAtRaw = normalizeRequiredString(form.get('form_started_at'));
    const startedAt = startedAtRaw ? Number.parseInt(startedAtRaw, 10) : Number.NaN;
    if (!startedAt || Number.isNaN(startedAt)) {
      return htmlResponse(
        templates.contact,
        {
          ...contactView,
          contact_notice_error: true,
          contact_notice_message: 'Please refresh the page and try again.',
        },
        400,
      );
    }
    const elapsedMs = Date.now() - startedAt;
    if (elapsedMs < CONTACT_MIN_FILL_MS) {
      return htmlResponse(
        templates.contact,
        {
          ...contactView,
          contact_notice_error: true,
          contact_notice_message: 'Please take a moment before submitting.',
        },
        400,
      );
    }

    if (!fromRaw || !subjectRaw || !messageRaw) {
      return htmlResponse(
        templates.contact,
        {
          ...contactView,
          contact_notice_error: true,
          contact_notice_message: 'Please fill out all fields before sending.',
        },
        400,
      );
    }

    if (!isValidEmail(fromRaw)) {
      return htmlResponse(
        templates.contact,
        {
          ...contactView,
          contact_notice_error: true,
          contact_notice_message: 'Please enter a valid email address.',
        },
        400,
      );
    }

    if (messageRaw.length > CONTACT_MESSAGE_LIMIT) {
      return htmlResponse(
        templates.contact,
        {
          ...contactView,
          contact_notice_error: true,
          contact_notice_message: 'Please keep messages under 5,000 characters.',
        },
        400,
      );
    }

    const emailDomain = getEmailDomain(fromRaw);
    if (emailDomain && DISPOSABLE_DOMAINS.has(emailDomain)) {
      return htmlResponse(
        templates.contact,
        {
          ...contactView,
          contact_notice_error: true,
          contact_notice_message: 'Please use a non-disposable email address.',
        },
        400,
      );
    }

    const from = cleanHeaderValue(fromRaw).slice(0, 320);
    const subject = cleanHeaderValue(subjectRaw).slice(0, 200);
    const message = messageRaw.trim().slice(0, CONTACT_MESSAGE_LIMIT);
    const contactId = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const userAgent = request.headers.get('user-agent') ?? '';
    const senderIp = request.headers.get('cf-connecting-ip') ?? '';

    try {
      await env.DB.prepare(
        'INSERT INTO contact_messages (id, from_email, subject, message, created_at, sender_ip, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
      )
        .bind(contactId, from, subject, message, nowIso, senderIp, userAgent)
        .run();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      return htmlResponse(
        templates.contact,
        {
          ...contactView,
          contact_notice_error: true,
          contact_notice_message: message,
        },
        500,
      );
    }

    const messageId = `<${crypto.randomUUID()}@bhart.org>`;
    const sentAt = new Date().toUTCString();
    const raw = [
      'From: "bhart.org contact form" <contact@bhart.org>',
      'To: bruce@bhart.org',
      `Reply-To: ${from}`,
      `Subject: ${subject}`,
      `Message-ID: ${messageId}`,
      `Date: ${sentAt}`,
      'Content-Type: text/plain; charset="utf-8"',
      'Content-Transfer-Encoding: 7bit',
      '',
      `From: ${from}`,
      `Subject: ${subject}`,
      '',
      message,
    ].join('\r\n');

    try {
      const email = new EmailMessage('contact@bhart.org', 'bruce@bhart.org', raw);
      await env.SEND_EMAIL.send(email);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to send your message.';
      return htmlResponse(
        templates.contact,
        {
          ...contactView,
          contact_notice_error: true,
          contact_notice_message: message,
        },
        500,
      );
    }

    return redirectResponse(request, '/contact?sent=1');
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
      hero_image_url: resolveHeroImageUrl(post.hero_image_url),
      hero_image_alt: post.hero_image_alt || post.title,
      body_html: bodyHtml,
      tags: post.tag_names.map((name) => ({ name })),
      show_email_subscribe: showEmailSubscribe,
    };
    return htmlResponse(templates.article, view);
  }

  return null;
};
