export const newsTemplate = `<!DOCTYPE html>
<html class="light" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Bruce Hart - News</title>
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
              <a class="text-sm font-semibold text-primary" href="/news">News</a>
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
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">News</p>
            <h1 class="text-4xl sm:text-5xl font-black tracking-tight">Updates, launches, and short notes.</h1>
            <p class="text-lg text-text-sub max-w-2xl">
              A lightweight feed for what I am shipping, learning, and exploring.
            </p>
          </div>
          <div class="mt-10 flex flex-col gap-6">
            <article class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-widest text-primary">Now</p>
              <h3 class="mt-3 text-xl font-bold">Building a practical AI agent playbook</h3>
              <p class="mt-2 text-sm text-text-sub">
                Focusing on prompt hygiene, tool reliability, and guardrails that keep agents useful in the real world.
              </p>
            </article>
            <article class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-widest text-primary">Update</p>
              <h3 class="mt-3 text-xl font-bold">New project writeups coming soon</h3>
              <p class="mt-2 text-sm text-text-sub">
                I am documenting the systems behind recent automation and data work in a clearer format.
              </p>
            </article>
            <article class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-widest text-primary">Note</p>
              <h3 class="mt-3 text-xl font-bold">Collecting questions for the next essay</h3>
              <p class="mt-2 text-sm text-text-sub">
                If there is a topic you want covered, reach out and I will fold it into the roadmap.
              </p>
            </article>
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
