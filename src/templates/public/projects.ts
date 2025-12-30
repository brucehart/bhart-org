export const projectsTemplate = `<!DOCTYPE html>
<html class="light" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Bruce Hart - Projects</title>
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
              <a class="text-sm font-semibold text-primary" href="/projects">Projects</a>
              <a class="text-sm font-medium text-text-main hover:text-primary transition-colors" href="/news">News</a>
              <a class="text-sm font-medium text-text-main hover:text-primary transition-colors" href="/work-with-me">Work With Me</a>
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
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Projects</p>
            <h1 class="text-4xl sm:text-5xl font-black tracking-tight">Things I am building in the open.</h1>
            <p class="text-lg text-text-sub max-w-2xl">
              A running list of experiments, tools, and systems that explore AI workflows, automation, and practical software.
            </p>
          </div>
          <div class="mt-10 grid gap-6 md:grid-cols-2">
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-widest text-primary">AI Agents</p>
              <h3 class="mt-3 text-xl font-bold">Autonomous research and ops helpers</h3>
              <p class="mt-2 text-sm text-text-sub">
                Lightweight agent systems focused on search, synthesis, and human-in-the-loop decision support.
              </p>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-widest text-primary">Automation</p>
              <h3 class="mt-3 text-xl font-bold">Playbooks that eliminate busywork</h3>
              <p class="mt-2 text-sm text-text-sub">
                End-to-end automations that connect data sources, alerts, and reporting in a clean workflow.
              </p>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-widest text-primary">Full Stack</p>
              <h3 class="mt-3 text-xl font-bold">Product prototypes with real users</h3>
              <p class="mt-2 text-sm text-text-sub">
                Fast iterations on UI, APIs, and data layers to validate ideas before going deep.
              </p>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-widest text-primary">Data Platforms</p>
              <h3 class="mt-3 text-xl font-bold">Applied data science systems</h3>
              <p class="mt-2 text-sm text-text-sub">
                Pipelines that turn raw data into reliable signals, dashboards, and decision-ready insights.
              </p>
            </div>
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
