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
      <main class="flex-grow" id="main-content">
        <section class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div class="flex flex-col gap-4">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Contact</p>
            <h1 class="text-4xl sm:text-5xl font-black tracking-tight">Start a conversation.</h1>
            <p class="text-lg text-text-sub max-w-2xl">
              If you’ve got a problem worth chewing on—product, research, or a weird automation itch—send a note.
            </p>
          </div>
          <h2 class="sr-only">Contact options</h2>
          <div class="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 class="text-xl font-bold">Send a note</h3>
              <p class="mt-2 text-sm text-text-sub">
                If there’s something worth building or exploring, I’d love to hear the shape of it. A little context goes a long way.
              </p>
              {{#contact_notice_success}}
              <div aria-live="polite" class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
                {{contact_notice_message}}
              </div>
              {{/contact_notice_success}}
              {{#contact_notice_error}}
              <div aria-live="assertive" class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900" role="alert">
                {{contact_notice_message}}
              </div>
              {{/contact_notice_error}}
              <form class="mt-6 grid gap-4" action="/contact" method="post">
                <input type="hidden" name="form_started_at" value="{{contact_started_at}}" />
                <label aria-hidden="true" class="hidden">
                  Leave this field empty
                  <input aria-hidden="true" type="text" name="company" tabindex="-1" autocomplete="off" />
                </label>
                <label class="grid gap-2 text-sm font-semibold text-text-main">
                  From
                  <input class="h-11 rounded-lg border border-border-light px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" type="email" name="from" placeholder="you@example.com" value="{{contact_from}}" required autocomplete="email" />
                </label>
                <label class="grid gap-2 text-sm font-semibold text-text-main">
                  Subject
                  <input class="h-11 rounded-lg border border-border-light px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" type="text" name="subject" placeholder="What is on your mind?" value="{{contact_subject}}" required />
                </label>
                <label class="grid gap-2 text-sm font-semibold text-text-main">
                  Message
                  <textarea class="min-h-[140px] rounded-lg border border-border-light px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" name="message" placeholder="A few details go a long way." required>{{contact_message}}</textarea>
                </label>
                <button class="mt-2 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors" type="submit">
                  Send message
                </button>
              </form>
            </div>
            <div class="flex flex-col gap-6">
              <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 class="text-xl font-bold">Email</h3>
                <p class="mt-2 text-sm text-text-sub">
                  Email is still undefeated. I usually reply within a few days.
                </p>
                <a class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors" href="mailto:bruce@bhart.org">
                  bruce@bhart.org
                  <span aria-hidden="true" class="material-symbols-outlined text-sm">north_east</span>
                </a>
              </div>
              <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 class="text-xl font-bold">Social</h3>
                <p class="mt-2 text-sm text-text-sub">
                  If you want the short version, I post small updates here.
                </p>
                <div class="mt-4 flex items-center gap-4 text-sm font-semibold">
                  <a class="text-text-main hover:text-primary transition-colors" href="{{linkedin_url}}" rel="noreferrer" target="_blank">LinkedIn</a>
                  <a class="text-text-main hover:text-primary transition-colors" href="{{github_url}}" rel="noreferrer" target="_blank">GitHub</a>
                </div>
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
