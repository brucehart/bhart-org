export const aboutTemplate = `<!DOCTYPE html>
<html class="light" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Bruce Hart - About</title>
    {{> publicFavicon}}
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
              "text-main": "#0d121b",
              "text-sub": "#4c669a",
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
      {{> publicHeader}}
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
                    I build software that respects people, not just specs. This is where I think out loud about AI, technology, and the messy parts of building a good life around them.
                  </p>
                </div>
                <div class="flex gap-4 justify-center lg:justify-start pt-2">
                  <a class="flex items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-primary/90 text-white text-base font-bold leading-normal transition-all shadow-lg shadow-primary/20" href="/contact">
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
                  style="background-image: url('/media/headshot.png');"
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
                  Three threads keep showing up in my week: curiosity, craft, and the people I care about. They pull me between deep work and simple joys.
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
                      I like practical AI: assistants that save time, honest automation, and small experiments that reveal what actually works.
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
                      I enjoy building useful software, tinkering on side projects, learning new tools, and keeping things readable enough for future me to understand.
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
                      Family time with my wife, Stefanie, and our kids, James and Grace, plus Dayton Flyers basketball, fantasy football, and math puzzles that keep me humble.
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
                I have spent my career toggling between hands-on building and helping teams do their best work. I care about clear thinking, honest tradeoffs, and leaving systems better than I found them. Outside work, I am a cancer survivor, a former Army brat who bounced around the US and the world, and a Southern California high school grad who now calls Bellbrook, Ohio home.
              </p>
              <div class="rounded-xl border border-border-light bg-white p-6">
                <h3 class="text-text-light text-lg font-bold font-display mb-4">Skills &amp; Tools</h3>
                <div class="flex flex-col gap-4">
                  <div class="flex flex-col gap-3">
                    <p class="text-xs font-semibold uppercase tracking-wider text-muted-light">Artificial Intelligence</p>
                    <div class="flex flex-wrap gap-2">
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">Artificial Intelligence</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">Automation</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">Machine Learning</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">Data Science</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">Databases</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">Full Stack Engineering</span>
                      <span class="rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-medium text-text-light">AI Agent Development</span>
                    </div>
                  </div>
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
                  <li>Develops technical approach to programs focused on cyber operations, PNT capabilities, and advanced ISR.</li>
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
                <ul class="text-muted-light text-sm leading-relaxed list-disc pl-4">
                  <li>More of the same! Built teams and delivered programs after Centauri joined KBR.</li>
                  <li>KBR acquired Centauri for $800M: <a class="text-primary hover:text-primary/80 transition-colors" href="https://www.kbr.com/en/insights-news/press-release/kbr-acquire-centauri-significantly-expanding-its-military-space-defense">press release</a>.</li>
                </ul>
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
      {{> publicFooter}}
    </div>
  </body>
</html>
`;
