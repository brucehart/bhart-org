export const newsTemplate = `<!DOCTYPE html>
<html class="light" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Bruce Hart - News</title>
    {{> publicFavicon}}
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
  </head>
  <body class="bg-background-light text-text-main font-display antialiased">
    <div class="relative flex min-h-screen flex-col overflow-x-hidden">
      {{> publicHeader}}
      <main class="flex-grow">
        <section class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div class="flex flex-col gap-4">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">News</p>
            <h1 class="text-4xl sm:text-5xl font-black tracking-tight">Updates, launches, and short notes.</h1>
            <p class="text-lg text-text-sub max-w-2xl">
              A lightweight feed for what I am shipping, learning, and exploring.
            </p>
          </div>
          <div class="mt-10 flex flex-col gap-6">
            {{#has_news_items}}
            {{#news_items}}
            <article class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div class="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-primary">
                <span>{{category}}</span>
                <span class="text-text-sub font-medium normal-case tracking-normal">{{published_date}}</span>
              </div>
              <h3 class="mt-3 text-xl font-bold">{{title}}</h3>
              <div class="prose prose-sm prose-slate mt-2 text-text-sub">
                {{{body_html}}}
              </div>
            </article>
            {{/news_items}}
            {{/has_news_items}}
            {{^has_news_items}}
            <div class="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-text-sub">
              No news items yet. Check back soon.
            </div>
            {{/has_news_items}}
          </div>
        </section>
      </main>
      {{> publicFooter}}
    </div>
  </body>
</html>
`;
