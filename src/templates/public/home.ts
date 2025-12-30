export const homeTemplate = `<!DOCTYPE html>
<html class="light" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>{{site_title}}</title>
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
  <body class="bg-background-light text-text-main font-display antialiased selection:bg-primary/20 selection:text-primary">
    <div class="relative flex min-h-screen flex-col overflow-x-hidden">
      {{> publicHeader}}
      <main class="flex-grow">
        <section class="bg-white border-b border-gray-100">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex flex-col gap-3 text-center">
              <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-text-main">Welcome to my blog</h1>
              <p class="text-base text-text-sub max-w-3xl mx-auto">
                I write about practical AI, automation, and the human side of building software. 
                Expect thoughtful takes, experiments, and honest tradeoffs from the field.
              </p>
            </div>
          </div>
        </section>
        <div class="sticky top-16 z-40 w-full bg-background-light/95 backdrop-blur-sm border-b border-gray-100 py-4">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="flex items-center gap-2 overflow-x-auto pb-2">
              {{#tag_filters}}
              <a class="{{chip_class}}" href="{{url}}">{{name}}</a>
              {{/tag_filters}}
            </div>
          </div>
        </div>
        <section class="py-12 bg-background-light">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col lg:flex-row gap-8">
              <!-- Left Sidebar: Tags -->
              <aside class="w-full lg:w-64 flex-shrink-0">
                <div class="sticky top-24 space-y-6">
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
              </aside>

              <!-- Main Content: Articles -->
              <div class="flex-1 min-w-0">
                <h2 class="text-3xl font-bold tracking-tight text-text-main mb-8">Recent Articles</h2>
                {{#has_posts}}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {{#posts}}
                  <article class="group flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 transition-all hover:shadow-lg hover:shadow-primary/5">
                    <div class="relative overflow-hidden h-48">
                      <div class="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style="background-image: url('{{image_url}}');"></div>
                    </div>
                    <div class="flex flex-1 flex-col p-6">
                      <div class="flex items-center gap-3 mb-3">
                        <span class="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">{{primary_tag}}</span>
                        <span class="text-xs text-text-sub font-medium">{{published_date}}</span>
                      </div>
                      <h3 class="text-xl font-bold text-text-main leading-tight group-hover:text-primary transition-colors">
                        <a href="{{url}}">{{title}}</a>
                      </h3>
                      <p class="mt-3 text-sm text-text-sub line-clamp-3 flex-grow">
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
                {{^has_posts}}
                <div class="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-text-sub">
                  No posts yet. Check back soon.
                </div>
                {{/has_posts}}
              </div>

              <!-- Right Sidebar: About & Recent Posts -->
              <aside class="w-full lg:w-80 flex-shrink-0">
                <div class="sticky top-24 space-y-6">
                  <!-- About Me Mini Card -->
                  <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div class="flex items-center gap-4 mb-4">
                      <div class="w-16 h-16 rounded-full bg-cover bg-center border-2 border-gray-100" style="background-image: url('{{author_avatar_url}}');"></div>
                      <div>
                        <h3 class="font-bold text-text-main">Bruce Hart</h3>
                        <p class="text-xs text-text-sub">AI & Tech Writer</p>
                      </div>
                    </div>
                    <p class="text-sm text-text-sub mb-4">
                      Engineering leader exploring AI, automation, and the human side of software.
                    </p>
                    <a href="/about" class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                      More about me
                      <span class="material-symbols-outlined text-sm">arrow_forward</span>
                    </a>
                  </div>

                  <!-- Recent Posts -->
                  {{#has_recent_posts}}
                  <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 class="text-lg font-bold text-text-main mb-4">Recent Posts</h2>
                    <div class="flex flex-col gap-4">
                      {{#recent_posts}}
                      <a href="{{url}}" class="group">
                        <h4 class="text-sm font-semibold text-text-main group-hover:text-primary transition-colors leading-tight mb-1">{{title}}</h4>
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
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      {{> publicFooter}}
    </div>
  </body>
</html>
`;
