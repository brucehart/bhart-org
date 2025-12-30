export const homeTemplate = `<!DOCTYPE html>
<html class="light" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>{{site_title}}</title>
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
              "text-sub": "#4c669a"
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
      <header class="sticky top-0 z-50 w-full border-b border-[#e7ebf3] bg-background-light/90 backdrop-blur-md">
        <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-3 text-text-main">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <span class="material-symbols-outlined text-[20px]">terminal</span>
            </div>
            <a class="text-xl font-bold tracking-tight text-text-main" href="/">bhart.org</a>
          </div>
          <div class="hidden md:flex flex-1 items-center justify-end gap-6">
            <nav class="flex items-center gap-6">
              <a class="text-sm font-semibold text-primary" href="/">Home</a>
              <a class="text-sm font-medium text-text-main hover:text-primary transition-colors" href="/about">About</a>
              <a class="text-sm font-medium text-text-main hover:text-primary transition-colors" href="/projects">Projects</a>
              <a class="text-sm font-medium text-text-main hover:text-primary transition-colors" href="/news">News</a>
              <a class="text-sm font-medium text-text-main hover:text-primary transition-colors" href="/work-with-me">Work With Me</a>
              <a class="text-sm font-medium text-text-main hover:text-primary transition-colors" href="/contact">Contact</a>
            </nav>
            <div class="flex items-center gap-4 text-sm font-medium text-text-sub">
              <a class="hover:text-primary transition-colors" href="{{linkedin_url}}" rel="noreferrer" target="_blank">LinkedIn</a>
              <a class="hover:text-primary transition-colors" href="{{github_url}}" rel="noreferrer" target="_blank">GitHub</a>
            </div>
          </div>
          <div class="md:hidden flex items-center text-text-main">
            <span class="material-symbols-outlined cursor-pointer">menu</span>
          </div>
        </div>
      </header>
      <main class="flex-grow">
        <section class="bg-white">
          <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div
              class="absolute inset-0 pointer-events-none opacity-[0.03]"
              style="background-image: radial-gradient(#135bec 1px, transparent 1px); background-size: 32px 32px;"
            ></div>
            <div class="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
              <div class="flex flex-col gap-4">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Welcome</p>
                <h1 class="text-4xl sm:text-5xl font-black tracking-tight text-text-main">I'm Bruce Hart.</h1>
                <p class="text-lg text-text-sub max-w-2xl">
                  I write about practical AI, automation, and the human side of building software. Expect thoughtful takes,
                  experiments, and honest tradeoffs from the field.
                </p>
                <div class="flex flex-wrap gap-3 pt-2">
                  <a class="inline-flex items-center gap-2 rounded-lg bg-text-main px-5 py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity" href="/about">
                    About me
                    <span class="material-symbols-outlined text-sm">arrow_forward</span>
                  </a>
                  <a class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-transparent px-5 py-3 text-sm font-bold text-text-main hover:bg-gray-50 transition-colors" href="/work-with-me">
                    Work With Me
                  </a>
                </div>
              </div>
              <div class="rounded-2xl border border-gray-100 bg-background-light p-6 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-widest text-primary">On this blog</p>
                <div class="mt-4 flex flex-col gap-3 text-sm text-text-sub">
                  <div class="flex items-start gap-3">
                    <span class="mt-2 h-2 w-2 rounded-full bg-primary/60"></span>
                    <p>AI agents, automation systems, and operational playbooks.</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="mt-2 h-2 w-2 rounded-full bg-primary/60"></span>
                    <p>Full stack experiments with data, APIs, and product thinking.</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="mt-2 h-2 w-2 rounded-full bg-primary/60"></span>
                    <p>Notes on leadership, systems, and making technology human.</p>
                  </div>
                </div>
              </div>
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
        <section class="py-12 bg-white">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold tracking-tight text-text-main mb-8">Recent Articles</h2>
            {{#has_posts}}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {{#posts}}
              <article class="group flex flex-col overflow-hidden rounded-2xl bg-background-light border border-gray-100 transition-all hover:shadow-lg hover:shadow-primary/5">
                <div class="relative overflow-hidden h-56">
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
            <div class="rounded-2xl border border-dashed border-gray-200 bg-background-light p-10 text-center text-text-sub">
              No posts yet. Check back soon.
            </div>
            {{/has_posts}}
          </div>
        </section>
      </main>
      <footer class="bg-white border-t border-gray-200">
        <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div class="rounded-3xl bg-background-light p-8 md:p-12 lg:p-16 relative overflow-hidden">
            <div class="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
            <div class="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
            <div class="relative z-10 flex flex-col items-center text-center">
              <h2 class="text-3xl font-bold tracking-tight text-text-main sm:text-4xl">
                Subscribe for weekly insights
              </h2>
              <p class="mx-auto mt-4 max-w-xl text-lg text-text-sub">
                Get the latest articles on AI, tech trends, and personal reflections delivered straight to your inbox.
              </p>
              <form class="mt-8 flex w-full max-w-md flex-col gap-4 sm:flex-row">
                <label class="sr-only" for="email-address">Email address</label>
                <input
                  autocomplete="email"
                  class="min-w-0 flex-auto rounded-lg border-0 bg-white px-4 py-3.5 text-text-main shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  id="email-address"
                  name="email"
                  placeholder="Enter your email"
                  required=""
                  type="email"
                />
                <button
                  class="flex-none rounded-lg bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                  type="submit"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <div class="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-text-sub">
            <a class="hover:text-primary transition-colors" href="/about">About</a>
            <a class="hover:text-primary transition-colors" href="/projects">Projects</a>
            <a class="hover:text-primary transition-colors" href="/news">News</a>
            <a class="hover:text-primary transition-colors" href="/work-with-me">Work With Me</a>
            <a class="hover:text-primary transition-colors" href="/contact">Contact</a>
          </div>
          <div class="mt-16 flex flex-col items-center justify-between gap-8 md:flex-row">
            <div class="flex items-center gap-2">
              <div class="flex h-6 w-6 items-center justify-center rounded bg-primary text-white text-xs">
                <span class="material-symbols-outlined text-[14px]">terminal</span>
              </div>
              <p class="text-sm font-semibold text-text-main">bhart.org</p>
            </div>
            <div class="flex items-center gap-4 text-xs font-semibold text-text-sub">
              <a class="hover:text-primary transition-colors" href="{{linkedin_url}}" rel="noreferrer" target="_blank">LinkedIn</a>
              <a class="hover:text-primary transition-colors" href="{{github_url}}" rel="noreferrer" target="_blank">GitHub</a>
            </div>
            <p class="text-xs text-text-sub">(c) 2024 Bruce Hart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  </body>
</html>
`;
