export const templates = {
  home: `<!DOCTYPE html>
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
      <header class="sticky top-0 z-50 w-full border-b border-[#e7ebf3] bg-background-light/80 backdrop-blur-md">
        <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <span class="material-symbols-outlined text-[20px]">terminal</span>
            </div>
            <a class="text-xl font-bold tracking-tight text-text-main" href="/">bhart.org</a>
          </div>
          <nav class="hidden md:flex items-center gap-8">
            <a class="text-sm font-medium text-primary" href="/">Home</a>
            <a class="text-sm font-medium text-text-main hover:text-primary transition-colors" href="/about">About</a>
          </nav>
          <div class="flex items-center gap-4">
            <button class="hidden sm:flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
              Subscribe
            </button>
          </div>
        </div>
      </header>
      <main class="flex-grow">
        <section class="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div
            class="absolute inset-0 pointer-events-none opacity-[0.03]"
            style="background-image: radial-gradient(#135bec 1px, transparent 1px); background-size: 32px 32px;"
          ></div>
          <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <div class="flex flex-col gap-6 max-w-2xl">
                {{#hero}}
                <div class="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                  <span class="relative flex h-2 w-2">
                    <span class="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Latest Post: {{title}}
                </div>
                {{/hero}}
                <h1 class="text-5xl sm:text-6xl font-black tracking-tight text-text-main leading-[1.1]">
                  Bruce Hart
                </h1>
                <p class="text-xl sm:text-2xl text-text-sub font-light leading-relaxed">
                  Exploring the intersection of <span class="text-primary font-medium">Artificial Intelligence</span>, Technology, and Human Interest.
                </p>
                <div class="flex flex-wrap gap-4 pt-2">
                  {{#hero}}
                  <a href="{{url}}" class="flex items-center gap-2 rounded-lg bg-text-main px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity">
                    Start Reading
                    <span class="material-symbols-outlined text-sm">arrow_forward</span>
                  </a>
                  {{/hero}}
                  <a href="/about" class="flex items-center gap-2 rounded-lg border border-gray-200 bg-transparent px-6 py-3 text-sm font-bold text-text-main hover:bg-gray-50 transition-colors">
                    More About Me
                  </a>
                </div>
              </div>
              <div class="relative hidden lg:block h-full min-h-[400px]">
                <div class="absolute right-0 top-1/2 -translate-y-1/2 w-4/5 aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-transparent rotate-3 backdrop-blur-sm"></div>
                <div class="absolute right-4 top-1/2 -translate-y-1/2 w-4/5 aspect-square rounded-2xl bg-gradient-to-tr from-primary/10 to-transparent -rotate-2 backdrop-blur-sm"></div>
                <div class="absolute right-2 top-1/2 -translate-y-1/2 w-4/5 aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 rotate-0 bg-white border border-gray-100 p-2">
                  <div class="w-full h-full bg-cover bg-center rounded-xl" style="background-image: url('{{hero_image}}');"></div>
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
          <div class="mt-16 flex flex-col items-center justify-between gap-8 md:flex-row">
            <div class="flex items-center gap-2">
              <div class="flex h-6 w-6 items-center justify-center rounded bg-primary text-white text-xs">
                <span class="material-symbols-outlined text-[14px]">terminal</span>
              </div>
              <p class="text-sm font-semibold text-text-main">bhart.org</p>
            </div>
            <p class="text-xs text-text-sub">(c) 2024 Bruce Hart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  </body>
</html>
`,
  about: `<!DOCTYPE html>
<html class="light" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Bruce Hart - About</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Noto+Sans:wght@400;500;700&display=swap"
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
              "text-light": "#0d121b",
              "text-dark": "#ffffff",
              "muted-light": "#4c669a",
              "muted-dark": "#94a3b8",
              "border-light": "#e7ebf3",
              "border-dark": "#2d3748"
            },
            fontFamily: {
              display: ["Space Grotesk", "sans-serif"],
              body: ["Noto Sans", "sans-serif"]
            },
            borderRadius: {
              DEFAULT: "0.25rem",
              lg: "0.5rem",
              xl: "0.75rem",
              full: "9999px"
            }
          }
        }
      };
    </script>
    <style>
      body {
        font-family: "Noto Sans", sans-serif;
      }
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      .font-display {
        font-family: "Space Grotesk", sans-serif;
      }
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
    </style>
  </head>
  <body class="bg-background-light text-text-light transition-colors duration-200">
    <div class="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <header class="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-border-light bg-background-light/90 backdrop-blur-sm px-6 py-4 lg:px-40">
        <div class="flex items-center gap-4 text-text-light">
          <div class="size-8 flex items-center justify-center text-primary">
            <span class="material-symbols-outlined !text-[32px]">terminal</span>
          </div>
          <h2 class="text-xl font-bold leading-tight tracking-[-0.015em] font-display">Bruce Hart</h2>
        </div>
        <div class="hidden md:flex flex-1 justify-end gap-8">
          <nav class="flex items-center gap-9">
            <a class="text-text-light text-sm font-medium leading-normal hover:text-primary transition-colors" href="/">Home</a>
            <a class="text-primary text-sm font-bold leading-normal" href="/about">About</a>
          </nav>
        </div>
        <div class="md:hidden flex items-center text-text-light">
          <span class="material-symbols-outlined cursor-pointer">menu</span>
        </div>
      </header>
      <main class="layout-container flex h-full grow flex-col items-center">
        <section class="w-full max-w-[960px] px-6 lg:px-0 py-12 lg:py-20">
          <div class="@container">
            <div class="flex flex-col-reverse gap-10 lg:gap-16 lg:flex-row items-center">
              <div class="flex flex-col gap-6 flex-1 text-center lg:text-left">
                <div class="flex flex-col gap-4">
                  <h1 class="text-text-light text-4xl lg:text-6xl font-black leading-tight tracking-[-0.033em] font-display">
                    Hi, I'm Bruce.
                  </h1>
                  <p class="text-muted-light text-lg lg:text-xl font-normal leading-relaxed max-w-[600px] mx-auto lg:mx-0">
                    I bridge the gap between humanity and artificial intelligence. Welcome to my digital garden where I explore AI, technology, and life.
                  </p>
                </div>
                <div class="flex gap-4 justify-center lg:justify-start pt-2">
                  <a class="flex items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-primary/90 text-white text-base font-bold leading-normal transition-all shadow-lg shadow-primary/20" href="mailto:hello@bhart.org">
                    Get in Touch
                  </a>
                  <a class="flex items-center justify-center rounded-lg h-12 px-6 bg-transparent border border-border-light text-text-light hover:bg-black/5 text-base font-bold leading-normal transition-all" href="/">
                    Read my Blog
                  </a>
                </div>
              </div>
              <div class="w-full max-w-[400px] lg:w-1/2 aspect-square lg:aspect-[4/5] relative group">
                <div class="absolute inset-0 bg-primary rounded-xl translate-x-2 translate-y-2 lg:translate-x-4 lg:translate-y-4 opacity-20 transition-transform group-hover:translate-x-3 group-hover:translate-y-3"></div>
                <div
                  class="relative h-full w-full bg-center bg-no-repeat bg-cover rounded-xl border border-border-light shadow-sm overflow-hidden"
                  style="background-image: url('https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=800&q=80');"
                ></div>
              </div>
            </div>
          </div>
        </section>
        <section class="w-full bg-white py-16 w-screen flex justify-center">
          <div class="max-w-[960px] w-full px-6 lg:px-0">
            <div class="flex flex-col gap-10">
              <div class="flex flex-col gap-4 text-center lg:text-left">
                <h2 class="text-text-light text-3xl lg:text-4xl font-bold leading-tight tracking-tight font-display">
                  Core Interests
                </h2>
                <p class="text-muted-light text-base lg:text-lg font-normal max-w-[720px] mx-auto lg:mx-0">
                  My work and hobbies revolve around three pillars, creating a synergy between logic and creativity.
                </p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="flex flex-col gap-4 rounded-xl border border-border-light bg-background-light p-6 transition-transform hover:-translate-y-1 hover:shadow-md">
                  <div class="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-3xl">psychology</span>
                  </div>
                  <div class="flex flex-col gap-2">
                    <h3 class="text-text-light text-xl font-bold font-display">Artificial Intelligence</h3>
                    <p class="text-muted-light text-sm leading-relaxed">
                      Exploring LLMs, Generative Art, and automation workflows that enhance human productivity.
                    </p>
                  </div>
                </div>
                <div class="flex flex-col gap-4 rounded-xl border border-border-light bg-background-light p-6 transition-transform hover:-translate-y-1 hover:shadow-md">
                  <div class="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-3xl">memory</span>
                  </div>
                  <div class="flex flex-col gap-2">
                    <h3 class="text-text-light text-xl font-bold font-display">Technology</h3>
                    <p class="text-muted-light text-sm leading-relaxed">
                      Deep diving into modern web development, testing new gadgets, and advocating for clean coding practices.
                    </p>
                  </div>
                </div>
                <div class="flex flex-col gap-4 rounded-xl border border-border-light bg-background-light p-6 transition-transform hover:-translate-y-1 hover:shadow-md">
                  <div class="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-3xl">photo_camera</span>
                  </div>
                  <div class="flex flex-col gap-2">
                    <h3 class="text-text-light text-xl font-bold font-display">Personal Pursuits</h3>
                    <p class="text-muted-light text-sm leading-relaxed">
                      Unplugging with long hikes, capturing candid moments through photography, and brewing the perfect coffee.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section class="w-full max-w-[960px] px-6 lg:px-0 py-16">
          <div class="grid lg:grid-cols-[1fr_1fr] gap-12">
            <div class="flex flex-col gap-6">
              <h2 class="text-text-light text-3xl font-bold font-display">Career Timeline</h2>
              <p class="text-muted-light leading-relaxed">
                Experienced engineering leader with a history of delivering innovative technical solutions and solving hard problems. Delivers growth through strong technical performance, team mentorship, and trusted customer relationships. Specializes in the development of complex cyber capabilities targeting embedded systems and communications networks. Background in digital signal processing, algorithm design, and software engineering.
              </p>
              <div class="h-56 w-full rounded-xl overflow-hidden relative bg-white border border-border-light" data-alt="Abstract signal flow visualization">
                <div
                  class="absolute inset-0"
                  style="background-image: radial-gradient(circle at 20% 20%, rgba(19, 91, 236, 0.18), transparent 55%), radial-gradient(circle at 80% 30%, rgba(19, 91, 236, 0.12), transparent 50%), linear-gradient(135deg, rgba(13, 18, 27, 0.06), rgba(13, 18, 27, 0));"
                ></div>
                <div class="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
                <div class="relative h-full w-full p-6 flex flex-col justify-end gap-2">
                  <p class="text-text-light text-sm font-semibold">Focus Areas</p>
                  <p class="text-muted-light text-xs">Offensive cyber operations, PNT, ISR, embedded systems, and DSP.</p>
                </div>
              </div>
              <div class="rounded-xl border border-border-light bg-white p-6">
                <h3 class="text-text-light text-lg font-bold font-display mb-4">Skills &amp; Tools</h3>
                <div class="flex flex-col gap-4">
                  <div class="flex flex-col gap-3">
                    <p class="text-xs font-semibold uppercase tracking-wider text-muted-light">Software Engineering</p>
                    <div class="flex flex-wrap gap-2">
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">C</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">C++</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">Python</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">C#</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">Java</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">Qt</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">Networking</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">Device Drivers</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">Embedded Linux</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">Assembly (ARM, x86, MIPS, PowerPC)</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">Windows Internals</span>
                    </div>
                  </div>
                  <div class="flex flex-col gap-3">
                    <p class="text-xs font-semibold uppercase tracking-wider text-muted-light">Digital Signal Processing</p>
                    <div class="flex flex-wrap gap-2">
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">MATLAB</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">GNU Radio</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">Software Defined Radio</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">USRP</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">OpenCPI</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-[40px_1fr] gap-x-4">
              <div class="flex flex-col items-center gap-1 pt-1">
                <div class="text-primary bg-background-light z-10">
                  <span class="material-symbols-outlined">science</span>
                </div>
                <div class="w-[2px] bg-border-light h-full grow"></div>
              </div>
              <div class="flex flex-col pb-8">
                <p class="text-text-light text-lg font-bold leading-normal font-display">Chief Scientist - Special Programs, KBR</p>
                <p class="text-primary text-sm font-medium mb-2">05/2024 - Present</p>
                <ul class="text-muted-light text-sm leading-relaxed list-disc pl-4">
                  <li>Develops technical approach to programs focused on offensive cyber operations, PNT capabilities, and advanced ISR.</li>
                  <li>Provides program management support, technical strategy, and proposal development.</li>
                </ul>
              </div>
              <div class="flex flex-col items-center gap-1">
                <div class="w-[2px] bg-border-light h-4"></div>
                <div class="text-muted-light">
                  <span class="material-symbols-outlined">analytics</span>
                </div>
                <div class="w-[2px] bg-border-light h-full grow"></div>
              </div>
              <div class="flex flex-col pb-8 pt-4">
                <p class="text-text-light text-lg font-bold leading-normal font-display">Senior Director - Cyber Analytics, KBR</p>
                <p class="text-muted-light text-sm font-medium mb-2">09/2020 - 05/2024</p>
              </div>
              <div class="flex flex-col items-center gap-1">
                <div class="w-[2px] bg-border-light h-4"></div>
                <div class="text-muted-light">
                  <span class="material-symbols-outlined">leaderboard</span>
                </div>
                <div class="w-[2px] bg-border-light h-full grow"></div>
              </div>
              <div class="flex flex-col pb-8 pt-4">
                <p class="text-text-light text-lg font-bold leading-normal font-display">Vice President - Cyber Analytics, Centauri</p>
                <p class="text-muted-light text-sm font-medium mb-2">12/2019 - 09/2020</p>
                <ul class="text-muted-light text-sm leading-relaxed list-disc pl-4">
                  <li>Division lead for Cyber Operations, Cyber Engineering, and Trusted Microelectronics sectors.</li>
                  <li>Oversaw operations, program execution, program management, and new business development.</li>
                </ul>
              </div>
              <div class="flex flex-col items-center gap-1">
                <div class="w-[2px] bg-border-light h-4"></div>
                <div class="text-muted-light">
                  <span class="material-symbols-outlined">memory</span>
                </div>
                <div class="w-[2px] bg-border-light h-full grow"></div>
              </div>
              <div class="flex flex-col pb-8 pt-4">
                <p class="text-text-light text-lg font-bold leading-normal font-display">Chief Technology Officer, PreTalen</p>
                <p class="text-muted-light text-sm font-medium mb-2">01/2016 - 12/2019</p>
                <ul class="text-muted-light text-sm leading-relaxed list-disc pl-4">
                  <li>Led PreTalen's technical efforts in offensive cyber capabilities development and PNT-related technologies, including breakthrough classified cyber technology currently deployed by a DoD customer.</li>
                  <li>Oversaw significant growth and established PreTalen as a technical leader in key markets.</li>
                  <li>Helped guide PreTalen through acquisition by Centauri in December 2019.</li>
                </ul>
              </div>
              <div class="flex flex-col items-center gap-1">
                <div class="w-[2px] bg-border-light h-4"></div>
                <div class="text-muted-light">
                  <span class="material-symbols-outlined">code</span>
                </div>
                <div class="w-[2px] bg-border-light h-full grow"></div>
              </div>
              <div class="flex flex-col pb-8 pt-4">
                <p class="text-text-light text-lg font-bold leading-normal font-display">Senior Software Engineer, NDC Technologies</p>
                <p class="text-muted-light text-sm font-medium mb-2">05/2013 - 01/2016</p>
                <ul class="text-muted-light text-sm leading-relaxed list-disc pl-4">
                  <li>Primary embedded software developer for an ultrasonic measurement system.</li>
                  <li>Led development of a common platform introducing market-leading web-based interfaces across the product range.</li>
                  <li>Responsible for long-term R&amp;D planning and engineering analysis of new product platforms.</li>
                </ul>
              </div>
              <div class="flex flex-col items-center gap-1">
                <div class="w-[2px] bg-border-light h-4"></div>
                <div class="text-muted-light">
                  <span class="material-symbols-outlined">query_stats</span>
                </div>
                <div class="w-[2px] bg-border-light h-full grow"></div>
              </div>
              <div class="flex flex-col pb-8 pt-4">
                <p class="text-text-light text-lg font-bold leading-normal font-display">Senior Member of R&amp;D Staff, GIRD Systems</p>
                <p class="text-muted-light text-sm font-medium mb-2">05/2004 - 05/2013</p>
                <ul class="text-muted-light text-sm leading-relaxed list-disc pl-4">
                  <li>Technical lead for programs developing new digital signal processing technologies in electronic warfare, array processing, geolocation, and interference mitigation.</li>
                  <li>Principal investigator for 15 technical programs in signal processing research totaling over $5M in Department of Defense funding (Army, Air Force, Navy).</li>
                </ul>
              </div>
              <div class="flex flex-col items-center gap-1">
                <div class="w-[2px] bg-border-light h-4"></div>
                <div class="text-muted-light">
                  <span class="material-symbols-outlined">terminal</span>
                </div>
                <div class="w-[2px] bg-border-light h-full grow"></div>
              </div>
              <div class="flex flex-col pb-8 pt-4">
                <p class="text-text-light text-lg font-bold leading-normal font-display">Software Engineer, University of Dayton Research Institute</p>
                <p class="text-muted-light text-sm font-medium mb-2">07/1999 - 05/2004</p>
                <ul class="text-muted-light text-sm leading-relaxed list-disc pl-4">
                  <li>Developed data-driven (ASP/SQL Server) websites for university and external customers.</li>
                  <li>Created a Java-based graphical user interface for a wide-ranging logistics program for AFRL/RH (711th Human Performance Wing).</li>
                </ul>
              </div>
              <div class="flex flex-col items-center gap-1">
                <div class="w-[2px] bg-border-light h-4"></div>
                <div class="text-muted-light">
                  <span class="material-symbols-outlined">school</span>
                </div>
                <div class="w-[2px] bg-border-light h-full grow"></div>
              </div>
              <div class="flex flex-col pb-8 pt-4">
                <p class="text-text-light text-lg font-bold leading-normal font-display">MS - Electrical Engineering, University of Dayton</p>
                <p class="text-muted-light text-sm font-medium mb-2">05/2004</p>
                <p class="text-muted-light text-sm leading-relaxed">Concentrations in Digital Signal Processing and Software Engineering.</p>
              </div>
              <div class="flex flex-col items-center gap-1 pb-1">
                <div class="w-[2px] bg-border-light h-4"></div>
                <div class="text-muted-light">
                  <span class="material-symbols-outlined">school</span>
                </div>
              </div>
              <div class="flex flex-col pt-4">
                <p class="text-text-light text-lg font-bold leading-normal font-display">BEE - Electrical Engineering, University of Dayton</p>
                <p class="text-muted-light text-sm font-medium mb-2">05/2003</p>
                <p class="text-muted-light text-sm leading-relaxed">Concentration in Computer Engineering.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </body>
</html>
`,
  article: `<!DOCTYPE html>
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
          <div class="hidden md:flex items-center gap-8">
            <a class="text-sm font-medium hover:text-primary transition-colors" href="/">Home</a>
            <a class="text-sm font-medium text-primary" href="/">Articles</a>
            <a class="text-sm font-medium hover:text-primary transition-colors" href="/about">About</a>
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
`,
  adminList: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Admin - Posts</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries,typography"></script>
    <script id="tailwind-config">
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: "#135bec",
              "background-light": "#f6f6f8",
              "text-main": "#0d121b",
              "text-sub": "#4c669a"
            },
            fontFamily: {
              display: ["Space Grotesk", "sans-serif"],
              sans: ["Space Grotesk", "sans-serif"]
            }
          }
        }
      };
    </script>
  </head>
  <body class="bg-background-light text-text-main font-display">
    <div class="min-h-screen">
      <header class="border-b border-gray-200 bg-white">
        <div class="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">Admin Dashboard</h1>
            <p class="text-sm text-text-sub">Signed in as {{user_email}}</p>
          </div>
          <div class="flex items-center gap-3">
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="/admin/media">Media</a>
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="/">View Site</a>
            <form action="/admin/logout" method="post">
              <button class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white" type="submit">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main class="mx-auto max-w-6xl px-6 py-10">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">Posts</h2>
          <a class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white" href="/admin/posts/new">New Post</a>
        </div>
        <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th class="px-6 py-4">Title</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Tags</th>
                <th class="px-6 py-4">Updated</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {{#posts}}
              <tr class="border-t border-gray-100">
                <td class="px-6 py-4">
                  <div class="font-semibold text-text-main">{{title}}</div>
                  <div class="text-xs text-text-sub">/{{slug}}</div>
                </td>
                <td class="px-6 py-4">
                  <span class="rounded-full px-2 py-1 text-xs font-semibold {{status_class}}">{{status_label}}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs text-text-sub">{{tag_list}}</span>
                </td>
                <td class="px-6 py-4 text-xs text-text-sub">{{updated_date}}</td>
                <td class="px-6 py-4 text-right">
                  <a class="text-primary font-semibold text-sm mr-3" href="/admin/posts/{{id}}">Edit</a>
                  <form action="/admin/posts/{{id}}/delete" method="post" class="inline">
                    <button class="text-red-600 text-sm font-semibold" type="submit">Delete</button>
                  </form>
                </td>
              </tr>
              {{/posts}}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </body>
</html>
`,
  adminMedia: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Admin - Media</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries,typography"></script>
    <script id="tailwind-config">
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: "#135bec",
              "background-light": "#f6f6f8",
              "text-main": "#0d121b",
              "text-sub": "#4c669a"
            },
            fontFamily: {
              display: ["Space Grotesk", "sans-serif"],
              sans: ["Space Grotesk", "sans-serif"]
            }
          }
        }
      };
    </script>
  </head>
  <body class="bg-background-light text-text-main font-display">
    <div class="min-h-screen">
      <header class="border-b border-gray-200 bg-white">
        <div class="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">Media Library</h1>
            <p class="text-sm text-text-sub">Upload and manage images for the blog.</p>
          </div>
          <div class="flex items-center gap-3">
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="/admin">Posts</a>
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="/">View Site</a>
          </div>
        </div>
      </header>
      <main class="mx-auto max-w-6xl px-6 py-10 space-y-6">
        <div class="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 class="text-lg font-bold mb-4">Upload new media</h2>
          <form action="/admin/media/upload" method="post" enctype="multipart/form-data" class="flex flex-col gap-4 sm:flex-row sm:items-end">
            <input type="hidden" name="return_to" value="/admin/media#library" />
            <div class="flex-1">
              <label class="block text-sm font-semibold mb-2" for="media_upload_page">Choose image</label>
              <input class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" id="media_upload_page" name="image" type="file" accept="image/*" required />
            </div>
            <button class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white" type="submit">Upload</button>
          </form>
        </div>
        <div id="library" class="space-y-3">
          {{#media_items}}
          <div class="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center">
            <img class="h-20 w-28 rounded-lg object-cover border border-gray-100" src="{{url}}" alt="{{alt}}" />
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-text-main break-words">{{alt}}</div>
              <div class="text-xs text-text-sub break-words">{{caption}}</div>
              <div class="text-xs text-text-sub break-words">Tags: {{tags}}</div>
              <div class="text-xs text-text-sub break-words">{{uploaded}} &bull; {{size}} &bull; {{dimensions}} &bull; {{filename}}</div>
              <div class="mt-2">
                <input class="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs" readonly value="![{{alt}}]({{url}})" />
              </div>
            </div>
            <div class="flex items-center gap-2">
              <form action="/admin/media/{{id}}/delete" method="post">
                <button class="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700" type="submit">Delete</button>
              </form>
            </div>
          </div>
          {{/media_items}}
          {{^media_items}}
          <div class="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-text-sub">
            No media uploaded yet.
          </div>
          {{/media_items}}
        </div>
      </main>
    </div>
  </body>
</html>
`,
  adminEdit: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>{{page_title}}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries,typography"></script>
    <script id="tailwind-config">
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: "#135bec",
              "background-light": "#f6f6f8",
              "text-main": "#0d121b",
              "text-sub": "#4c669a"
            },
            fontFamily: {
              display: ["Space Grotesk", "sans-serif"],
              sans: ["Space Grotesk", "sans-serif"]
            }
          }
        }
      };
    </script>
  </head>
  <body class="bg-background-light text-text-main font-display">
    <div class="min-h-screen">
      <header class="border-b border-gray-200 bg-white">
        <div class="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">{{page_heading}}</h1>
            <p class="text-sm text-text-sub">{{page_subtitle}}</p>
          </div>
          <div class="flex items-center gap-2">
            {{#show_preview}}
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="{{preview_url}}" target="_blank" rel="noreferrer">Preview Draft</a>
            {{/show_preview}}
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="/admin/media">Media</a>
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="/admin">Back to list</a>
          </div>
        </div>
      </header>
      {{#save_success}}
      <div id="save-toast" class="fixed right-6 top-6 z-50 max-w-sm rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-lg">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-sm font-semibold text-emerald-700">Post saved</div>
            <div class="text-xs text-text-sub">Your changes are live in the editor.</div>
          </div>
          <button class="text-xs font-semibold text-emerald-700" type="button" data-toast-close>Close</button>
        </div>
      </div>
      {{/save_success}}
      <main class="mx-auto max-w-6xl px-6 py-10">
        {{#errors}}
        <div class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{.}}
        </div>
        {{/errors}}
        <form action="{{form_action}}" method="post" class="space-y-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-6">
              <div class="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
                <div>
                  <label class="block text-sm font-semibold mb-2" for="title">Title</label>
                  <input class="w-full rounded-lg border-gray-200" id="title" name="title" type="text" value="{{title}}" required />
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-2" for="slug">Slug</label>
                  <input class="w-full rounded-lg border-gray-200" id="slug" name="slug" type="text" value="{{slug}}" required />
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-2" for="summary">Summary</label>
                  <textarea class="w-full rounded-lg border-gray-200" id="summary" name="summary" rows="3" required>{{summary}}</textarea>
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-2" for="body_markdown">Body (Markdown)</label>
                  <textarea class="w-full rounded-lg border-gray-200 font-mono text-sm" id="body_markdown" name="body_markdown" rows="12" required>{{body_markdown}}</textarea>
                </div>
              </div>
              <div class="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
                <h3 class="text-lg font-bold">SEO</h3>
                <div>
                  <label class="block text-sm font-semibold mb-2" for="seo_title">SEO Title</label>
                  <input class="w-full rounded-lg border-gray-200" id="seo_title" name="seo_title" type="text" value="{{seo_title}}" />
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-2" for="seo_description">SEO Description</label>
                  <textarea class="w-full rounded-lg border-gray-200" id="seo_description" name="seo_description" rows="3">{{seo_description}}</textarea>
                </div>
              </div>
            </div>
            <div class="space-y-6">
              <div class="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
                <h3 class="text-lg font-bold">Publishing</h3>
                <div>
                  <label class="block text-sm font-semibold mb-2" for="status">Status</label>
                  <select class="w-full rounded-lg border-gray-200" id="status" name="status">
                    <option value="draft" {{#status_draft_selected}}selected{{/status_draft_selected}}>Draft</option>
                    <option value="published" {{#status_published_selected}}selected{{/status_published_selected}}>Published</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-2" for="published_at">Publish time</label>
                  <input class="w-full rounded-lg border-gray-200" id="published_at" name="published_at" type="datetime-local" value="{{published_at}}" />
                </div>
                <label class="flex items-center gap-2 text-sm font-semibold">
                  <input class="rounded border-gray-300" type="checkbox" name="featured" {{#featured_checked}}checked{{/featured_checked}} />
                  Featured
                </label>
              </div>
              <div class="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
                <h3 class="text-lg font-bold">Metadata</h3>
                <div>
                  <label class="block text-sm font-semibold mb-2" for="tags">Tags (comma separated)</label>
                  <input class="w-full rounded-lg border-gray-200" id="tags" name="tags" type="text" value="{{tags}}" required />
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-2" for="author_name">Author name</label>
                  <input class="w-full rounded-lg border-gray-200" id="author_name" name="author_name" type="text" value="{{author_name}}" required />
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-2" for="author_email">Author email</label>
                  <input class="w-full rounded-lg border-gray-200" id="author_email" name="author_email" type="email" value="{{author_email}}" required />
                </div>
              </div>
              <div class="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
                <h3 class="text-lg font-bold">Images</h3>
                <div>
                  <label class="block text-sm font-semibold mb-2" for="hero_image_url">Featured image URL</label>
                  <input class="w-full rounded-lg border-gray-200" id="hero_image_url" name="hero_image_url" type="url" value="{{hero_image_url}}" />
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-2" for="hero_image_alt">Featured image alt text</label>
                  <input class="w-full rounded-lg border-gray-200" id="hero_image_alt" name="hero_image_alt" type="text" value="{{hero_image_alt}}" />
                </div>
              </div>
              <div class="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-bold">Media Library</h3>
                  <div class="flex items-center gap-3 text-xs font-semibold">
                    <a class="text-primary" href="/admin/media">Manage</a>
                    <a class="text-primary" href="#media">Jump</a>
                  </div>
                </div>
                <div class="space-y-3">
                  <div>
                    <label class="block text-sm font-semibold mb-2" for="media_upload">Upload image</label>
                    <input class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" id="media_upload" name="image" type="file" accept="image/*" required form="media-upload-form" />
                  </div>
                  <button class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white" type="submit" form="media-upload-form">Upload to R2</button>
                </div>
                <div id="media" class="space-y-3">
                  {{#media_items}}
                  <div class="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                    <img class="h-16 w-20 rounded-lg object-cover border border-gray-100" src="{{url}}" alt="{{alt}}" />
                    <div class="flex-1 min-w-0">
                      <div class="text-xs font-semibold text-text-main break-words">{{alt}}</div>
                      <div class="text-[11px] text-text-sub break-words">{{caption}}</div>
                      <div class="text-[11px] text-text-sub break-words">Tags: {{tags}}</div>
                      <div class="text-[11px] text-text-sub break-words">{{uploaded}} &bull; {{size}} &bull; {{dimensions}} &bull; {{filename}}</div>
                    </div>
                    <div class="flex flex-col gap-2">
                      <button class="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-text-main" type="button" data-insert-url="{{url}}" data-insert-alt="{{alt}}">Insert</button>
                      <button class="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white" type="button" data-feature-url="{{url}}" data-feature-alt="{{alt}}">Use as featured</button>
                    </div>
                  </div>
                  {{/media_items}}
                  {{^media_items}}
                  <div class="rounded-xl border border-dashed border-gray-200 p-4 text-xs text-text-sub">
                    No images uploaded yet. Upload the first one above.
                  </div>
                  {{/media_items}}
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <a class="text-sm font-semibold text-text-sub" href="/admin">Cancel</a>
            <div class="flex items-center gap-3">
              {{#show_delete}}
              <button class="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700" type="submit" formmethod="post" formaction="{{delete_action}}" formnovalidate>Delete</button>
              {{/show_delete}}
              <button class="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white" type="submit">Save Post</button>
            </div>
          </div>
        </form>
        <form id="media-upload-form" action="/admin/media/upload" method="post" enctype="multipart/form-data">
          <input type="hidden" name="return_to" value="{{return_to}}" />
        </form>
      </main>
    </div>
    <script>
      const bodyField = document.getElementById('body_markdown');
      const heroUrlField = document.getElementById('hero_image_url');
      const heroAltField = document.getElementById('hero_image_alt');

      const insertAtCursor = (field, text) => {
        if (!field) {
          return;
        }
        const start = field.selectionStart ?? field.value.length;
        const end = field.selectionEnd ?? field.value.length;
        const before = field.value.slice(0, start);
        const after = field.value.slice(end);
        field.value = before + text + after;
        const cursor = start + text.length;
        field.focus();
        field.setSelectionRange(cursor, cursor);
      };

      document.querySelectorAll('[data-insert-url]').forEach((button) => {
        button.addEventListener('click', () => {
          const url = button.getAttribute('data-insert-url');
          const alt = button.getAttribute('data-insert-alt') || 'Image';
          if (!url) {
            return;
          }
          insertAtCursor(bodyField, '![' + alt + '](' + url + ')\\n');
        });
      });

      document.querySelectorAll('[data-feature-url]').forEach((button) => {
        button.addEventListener('click', () => {
          const url = button.getAttribute('data-feature-url');
          const alt = button.getAttribute('data-feature-alt') || '';
          if (!url || !heroUrlField) {
            return;
          }
          heroUrlField.value = url;
          if (heroAltField && !heroAltField.value) {
            heroAltField.value = alt;
          }
        });
      });

      const toast = document.getElementById('save-toast');
      const toastClose = document.querySelector('[data-toast-close]');
      if (toast && toastClose) {
        toastClose.addEventListener('click', () => {
          toast.classList.add('hidden');
        });
        setTimeout(() => {
          toast.classList.add('hidden');
        }, 3500);
      }
    </script>
  </body>
</html>
`,
  login: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Admin Login</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries,typography"></script>
  </head>
  <body class="bg-background-light text-text-main font-display">
    <div class="min-h-screen flex items-center justify-center px-6">
      <div class="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <h1 class="text-2xl font-bold mb-2">Admin Access</h1>
        <p class="text-sm text-text-sub mb-6">Sign in with your authorized Google account.</p>
        <a class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white" href="/admin/login/start">
          Sign in with Google
        </a>
        <div class="mt-6 text-xs text-text-sub">Only accounts in the authorized users table may access the admin.</div>
      </div>
    </div>
  </body>
</html>
`,
  unauthorized: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Unauthorized</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries,typography"></script>
  </head>
  <body class="bg-background-light text-text-main font-display">
    <div class="min-h-screen flex items-center justify-center px-6">
      <div class="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <h1 class="text-2xl font-bold mb-2">Access denied</h1>
        <p class="text-sm text-text-sub mb-6">Your Google account is not yet authorized for this admin area.</p>
        <a class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white" href="/">
          Return Home
        </a>
      </div>
    </div>
  </body>
</html>
`,
  notFound: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Not Found</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries,typography"></script>
  </head>
  <body class="bg-background-light text-text-main font-display">
    <div class="min-h-screen flex items-center justify-center px-6">
      <div class="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <h1 class="text-2xl font-bold mb-2">Page not found</h1>
        <p class="text-sm text-text-sub mb-6">The page you are looking for does not exist.</p>
        <a class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white" href="/">
          Return Home
        </a>
      </div>
    </div>
  </body>
</html>
`,
  error: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Server Error</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries,typography"></script>
  </head>
  <body class="bg-background-light text-text-main font-display">
    <div class="min-h-screen flex items-center justify-center px-6">
      <div class="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <h1 class="text-2xl font-bold mb-2">Something went wrong</h1>
        <p class="text-sm text-text-sub mb-6">{{message}}</p>
        <a class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white" href="/">
          Return Home
        </a>
      </div>
    </div>
  </body>
</html>
`
};
