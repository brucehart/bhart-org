export const archiveTemplate = `<!DOCTYPE html>
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
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Archive</p>
            <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">{{archive_title}}</h1>
            <p class="text-sm text-text-sub">
              Browse posts from this time period. Jump back to the
              <a class="text-primary font-semibold" href="/">home page</a>.
            </p>
          </div>

          {{#has_posts}}
          <div class="mt-8 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm">
            {{#posts}}
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
            {{/posts}}
          </div>
          {{/has_posts}}
          {{^has_posts}}
          <div class="mt-8 rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-text-sub">
            No posts published in this time period.
          </div>
          {{/has_posts}}
        </section>
      </main>
      {{> publicFooter}}
    </div>
  </body>
</html>
`;
