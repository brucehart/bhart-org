export const publicFooterTemplate = `
<footer class="bg-white border-t border-gray-200">
  <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    {{#show_email_subscribe}}
    <div class="rounded-3xl bg-background-light p-8 md:p-12 lg:p-16 relative overflow-hidden">
      <div class="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
      <div class="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
      <div class="relative z-10 flex flex-col items-center text-center">
        <h2 class="text-3xl font-bold tracking-tight text-text-main sm:text-4xl">
          A weekly note (mostly)
        </h2>
        <p class="mx-auto mt-4 max-w-xl text-lg text-text-sub">
          New posts, links I’m chewing on, and a few honest takeaways. No hype. Unsubscribe anytime.
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
    {{/show_email_subscribe}}
    <div class="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-text-sub">
      <a class="hover:text-primary transition-colors" href="/about">About</a>
      <a class="hover:text-primary transition-colors" href="/projects">Projects</a>
      <a class="hover:text-primary transition-colors" href="/news">News</a>
      <a class="hover:text-primary transition-colors" href="/work-with-me">Work With Me</a>
      <a class="hover:text-primary transition-colors" href="/contact">Contact</a>
    </div>
    <div class="mt-16 flex flex-col items-center gap-6 text-center">
      <a class="flex items-center gap-2" href="/" aria-label="Home">
        <div class="flex h-6 w-6 items-center justify-center rounded bg-primary text-white text-xs">
          <span aria-hidden="true" class="material-symbols-outlined text-[14px]">terminal</span>
        </div>
        <p class="text-sm font-semibold text-text-main">bhart.org</p>
      </a>
      <div class="flex items-center gap-4 text-xs font-semibold text-text-sub">
        <a class="inline-flex items-center gap-1 hover:text-primary transition-colors" href="{{rss_url}}" aria-label="RSS feed">
          <span aria-hidden="true" class="material-symbols-outlined text-[16px]">rss_feed</span>
          RSS
        </a>
        <a class="hover:text-primary transition-colors" href="{{linkedin_url}}" rel="noreferrer" target="_blank">LinkedIn</a>
        <a class="hover:text-primary transition-colors" href="{{github_url}}" rel="noreferrer" target="_blank">GitHub</a>
      </div>
      <p class="text-xs text-text-sub">(c) 2026 Bruce Hart. All rights reserved.</p>
    </div>
  </div>
</footer>
`;
