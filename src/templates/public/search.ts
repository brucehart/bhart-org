export const searchTemplate = `<!DOCTYPE html>
<html class="light" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>{{page_title}}</title>
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
        <section class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div class="flex flex-col gap-3">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Search</p>
            <h1 class="text-4xl sm:text-5xl font-black tracking-tight">Search the archive</h1>
            <p class="text-sm text-text-sub">
              Look across posts, tags, SEO titles, and more. Back to the
              <a class="text-primary font-semibold" href="/">home page</a>.
            </p>
          </div>

          <form action="/search" class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center" method="get">
            <label class="sr-only" for="search-page-query">Search</label>
            <input
              class="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-text-main placeholder:text-text-sub focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:flex-1"
              id="search-page-query"
              name="q"
              placeholder="Search posts, tags, SEO titles, or keywords"
              type="search"
              value="{{search_query}}"
            />
            <button
              class="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              type="submit"
            >
              Search
            </button>
          </form>

          {{#has_query}}
          <p class="mt-4 text-xs text-text-sub">
            {{result_count}} {{result_label}} for “{{search_query}}”.
          </p>
          {{/has_query}}

          {{#has_results}}
          <div class="mt-6 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm">
            {{#results}}
            <div class="flex flex-col gap-2 p-6">
              <a class="text-lg font-semibold text-text-main hover:text-primary transition-colors" href="{{url}}">
                {{title}}
              </a>
              <div class="text-xs text-text-sub font-medium">
                <span>{{published_date}}</span>
                <span>•</span>
                <span>{{reading_time}} min read</span>
              </div>
            </div>
            {{/results}}
          </div>
          {{/has_results}}
          {{^has_results}}
          <div class="mt-8 rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-text-sub">
            {{#has_query}}
            No posts match that search yet.
            {{/has_query}}
            {{^has_query}}
            Enter a search term to see results.
            {{/has_query}}
          </div>
          {{/has_results}}
        </section>
      </main>
      {{> publicFooter}}
    </div>
  </body>
</html>
`;
