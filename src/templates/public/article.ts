export const articleTemplate = `<!DOCTYPE html>
<html class="light" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>{{page_title}}</title>
    {{> publicFavicon}}
    <meta name="description" content="{{seo_description}}" />
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
              "text-main": "#0d121b",
              "text-muted": "#4c669a",
              "text-sub": "#4c669a",
              "text-light": "#0d121b",
              "muted-light": "#4c669a",
              "border-light": "#e7ebf3"
            },
            fontFamily: {
              display: ["Space Grotesk", "sans-serif"],
              mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"]
            },
            borderRadius: {
              DEFAULT: "0.25rem",
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
      body {
        font-family: "Space Grotesk", sans-serif;
      }

      @media (min-width: 1024px) {
        html {
          font-size: 80%;
        }
      }
    </style>
  </head>
  <body class="bg-background-light text-text-main antialiased min-h-screen flex flex-col">
    {{> publicHeader}}
    {{#preview}}
    <div class="bg-amber-100 border-b border-amber-200">
      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-3 text-sm text-amber-900 flex items-center justify-between">
        <div>Previewing a draft. You’re in the messy kitchen.</div>
        <a class="font-semibold text-amber-900 underline" href="{{preview_edit_url}}">Back to editor</a>
      </div>
    </div>
    {{/preview}}
    <main class="flex-grow w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10" id="main-content">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <article class="lg:col-span-7 flex flex-col gap-8">
          <header class="flex flex-col gap-6 mx-auto w-full max-w-prose">
            <div class="flex flex-wrap gap-2">
              {{#tags}}
              <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">
                {{name}}
              </span>
              {{/tags}}
            </div>
            <h1 class="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-text-main">
              {{title}}
            </h1>
            <div class="flex items-center gap-4 text-sm text-text-muted border-b border-gray-200 pb-6">
              <div class="flex items-center gap-2">
                <img alt="Portrait of {{author_name}}" class="h-8 w-8 rounded-full object-cover" src="{{author_avatar}}" />
                <span class="font-medium text-text-main">{{author_name}}</span>
              </div>
              <span>&bull;</span>
              <time datetime="{{published_at}}">{{published_date}}</time>
              <span>&bull;</span>
              <span>{{reading_time}} min read</span>
            </div>
          </header>
          {{#hero_image_url}}
          <div class="w-full rounded-2xl overflow-hidden shadow-sm aspect-video relative group">
            <img alt="{{hero_image_alt}}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="{{hero_image_url}}" />
          </div>
          {{/hero_image_url}}
          <div class="prose prose-lg md:prose-xl prose-slate prose-h1:text-3xl md:prose-h1:text-4xl prose-h2:text-xl md:prose-h2:text-2xl mx-auto w-full max-w-prose text-text-main leading-relaxed">
            {{{body_html}}}
          </div>
        </article>
        <aside class="lg:col-span-5 flex flex-col gap-6">
          <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <img alt="Portrait of {{author_name}}" class="h-12 w-12 rounded-full object-cover" src="{{author_avatar}}" />
              <div>
                <p class="text-sm font-semibold text-text-main">{{author_name}}</p>
                <p class="text-xs text-text-muted">Engineer who writes</p>
              </div>
            </div>
            <h3 class="text-lg font-bold mb-2">About the author</h3>
            <p class="text-sm text-text-muted">{{author_name}} writes about practical AI, automation, and the human side of shipping software. Sometimes the conclusions change in public.</p>
          </div>
          <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 class="text-lg font-bold mb-2">More reading</h3>
            <p class="text-sm text-text-muted">Return to the <a class="text-primary font-semibold" href="/">home page</a> for the latest posts.</p>
          </div>
          <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 class="text-lg font-bold mb-2">Subscribe</h3>
            <a class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors" href="{{rss_url}}">
              <span aria-hidden="true" class="material-symbols-outlined text-[18px]">rss_feed</span>
              RSS feed
            </a>
            {{#show_email_subscribe}}
            <form class="mt-4 flex flex-col gap-3">
              <label class="text-xs font-semibold text-text-muted" for="subscribe-email-article">Email updates</label>
              <input
                autocomplete="email"
                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                id="subscribe-email-article"
                name="email"
                placeholder="you@example.com"
                type="email"
              />
              <label class="flex flex-col gap-2 text-xs text-text-muted" for="subscribe-frequency-article">
                <span class="text-xs font-semibold text-text-muted">Frequency</span>
                <select
                  class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  id="subscribe-frequency-article"
                  name="frequency-article"
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
        </aside>
      </div>
    </main>
    {{> publicFooter}}
  </body>
</html>
`;
