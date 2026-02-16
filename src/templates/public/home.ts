export const homeTemplate = `<!DOCTYPE html>
<html class="light" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>{{site_title}}</title>
    {{> publicFavicon}}
    <link rel="alternate" type="application/rss+xml" title="bhart.org RSS" href="{{rss_url}}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&display=swap"
      rel="stylesheet"
    />
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries,typography"></script>
    <script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              primary: "#135bec",
              "background-light": "#f6f6f8",
              "background-dark": "#101622",
              "card-light": "#ffffff",
              "card-dark": "#1a2233",
              "text-main": "#0d121b",
              "text-sub": "#4c669a",
              "text-light": "#0d121b",
              "muted-light": "#4c669a",
              "border-light": "#e7ebf3"
            },
            fontFamily: {
              display: ["Space Grotesk", "sans-serif"],
              sans: ["Space Grotesk", "sans-serif"]
            },
            borderRadius: {
              DEFAULT: "0.375rem",
              md: "0.375rem",
              lg: "0.5rem",
              xl: "0.75rem",
              "2xl": "1rem",
              full: "9999px"
            }
          }
        }
      };
    </script>
    <style>
      @media (min-width: 1024px) {
        html {
          font-size: 80%;
        }
        body.home-header-scale header {
          font-size: 1.25rem;
        }
      }
    </style>
  </head>
  <body class="bg-background-light text-text-main font-display antialiased selection:bg-primary/20 selection:text-primary home-header-scale">
    <div class="relative flex min-h-screen flex-col overflow-x-visible md:overflow-x-hidden">
      {{> publicHeader}}
      <main class="flex-grow" id="main-content">
        <section class="py-12 bg-background-light">
          <div class="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col lg:flex-row gap-8">
              <!-- Left Sidebar: Tags -->
              <div class="order-3 w-full lg:order-none lg:w-64 flex-shrink-0">
                <div class="sticky top-24 space-y-6">
                  <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 class="text-lg font-bold text-text-main mb-4">Search</h2>
                    <form action="/search" class="flex flex-col gap-3" method="get">
                      <label class="sr-only" for="home-search-query">Search posts</label>
                      <input
                        class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-text-main placeholder:text-text-sub focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        id="home-search-query"
                        name="q"
                        placeholder="Search posts, tags, or SEO titles"
                        type="search"
                      />
                      <button
                        class="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                        type="submit"
                      >
                        Search
                      </button>
                    </form>
                  </div>
                  <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 class="text-lg font-bold text-text-main mb-4">Topics</h2>
                    <div class="flex flex-col gap-2">
                      {{#sidebar_tags}}
                      <a href="/?tag={{slug}}" class="flex items-center justify-between px-3 py-2 text-sm text-text-main hover:bg-background-light rounded-lg transition-colors group">
                        <span class="group-hover:text-primary transition-colors">{{name}}</span>
                        <span class="text-xs text-text-sub font-medium bg-background-light group-hover:bg-primary/10 group-hover:text-primary px-2 py-0.5 rounded-full transition-colors">{{post_count}}</span>
                      </a>
                      {{/sidebar_tags}}
                      {{^sidebar_tags}}
                      <p class="text-sm text-text-sub">No topics yet.</p>
                      {{/sidebar_tags}}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Main Content: Articles -->
              <div class="order-1 flex-1 min-w-0 lg:order-none">
                {{#has_latest_post}}
                <div class="mb-10">
                  <div class="flex flex-col gap-3">
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Latest</p>
                  </div>
                  {{#latest_post}}
                  <article class="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div class="flex flex-col gap-4">
                      {{#image_url}}
                      <div class="overflow-hidden rounded-2xl border border-gray-100">
                        <img alt="{{image_alt}}" class="h-96 w-full object-cover" src="{{image_url}}" />
                      </div>
                      {{/image_url}}
                      <div class="flex items-center gap-3 text-xs text-text-sub font-medium">
                        <span>{{published_date}}</span>
                        <span>•</span>
                        <span>{{reading_time}} min read</span>
                      </div>
                      <h3 class="text-3xl md:text-4xl font-bold text-text-main leading-tight">
                        <a class="hover:text-primary transition-colors" href="{{url}}">{{title}}</a>
                      </h3>
                      <p class="text-base sm:text-lg text-text-sub break-words [overflow-wrap:anywhere]">{{summary}}</p>
                      <div class="prose prose-lg sm:prose-xl prose-slate prose-h1:text-3xl sm:prose-h1:text-4xl prose-h2:text-xl sm:prose-h2:text-2xl max-w-none text-text-main break-words [overflow-wrap:anywhere]">
                        {{{excerpt_html}}}
                      </div>
                      <a class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors" href="{{url}}">
                        Read the full piece
                        <span aria-hidden="true" class="material-symbols-outlined text-sm">arrow_forward</span>
                      </a>
                    </div>
                  </article>
                  {{/latest_post}}
                </div>
                {{/has_latest_post}}

                {{#has_posts}}
                <div class="flex items-center justify-between mb-6">
                  <h2 class="text-2xl font-bold tracking-tight text-text-main">More articles</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {{#posts}}
                  <article class="group flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 transition-all hover:shadow-lg hover:shadow-primary/5">
                    {{#image_url}}
                    <div class="relative overflow-hidden h-80">
                      <div aria-label="{{title}} cover image" class="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" role="img" style="background-image: url('{{image_url}}');"></div>
                    </div>
                    {{/image_url}}
                    <div class="flex flex-1 flex-col p-6">
                      <div class="flex items-center gap-3 mb-3">
                        <span class="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">{{primary_tag}}</span>
                        <span class="text-xs text-text-sub font-medium">{{published_date}}</span>
                      </div>
                      <h3 class="text-xl font-bold text-text-main leading-tight group-hover:text-primary transition-colors">
                        <a href="{{url}}">{{title}}</a>
                      </h3>
                      <p class="mt-3 text-base sm:text-base text-text-sub line-clamp-3 flex-grow break-words [overflow-wrap:anywhere]">
                        {{summary}}
                      </p>
                      <div class="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span class="text-xs font-medium text-text-sub">{{reading_time}} min read</span>
                      </div>
                    </div>
                  </article>
                  {{/posts}}
                </div>
                {{/has_posts}}
                {{^has_latest_post}}
                {{^has_posts}}
                <div class="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-text-sub">
                  No posts yet. Check back soon.
                </div>
                {{/has_posts}}
                {{/has_latest_post}}
              </div>

              <!-- Right Sidebar: About & Recent Posts -->
              <div class="order-2 w-full lg:order-none lg:w-80 flex-shrink-0">
                <div class="sticky top-24 space-y-6">
                  <!-- About Me Mini Card -->
                  <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div class="flex items-center gap-4 mb-4">
                      <img alt="Portrait of Bruce Hart" class="w-16 h-16 rounded-full border-2 border-gray-100 object-cover" src="{{author_avatar_url}}" />
                      <div>
                        <h3 class="font-bold text-text-main">Bruce Hart</h3>
                        <p class="text-xs text-text-sub">Engineer who writes</p>
                      </div>
                    </div>
                    <p class="text-sm text-text-sub mb-4">
                      Engineer tinkering with AI and automation. I like clear tradeoffs, readable code, and weird little experiments that sometimes work.
                    </p>
                    <a href="/about" class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                      More about me
                      <span aria-hidden="true" class="material-symbols-outlined text-sm">arrow_forward</span>
                    </a>
                  </div>

                  <!-- Recent Posts -->
                  {{#has_recent_posts}}
                  <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 class="text-lg font-bold text-text-main mb-4">Recent Posts</h2>
                    <div class="flex flex-col gap-4">
                      {{#recent_posts}}
                      <a href="{{url}}" class="group">
                        <h3 class="text-sm font-semibold text-text-main group-hover:text-primary transition-colors leading-tight mb-1">{{title}}</h3>
                        <div class="flex items-center gap-2 text-xs text-text-sub">
                          <span>{{published_date}}</span>
                          <span>•</span>
                          <span>{{reading_time}} min read</span>
                        </div>
                      </a>
                      {{/recent_posts}}
                    </div>
                  </div>
                  {{/has_recent_posts}}

                  {{#has_recent_news}}
                  <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div class="flex items-center justify-between mb-4">
                      <h2 class="text-lg font-bold text-text-main">Recent News</h2>
                      <a class="text-xs font-semibold text-primary hover:text-primary/80 transition-colors" href="/news">All news</a>
                    </div>
                    <div class="flex flex-col gap-4">
                      {{#recent_news}}
                      <a href="/news" class="group">
                        <div class="text-[11px] uppercase tracking-widest text-primary">{{category}}</div>
                        <h3 class="text-sm font-semibold text-text-main group-hover:text-primary transition-colors leading-tight mt-1">{{title}}</h3>
                        <div class="text-xs text-text-sub mt-1">{{published_date}}</div>
                      </a>
                      {{/recent_news}}
                    </div>
                  </div>
                  {{/has_recent_news}}

                  <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 class="text-lg font-bold text-text-main mb-3">Subscribe</h2>
                    <a class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors" href="{{rss_url}}">
                      <span aria-hidden="true" class="material-symbols-outlined text-[18px]">rss_feed</span>
                      RSS feed
                    </a>
                    {{#show_email_subscribe}}
                    <form class="mt-4 flex flex-col gap-3">
                      <label class="text-xs font-semibold text-text-sub" for="subscribe-email-home">Email updates</label>
                      <input
                        autocomplete="email"
                        class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-text-main placeholder:text-text-sub focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        id="subscribe-email-home"
                        name="email"
                        placeholder="you@example.com"
                        type="email"
                      />
                      <label class="flex flex-col gap-2 text-xs text-text-sub" for="subscribe-frequency-home">
                        <span class="text-xs font-semibold text-text-sub">Frequency</span>
                        <select
                          class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          id="subscribe-frequency-home"
                          name="frequency-home"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly" selected>Weekly</option>
                          <option value="instant">As it happens</option>
                        </select>
                      </label>
                      <button
                        class="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                        type="submit"
                      >
                        Join by email
                      </button>
                    </form>
                    {{/show_email_subscribe}}
                  </div>

                  {{#has_posts_by_month}}
                  <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 class="text-lg font-bold text-text-main mb-4">Posts by Month</h2>
                    <div class="flex flex-col gap-3">
                      {{#posts_by_month_groups}}
                      <details class="group rounded-lg border border-gray-100 bg-background-light/60 px-3 py-2" {{#is_open}}open{{/is_open}}>
                        <summary class="cursor-pointer list-none flex items-center justify-between text-sm font-semibold text-text-main">
                          <a class="hover:text-primary transition-colors" href="{{year_url}}">{{year}}</a>
                          <span aria-hidden="true" class="material-symbols-outlined text-sm text-text-sub transition-transform group-open:rotate-180">expand_more</span>
                        </summary>
                        <div class="mt-2 flex flex-col gap-2">
                          {{#months}}
                          <a class="flex items-center justify-between text-xs text-text-sub hover:text-primary transition-colors" href="{{month_url}}">
                            <span>{{label}}</span>
                            <span class="font-semibold text-text-main">{{count}}</span>
                          </a>
                          {{/months}}
                        </div>
                      </details>
                      {{/posts_by_month_groups}}
                    </div>
                  </div>
                  {{/has_posts_by_month}}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      {{> publicFooter}}
    </div>
  </body>
</html>
`;
