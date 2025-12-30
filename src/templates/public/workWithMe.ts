export const workWithMeTemplate = `<!DOCTYPE html>
<html class="light" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Bruce Hart - Work With Me</title>
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
  <body class="bg-background-light text-text-main font-display antialiased">
    <div class="relative flex min-h-screen flex-col overflow-x-hidden">
      <header class="sticky top-0 z-50 w-full border-b border-[#e7ebf3] bg-background-light/90 backdrop-blur-md">
        <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <span class="material-symbols-outlined text-[20px]">terminal</span>
            </div>
            <a class="text-xl font-bold tracking-tight text-text-main" href="/">bhart.org</a>
          </div>
          <div class="hidden lg:flex items-center gap-6">
            <nav class="flex items-center gap-6">
              <a class="text-sm font-medium text-text-main hover:text-primary transition-colors" href="/">Home</a>
              <a class="text-sm font-medium text-text-main hover:text-primary transition-colors" href="/about">About</a>
              <a class="text-sm font-medium text-text-main hover:text-primary transition-colors" href="/projects">Projects</a>
              <a class="text-sm font-medium text-text-main hover:text-primary transition-colors" href="/news">News</a>
              <a class="text-sm font-semibold text-primary" href="/work-with-me">Work With Me</a>
              <a class="text-sm font-medium text-text-main hover:text-primary transition-colors" href="/contact">Contact</a>
            </nav>
            <div class="flex items-center gap-4 text-sm font-medium text-text-sub">
              <a class="hover:text-primary transition-colors" href="{{linkedin_url}}" rel="noreferrer" target="_blank">LinkedIn</a>
              <a class="hover:text-primary transition-colors" href="{{github_url}}" rel="noreferrer" target="_blank">GitHub</a>
            </div>
          </div>
          <div class="lg:hidden flex items-center text-text-main">
            <span class="material-symbols-outlined cursor-pointer">menu</span>
          </div>
        </div>
      </header>
      <main class="flex-grow">
        <section class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div class="flex flex-col gap-4">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Work With Me</p>
            <h1 class="text-4xl sm:text-5xl font-black tracking-tight">Strategy, build, and delivery.</h1>
            <p class="text-lg text-text-sub max-w-2xl">
              I partner with teams to design AI-driven products, streamline automation, and ship reliable software.
            </p>
          </div>
          <div class="mt-10 grid gap-6 md:grid-cols-2">
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 class="text-xl font-bold">Advisory</h3>
              <p class="mt-2 text-sm text-text-sub">
                Technical strategy, roadmap reviews, and architecture guidance for AI and data teams.
              </p>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 class="text-xl font-bold">Build</h3>
              <p class="mt-2 text-sm text-text-sub">
                Rapid prototyping and implementation of product features, automation systems, and back ends.
              </p>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 class="text-xl font-bold">Workshops</h3>
              <p class="mt-2 text-sm text-text-sub">
                Hands-on sessions that align product, engineering, and leadership around AI capabilities.
              </p>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 class="text-xl font-bold">Delivery Support</h3>
              <p class="mt-2 text-sm text-text-sub">
                Execution help to get systems into production with clear metrics and operational guardrails.
              </p>
            </div>
          </div>
          <div class="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <h2 class="text-2xl font-bold">Start a conversation</h2>
            <p class="mt-2 text-sm text-text-sub">
              Send a note with a brief overview and timeline. I will reply with next steps.
            </p>
            <a class="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors" href="mailto:hello@bhart.org">
              hello@bhart.org
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          </div>
        </section>
      </main>
      <footer class="border-t border-gray-200 bg-white">
        <div class="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 text-sm text-text-sub sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p class="font-semibold text-text-main">bhart.org</p>
          <div class="flex items-center gap-4 font-medium">
            <a class="hover:text-primary transition-colors" href="{{linkedin_url}}" rel="noreferrer" target="_blank">LinkedIn</a>
            <a class="hover:text-primary transition-colors" href="{{github_url}}" rel="noreferrer" target="_blank">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  </body>
</html>
`;
