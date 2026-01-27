export const projectsTemplate = `<!DOCTYPE html>
<html class="light" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Bruce Hart - Projects</title>
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
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Projects</p>
            <h1 class="text-4xl sm:text-5xl font-black tracking-tight">Things I’m building in public.</h1>
            <p class="text-lg text-text-sub max-w-2xl">
              A running list of repos, experiments, and tools. Some are polished; some are glorified notebooks. If something sparks an idea, reach out.
            </p>
          </div>
          <h2 class="sr-only">Project list</h2>
          <div class="mt-10 grid gap-6 md:grid-cols-2">
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-widest text-primary">TypeScript</p>
                <span class="text-xs text-text-sub">Cloudflare Workers</span>
              </div>
              <div class="mt-3 flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-md border border-gray-100 bg-primary/10 text-primary">
                  <span aria-hidden="true" class="material-symbols-outlined text-[18px]">terminal</span>
                </div>
                <h3 class="text-xl font-bold">
                  <a class="hover:text-blue-700" href="https://bhart.org" rel="noreferrer">bhart.org blog</a>
                </h3>
              </div>
              <p class="mt-1 text-xs text-text-sub font-medium">Repo: <span class="font-mono">bhart-org</span></p>
              <p class="mt-2 text-sm text-text-sub">
                This site, built on top of Cloudflare Workers. Deliberately small. Slightly nerdy.
              </p>
              <div class="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-primary">
                <a class="inline-flex items-center gap-2 hover:text-blue-700" href="https://github.com/brucehart/bhart-org" rel="noreferrer">
                  <svg aria-hidden="true" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0.5C5.7 0.5 0.5 5.8 0.5 12.1c0 5.1 3.3 9.4 7.8 11 0.6 0.1 0.8-0.3 0.8-0.6v-2.2c-3.2 0.7-3.8-1.4-3.8-1.4-0.5-1.3-1.2-1.6-1.2-1.6-1-0.7 0.1-0.7 0.1-0.7 1.1 0.1 1.7 1.1 1.7 1.1 1 1.7 2.7 1.2 3.3 0.9 0.1-0.7 0.4-1.2 0.7-1.4-2.5-0.3-5.2-1.2-5.2-5.6 0-1.2 0.4-2.2 1.1-3-0.1-0.3-0.5-1.4 0.1-2.9 0 0 0.9-0.3 3 1.1 0.9-0.2 1.8-0.4 2.7-0.4 0.9 0 1.8 0.1 2.7 0.4 2.1-1.4 3-1.1 3-1.1 0.6 1.5 0.2 2.6 0.1 2.9 0.7 0.8 1.1 1.8 1.1 3 0 4.4-2.7 5.3-5.3 5.6 0.4 0.4 0.7 1 0.7 2.1v3.1c0 0.3 0.2 0.7 0.8 0.6 4.6-1.6 7.8-5.9 7.8-11C23.5 5.8 18.3 0.5 12 0.5z"/>
                  </svg>
                  GitHub
                </a>
                <a class="hover:text-blue-700" href="https://bhart.org" rel="noreferrer">Live</a>
              </div>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-widest text-primary">HTML</p>
                <span class="text-xs text-text-sub">Workers tools</span>
              </div>
              <div class="mt-3 flex items-center gap-3">
                <img class="h-8 w-8 rounded-md border border-gray-100 object-contain" src="/media/webtools.png" alt="Web Tools logo" />
                <h3 class="text-xl font-bold">
                  <a class="hover:text-blue-700" href="https://web-tools.bruce-hart.workers.dev/" rel="noreferrer">Web Tools</a>
                </h3>
              </div>
              <p class="mt-1 text-xs text-text-sub font-medium">Repo: <span class="font-mono">web-tools</span></p>
              <p class="mt-2 text-sm text-text-sub">
                Small browser tools that run in Cloudflare Workers. My love letter to “just ship the tiny thing.”
              </p>
              <div class="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-primary">
                <a class="inline-flex items-center gap-2 hover:text-blue-700" href="https://github.com/brucehart/web-tools" rel="noreferrer">
                  <svg aria-hidden="true" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0.5C5.7 0.5 0.5 5.8 0.5 12.1c0 5.1 3.3 9.4 7.8 11 0.6 0.1 0.8-0.3 0.8-0.6v-2.2c-3.2 0.7-3.8-1.4-3.8-1.4-0.5-1.3-1.2-1.6-1.2-1.6-1-0.7 0.1-0.7 0.1-0.7 1.1 0.1 1.7 1.1 1.7 1.1 1 1.7 2.7 1.2 3.3 0.9 0.1-0.7 0.4-1.2 0.7-1.4-2.5-0.3-5.2-1.2-5.2-5.6 0-1.2 0.4-2.2 1.1-3-0.1-0.3-0.5-1.4 0.1-2.9 0 0 0.9-0.3 3 1.1 0.9-0.2 1.8-0.4 2.7-0.4 0.9 0 1.8 0.1 2.7 0.4 2.1-1.4 3-1.1 3-1.1 0.6 1.5 0.2 2.6 0.1 2.9 0.7 0.8 1.1 1.8 1.1 3 0 4.4-2.7 5.3-5.3 5.6 0.4 0.4 0.7 1 0.7 2.1v3.1c0 0.3 0.2 0.7 0.8 0.6 4.6-1.6 7.8-5.9 7.8-11C23.5 5.8 18.3 0.5 12 0.5z"/>
                  </svg>
                  GitHub
                </a>
                <a class="hover:text-blue-700" href="https://web-tools.bruce-hart.workers.dev/" rel="noreferrer">Live</a>
              </div>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-widest text-primary">Python</p>
                <span class="text-xs text-text-sub">CLI workflow</span>
              </div>
              <h3 class="mt-3 text-xl font-bold">
                <a class="hover:text-blue-700" href="https://github.com/brucehart/codex-transcripts" rel="noreferrer"><span aria-hidden="true">📜</span> Codex Transcripts</a>
              </h3>
              <p class="mt-1 text-xs text-text-sub font-medium">Repo: <span class="font-mono">codex-transcripts</span></p>
              <p class="mt-2 text-sm text-text-sub">
                Converts Codex session JSONL files into clean, mobile-friendly HTML transcripts with optional gist publishing.
              </p>
              <div class="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-primary">
                <a class="inline-flex items-center gap-2 hover:text-blue-700" href="https://github.com/brucehart/codex-transcripts" rel="noreferrer">
                  <svg aria-hidden="true" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0.5C5.7 0.5 0.5 5.8 0.5 12.1c0 5.1 3.3 9.4 7.8 11 0.6 0.1 0.8-0.3 0.8-0.6v-2.2c-3.2 0.7-3.8-1.4-3.8-1.4-0.5-1.3-1.2-1.6-1.2-1.6-1-0.7 0.1-0.7 0.1-0.7 1.1 0.1 1.7 1.1 1.7 1.1 1 1.7 2.7 1.2 3.3 0.9 0.1-0.7 0.4-1.2 0.7-1.4-2.5-0.3-5.2-1.2-5.2-5.6 0-1.2 0.4-2.2 1.1-3-0.1-0.3-0.5-1.4 0.1-2.9 0 0 0.9-0.3 3 1.1 0.9-0.2 1.8-0.4 2.7-0.4 0.9 0 1.8 0.1 2.7 0.4 2.1-1.4 3-1.1 3-1.1 0.6 1.5 0.2 2.6 0.1 2.9 0.7 0.8 1.1 1.8 1.1 3 0 4.4-2.7 5.3-5.3 5.6 0.4 0.4 0.7 1 0.7 2.1v3.1c0 0.3 0.2 0.7 0.8 0.6 4.6-1.6 7.8-5.9 7.8-11C23.5 5.8 18.3 0.5 12 0.5z"/>
                  </svg>
                  GitHub
                </a>
              </div>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-widest text-primary">Rust</p>
                <span class="text-xs text-text-sub">CLI + data</span>
              </div>
              <h3 class="mt-3 text-xl font-bold">
                <a class="hover:text-blue-700" href="https://github.com/brucehart/harlite" rel="noreferrer"><span aria-hidden="true">🗄️</span> harlite</a>
              </h3>
              <p class="mt-1 text-xs text-text-sub font-medium">Repo: <span class="font-mono">harlite</span></p>
              <p class="mt-2 text-sm text-text-sub">
                Import HAR (HTTP Archive) files into SQLite, then query web traffic with plain SQL.
              </p>
              <div class="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-primary">
                <a class="inline-flex items-center gap-2 hover:text-blue-700" href="https://github.com/brucehart/harlite" rel="noreferrer">
                  <svg aria-hidden="true" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0.5C5.7 0.5 0.5 5.8 0.5 12.1c0 5.1 3.3 9.4 7.8 11 0.6 0.1 0.8-0.3 0.8-0.6v-2.2c-3.2 0.7-3.8-1.4-3.8-1.4-0.5-1.3-1.2-1.6-1.2-1.6-1-0.7 0.1-0.7 0.1-0.7 1.1 0.1 1.7 1.1 1.7 1.1 1 1.7 2.7 1.2 3.3 0.9 0.1-0.7 0.4-1.2 0.7-1.4-2.5-0.3-5.2-1.2-5.2-5.6 0-1.2 0.4-2.2 1.1-3-0.1-0.3-0.5-1.4 0.1-2.9 0 0 0.9-0.3 3 1.1 0.9-0.2 1.8-0.4 2.7-0.4 0.9 0 1.8 0.1 2.7 0.4 2.1-1.4 3-1.1 3-1.1 0.6 1.5 0.2 2.6 0.1 2.9 0.7 0.8 1.1 1.8 1.1 3 0 4.4-2.7 5.3-5.3 5.6 0.4 0.4 0.7 1 0.7 2.1v3.1c0 0.3 0.2 0.7 0.8 0.6 4.6-1.6 7.8-5.9 7.8-11C23.5 5.8 18.3 0.5 12 0.5z"/>
                  </svg>
                  GitHub
                </a>
              </div>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-widest text-primary">TypeScript</p>
                <span class="text-xs text-text-sub">AI + automation</span>
              </div>
              <div class="mt-3 flex items-center gap-3">
                <img class="h-8 w-8 rounded-md border border-gray-100 object-contain" src="/media/Celebrity-Death-Bot.png" alt="Celebrity Death Bot logo" />
                <h3 class="text-xl font-bold">
                  <a class="hover:text-blue-700" href="https://celebritydeathbot.com" rel="noreferrer">Celebrity Death Bot</a>
                </h3>
              </div>
              <p class="mt-1 text-xs text-text-sub font-medium">Repo: <span class="font-mono">celebrity-death-bot</span></p>
              <p class="mt-2 text-sm text-text-sub">
                Watches Wikipedia for notable deaths, filters them, and publishes concise memorial posts via a public JSON API.
              </p>
              <div class="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-primary">
                <a class="inline-flex items-center gap-2 hover:text-blue-700" href="https://github.com/brucehart/celebrity-death-bot" rel="noreferrer">
                  <svg aria-hidden="true" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0.5C5.7 0.5 0.5 5.8 0.5 12.1c0 5.1 3.3 9.4 7.8 11 0.6 0.1 0.8-0.3 0.8-0.6v-2.2c-3.2 0.7-3.8-1.4-3.8-1.4-0.5-1.3-1.2-1.6-1.2-1.6-1-0.7 0.1-0.7 0.1-0.7 1.1 0.1 1.7 1.1 1.7 1.1 1 1.7 2.7 1.2 3.3 0.9 0.1-0.7 0.4-1.2 0.7-1.4-2.5-0.3-5.2-1.2-5.2-5.6 0-1.2 0.4-2.2 1.1-3-0.1-0.3-0.5-1.4 0.1-2.9 0 0 0.9-0.3 3 1.1 0.9-0.2 1.8-0.4 2.7-0.4 0.9 0 1.8 0.1 2.7 0.4 2.1-1.4 3-1.1 3-1.1 0.6 1.5 0.2 2.6 0.1 2.9 0.7 0.8 1.1 1.8 1.1 3 0 4.4-2.7 5.3-5.3 5.6 0.4 0.4 0.7 1 0.7 2.1v3.1c0 0.3 0.2 0.7 0.8 0.6 4.6-1.6 7.8-5.9 7.8-11C23.5 5.8 18.3 0.5 12 0.5z"/>
                  </svg>
                  GitHub
                </a>
                <a class="hover:text-blue-700" href="https://celebritydeathbot.com" rel="noreferrer">Live</a>
              </div>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-widest text-primary">Docs</p>
                <span class="text-xs text-text-sub">Codex CLI</span>
              </div>
              <h3 class="mt-3 text-xl font-bold">
                <a class="hover:text-blue-700" href="https://github.com/brucehart/codex-prompts" rel="noreferrer"><span aria-hidden="true">⌨️</span> Codex CLI Prompts</a>
              </h3>
              <p class="mt-1 text-xs text-text-sub font-medium">Repo: <span class="font-mono">codex-prompts</span></p>
              <p class="mt-2 text-sm text-text-sub">
                Custom Codex CLI prompts that register as slash commands for API docs, commits, PRs, refactors, and tests.
              </p>
              <div class="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-primary">
                <a class="inline-flex items-center gap-2 hover:text-blue-700" href="https://github.com/brucehart/codex-prompts" rel="noreferrer">
                  <svg aria-hidden="true" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0.5C5.7 0.5 0.5 5.8 0.5 12.1c0 5.1 3.3 9.4 7.8 11 0.6 0.1 0.8-0.3 0.8-0.6v-2.2c-3.2 0.7-3.8-1.4-3.8-1.4-0.5-1.3-1.2-1.6-1.2-1.6-1-0.7 0.1-0.7 0.1-0.7 1.1 0.1 1.7 1.1 1.7 1.1 1 1.7 2.7 1.2 3.3 0.9 0.1-0.7 0.4-1.2 0.7-1.4-2.5-0.3-5.2-1.2-5.2-5.6 0-1.2 0.4-2.2 1.1-3-0.1-0.3-0.5-1.4 0.1-2.9 0 0 0.9-0.3 3 1.1 0.9-0.2 1.8-0.4 2.7-0.4 0.9 0 1.8 0.1 2.7 0.4 2.1-1.4 3-1.1 3-1.1 0.6 1.5 0.2 2.6 0.1 2.9 0.7 0.8 1.1 1.8 1.1 3 0 4.4-2.7 5.3-5.3 5.6 0.4 0.4 0.7 1 0.7 2.1v3.1c0 0.3 0.2 0.7 0.8 0.6 4.6-1.6 7.8-5.9 7.8-11C23.5 5.8 18.3 0.5 12 0.5z"/>
                  </svg>
                  GitHub
                </a>
              </div>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-widest text-primary">TypeScript</p>
                <span class="text-xs text-text-sub">Storytelling</span>
              </div>
              <div class="mt-3 flex items-center gap-3">
                <img class="h-8 w-8 rounded-md border border-gray-100 object-contain" src="/media/bedtime-stories-icon.png" alt="Bedtime Stories logo" />
                <h3 class="text-xl font-bold">
                  <a class="hover:text-blue-700" href="https://bedtimestories.bruce-hart.workers.dev/" rel="noreferrer">Bedtime Stories</a>
                </h3>
              </div>
              <p class="mt-1 text-xs text-text-sub font-medium">Repo: <span class="font-mono">bedtimestories</span></p>
              <p class="mt-2 text-sm text-text-sub">
                Cloudflare Worker that serves LLM-generated bedtime stories for my kids. Occasionally it surprises us (in a good way).
              </p>
              <div class="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-primary">
                <a class="inline-flex items-center gap-2 hover:text-blue-700" href="https://github.com/brucehart/bedtimestories" rel="noreferrer">
                  <svg aria-hidden="true" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0.5C5.7 0.5 0.5 5.8 0.5 12.1c0 5.1 3.3 9.4 7.8 11 0.6 0.1 0.8-0.3 0.8-0.6v-2.2c-3.2 0.7-3.8-1.4-3.8-1.4-0.5-1.3-1.2-1.6-1.2-1.6-1-0.7 0.1-0.7 0.1-0.7 1.1 0.1 1.7 1.1 1.7 1.1 1 1.7 2.7 1.2 3.3 0.9 0.1-0.7 0.4-1.2 0.7-1.4-2.5-0.3-5.2-1.2-5.2-5.6 0-1.2 0.4-2.2 1.1-3-0.1-0.3-0.5-1.4 0.1-2.9 0 0 0.9-0.3 3 1.1 0.9-0.2 1.8-0.4 2.7-0.4 0.9 0 1.8 0.1 2.7 0.4 2.1-1.4 3-1.1 3-1.1 0.6 1.5 0.2 2.6 0.1 2.9 0.7 0.8 1.1 1.8 1.1 3 0 4.4-2.7 5.3-5.3 5.6 0.4 0.4 0.7 1 0.7 2.1v3.1c0 0.3 0.2 0.7 0.8 0.6 4.6-1.6 7.8-5.9 7.8-11C23.5 5.8 18.3 0.5 12 0.5z"/>
                  </svg>
                  GitHub
                </a>
                <a class="hover:text-blue-700" href="https://bedtimestories.bruce-hart.workers.dev/" rel="noreferrer">Live</a>
              </div>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-widest text-primary">JavaScript</p>
                <span class="text-xs text-text-sub">Browser tweaks</span>
              </div>
              <h3 class="mt-3 text-xl font-bold">
                <a class="hover:text-blue-700" href="https://github.com/brucehart/userscripts" rel="noreferrer"><span aria-hidden="true">🐒</span> Userscripts</a>
              </h3>
              <p class="mt-1 text-xs text-text-sub font-medium">Repo: <span class="font-mono">userscripts</span></p>
              <p class="mt-2 text-sm text-text-sub">
                Personal userscripts for Tampermonkey. Small sandpaper for rough edges on the web.
              </p>
              <div class="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-primary">
                <a class="inline-flex items-center gap-2 hover:text-blue-700" href="https://github.com/brucehart/userscripts" rel="noreferrer">
                  <svg aria-hidden="true" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0.5C5.7 0.5 0.5 5.8 0.5 12.1c0 5.1 3.3 9.4 7.8 11 0.6 0.1 0.8-0.3 0.8-0.6v-2.2c-3.2 0.7-3.8-1.4-3.8-1.4-0.5-1.3-1.2-1.6-1.2-1.6-1-0.7 0.1-0.7 0.1-0.7 1.1 0.1 1.7 1.1 1.7 1.1 1 1.7 2.7 1.2 3.3 0.9 0.1-0.7 0.4-1.2 0.7-1.4-2.5-0.3-5.2-1.2-5.2-5.6 0-1.2 0.4-2.2 1.1-3-0.1-0.3-0.5-1.4 0.1-2.9 0 0 0.9-0.3 3 1.1 0.9-0.2 1.8-0.4 2.7-0.4 0.9 0 1.8 0.1 2.7 0.4 2.1-1.4 3-1.1 3-1.1 0.6 1.5 0.2 2.6 0.1 2.9 0.7 0.8 1.1 1.8 1.1 3 0 4.4-2.7 5.3-5.3 5.6 0.4 0.4 0.7 1 0.7 2.1v3.1c0 0.3 0.2 0.7 0.8 0.6 4.6-1.6 7.8-5.9 7.8-11C23.5 5.8 18.3 0.5 12 0.5z"/>
                  </svg>
                  GitHub
                </a>
              </div>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-widest text-primary">JavaScript</p>
                <span class="text-xs text-text-sub">Puzzle game</span>
              </div>
              <div class="mt-3 flex items-center gap-3">
                <img class="h-8 w-8 rounded-md border border-gray-100 object-contain" src="/media/pokerboom-logo.png" alt="Poker Boom logo" />
                <h3 class="text-xl font-bold">
                  <a class="hover:text-blue-700" href="https://github.com/brucehart/pokerboom" rel="noreferrer">Poker Boom</a>
                </h3>
              </div>
              <p class="mt-1 text-xs text-text-sub font-medium">Repo: <span class="font-mono">pokerboom</span></p>
              <p class="mt-2 text-sm text-text-sub">
                Web-based puzzle game: pick five adjacent cards to make poker hands, clear the board, and dodge ticking bombs.
              </p>
              <div class="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-primary">
                <a class="inline-flex items-center gap-2 hover:text-blue-700" href="https://github.com/brucehart/pokerboom" rel="noreferrer">
                  <svg aria-hidden="true" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0.5C5.7 0.5 0.5 5.8 0.5 12.1c0 5.1 3.3 9.4 7.8 11 0.6 0.1 0.8-0.3 0.8-0.6v-2.2c-3.2 0.7-3.8-1.4-3.8-1.4-0.5-1.3-1.2-1.6-1.2-1.6-1-0.7 0.1-0.7 0.1-0.7 1.1 0.1 1.7 1.1 1.7 1.1 1 1.7 2.7 1.2 3.3 0.9 0.1-0.7 0.4-1.2 0.7-1.4-2.5-0.3-5.2-1.2-5.2-5.6 0-1.2 0.4-2.2 1.1-3-0.1-0.3-0.5-1.4 0.1-2.9 0 0 0.9-0.3 3 1.1 0.9-0.2 1.8-0.4 2.7-0.4 0.9 0 1.8 0.1 2.7 0.4 2.1-1.4 3-1.1 3-1.1 0.6 1.5 0.2 2.6 0.1 2.9 0.7 0.8 1.1 1.8 1.1 3 0 4.4-2.7 5.3-5.3 5.6 0.4 0.4 0.7 1 0.7 2.1v3.1c0 0.3 0.2 0.7 0.8 0.6 4.6-1.6 7.8-5.9 7.8-11C23.5 5.8 18.3 0.5 12 0.5z"/>
                  </svg>
                  GitHub
                </a>
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
