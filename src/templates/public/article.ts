export const articleTemplate = `<!DOCTYPE html>
<html class="light" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>{{page_title}}</title>
    <meta name="description" content="{{seo_description}}" />
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
              "text-muted": "#4c669a"
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
    </style>
  </head>
  <body class="bg-background-light text-text-main antialiased min-h-screen flex flex-col">
    <nav class="sticky top-0 z-50 w-full bg-background-light/80 backdrop-blur-md border-b border-[#e7ebf3]">
      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <span class="material-symbols-outlined text-xl">bolt</span>
            </div>
            <a class="text-xl font-bold tracking-tight" href="/">Bruce Hart</a>
          </div>
          <div class="hidden md:flex items-center gap-6">
            <nav class="flex items-center gap-6">
              <a class="text-sm font-medium hover:text-primary transition-colors" href="/">Home</a>
              <a class="text-sm font-medium text-primary" href="/">Articles</a>
              <a class="text-sm font-medium hover:text-primary transition-colors" href="/about">About</a>
              <a class="text-sm font-medium hover:text-primary transition-colors" href="/projects">Projects</a>
              <a class="text-sm font-medium hover:text-primary transition-colors" href="/news">News</a>
              <a class="text-sm font-medium hover:text-primary transition-colors" href="/work-with-me">Work With Me</a>
              <a class="text-sm font-medium hover:text-primary transition-colors" href="/contact">Contact</a>
            </nav>
            <div class="flex items-center gap-4 text-sm font-medium text-text-muted">
              <a class="hover:text-primary transition-colors" href="{{linkedin_url}}" rel="noreferrer" target="_blank">LinkedIn</a>
              <a class="hover:text-primary transition-colors" href="{{github_url}}" rel="noreferrer" target="_blank">GitHub</a>
            </div>
          </div>
        </div>
      </div>
    </nav>
    {{#preview}}
    <div class="bg-amber-100 border-b border-amber-200">
      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-3 text-sm text-amber-900 flex items-center justify-between">
        <div>Previewing a draft post.</div>
        <a class="font-semibold text-amber-900 underline" href="{{preview_edit_url}}">Back to editor</a>
      </div>
    </div>
    {{/preview}}
    <main class="flex-grow w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <article class="lg:col-span-8 flex flex-col gap-8">
          <header class="flex flex-col gap-6">
            <div class="flex flex-wrap gap-2">
              {{#tags}}
              <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">
                {{name}}
              </span>
              {{/tags}}
            </div>
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-text-main">
              {{title}}
            </h1>
            <div class="flex items-center gap-4 text-sm text-text-muted border-b border-gray-200 pb-6">
              <div class="flex items-center gap-2">
                <div class="h-8 w-8 rounded-full bg-gray-300 overflow-hidden" style="background-image: url('{{author_avatar}}'); background-size: cover;"></div>
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
          <div class="prose prose-lg prose-slate max-w-none text-text-main leading-relaxed text-lg">
            {{{body_html}}}
          </div>
        </article>
        <aside class="lg:col-span-4 flex flex-col gap-6">
          <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 class="text-lg font-bold mb-2">About the author</h3>
            <p class="text-sm text-text-muted">{{author_name}} writes about AI, technology, and the human side of innovation.</p>
          </div>
          <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 class="text-lg font-bold mb-2">More reading</h3>
            <p class="text-sm text-text-muted">Return to the <a class="text-primary font-semibold" href="/">home page</a> for the latest posts.</p>
          </div>
        </aside>
      </div>
    </main>
  </body>
</html>
`;
