export const contactTemplate = `<!DOCTYPE html>
<html class="light" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Bruce Hart - Contact</title>
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
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Contact</p>
            <h1 class="text-4xl sm:text-5xl font-black tracking-tight">Start a conversation.</h1>
            <p class="text-lg text-text-sub max-w-2xl">
              I am always open to thoughtful collaborations, research ideas, and product challenges.
            </p>
          </div>
          <div class="mt-10 grid gap-6 md:grid-cols-2">
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 class="text-xl font-bold">Email</h3>
              <p class="mt-2 text-sm text-text-sub">
                The fastest way to reach me is email. I usually reply within a few days.
              </p>
              <a class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors" href="mailto:hello@bhart.org">
                hello@bhart.org
                <span class="material-symbols-outlined text-sm">north_east</span>
              </a>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 class="text-xl font-bold">Social</h3>
              <p class="mt-2 text-sm text-text-sub">
                Follow along for short updates and project notes.
              </p>
              <div class="mt-4 flex items-center gap-4 text-sm font-semibold">
                <a class="text-text-main hover:text-primary transition-colors" href="{{linkedin_url}}" rel="noreferrer" target="_blank">LinkedIn</a>
                <a class="text-text-main hover:text-primary transition-colors" href="{{github_url}}" rel="noreferrer" target="_blank">GitHub</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      {{> publicFooter}}
    </div>
  </body>
</html>
`;
