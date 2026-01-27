export const publicHeaderTemplate = `
<header class="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-border-light bg-background-light/90 backdrop-blur-sm px-6 py-4 lg:px-40">
  <a class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 rounded bg-white px-3 py-2 text-[0.875em] font-semibold text-primary shadow" href="#main-content">Skip to content</a>
  <a class="flex items-center gap-4 text-text-light" href="/" aria-label="Home">
    <div class="size-8 flex items-center justify-center text-primary">
      <span aria-hidden="true" class="material-symbols-outlined !text-[32px]">terminal</span>
    </div>
    <h2 class="text-[1.25em] font-bold leading-tight tracking-[-0.015em] font-display">Bruce Hart</h2>
  </a>
  <div class="hidden md:flex flex-1 items-center justify-end gap-6">
    <nav aria-label="Primary" class="flex items-center gap-6">
      <a class="{{#nav_is_home}}text-primary text-[0.875em] font-bold leading-normal{{/nav_is_home}}{{^nav_is_home}}text-text-light text-[0.875em] font-medium leading-normal hover:text-primary transition-colors{{/nav_is_home}}" href="/">Home</a>
      <a class="{{#nav_is_about}}text-primary text-[0.875em] font-bold leading-normal{{/nav_is_about}}{{^nav_is_about}}text-text-light text-[0.875em] font-medium leading-normal hover:text-primary transition-colors{{/nav_is_about}}" href="/about">About</a>
      <a class="{{#nav_is_projects}}text-primary text-[0.875em] font-bold leading-normal{{/nav_is_projects}}{{^nav_is_projects}}text-text-light text-[0.875em] font-medium leading-normal hover:text-primary transition-colors{{/nav_is_projects}}" href="/projects">Projects</a>
      <a class="{{#nav_is_news}}text-primary text-[0.875em] font-bold leading-normal{{/nav_is_news}}{{^nav_is_news}}text-text-light text-[0.875em] font-medium leading-normal hover:text-primary transition-colors{{/nav_is_news}}" href="/news">News</a>
      <a class="{{#nav_is_work}}text-primary text-[0.875em] font-bold leading-normal{{/nav_is_work}}{{^nav_is_work}}text-text-light text-[0.875em] font-medium leading-normal hover:text-primary transition-colors{{/nav_is_work}}" href="/work-with-me">Work With Me</a>
      <a class="{{#nav_is_contact}}text-primary text-[0.875em] font-bold leading-normal{{/nav_is_contact}}{{^nav_is_contact}}text-text-light text-[0.875em] font-medium leading-normal hover:text-primary transition-colors{{/nav_is_contact}}" href="/contact">Contact</a>
    </nav>
    <div class="flex items-center gap-4 text-[0.875em] font-medium text-muted-light">
      <a class="flex items-center text-text-light hover:text-primary transition-colors" href="{{rss_url}}" aria-label="RSS feed">
        <span aria-hidden="true" class="material-symbols-outlined text-[20px]">rss_feed</span>
      </a>
      <a class="hover:text-primary transition-colors" href="{{linkedin_url}}" rel="noreferrer" target="_blank">LinkedIn</a>
      <a class="hover:text-primary transition-colors" href="{{github_url}}" rel="noreferrer" target="_blank">GitHub</a>
    </div>
  </div>
  <div class="md:hidden flex items-center gap-3 text-text-light">
    <a class="flex items-center text-text-light hover:text-primary transition-colors" href="{{rss_url}}" aria-label="RSS feed">
      <span aria-hidden="true" class="material-symbols-outlined text-[22px]">rss_feed</span>
    </a>
    <details class="relative">
      <summary class="list-none cursor-pointer rounded-full p-2 text-text-light hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60" aria-label="Open navigation menu">
        <span aria-hidden="true" class="material-symbols-outlined">menu</span>
      </summary>
      <div class="absolute right-0 mt-3 w-64 rounded-2xl border border-border-light bg-white p-4 shadow-lg">
        <nav aria-label="Mobile primary" class="flex flex-col gap-3">
          <a class="{{#nav_is_home}}text-primary text-[0.875em] font-bold leading-normal{{/nav_is_home}}{{^nav_is_home}}text-text-light text-[0.875em] font-medium leading-normal hover:text-primary transition-colors{{/nav_is_home}}" href="/">Home</a>
          <a class="{{#nav_is_about}}text-primary text-[0.875em] font-bold leading-normal{{/nav_is_about}}{{^nav_is_about}}text-text-light text-[0.875em] font-medium leading-normal hover:text-primary transition-colors{{/nav_is_about}}" href="/about">About</a>
          <a class="{{#nav_is_projects}}text-primary text-[0.875em] font-bold leading-normal{{/nav_is_projects}}{{^nav_is_projects}}text-text-light text-[0.875em] font-medium leading-normal hover:text-primary transition-colors{{/nav_is_projects}}" href="/projects">Projects</a>
          <a class="{{#nav_is_news}}text-primary text-[0.875em] font-bold leading-normal{{/nav_is_news}}{{^nav_is_news}}text-text-light text-[0.875em] font-medium leading-normal hover:text-primary transition-colors{{/nav_is_news}}" href="/news">News</a>
          <a class="{{#nav_is_work}}text-primary text-[0.875em] font-bold leading-normal{{/nav_is_work}}{{^nav_is_work}}text-text-light text-[0.875em] font-medium leading-normal hover:text-primary transition-colors{{/nav_is_work}}" href="/work-with-me">Work With Me</a>
          <a class="{{#nav_is_contact}}text-primary text-[0.875em] font-bold leading-normal{{/nav_is_contact}}{{^nav_is_contact}}text-text-light text-[0.875em] font-medium leading-normal hover:text-primary transition-colors{{/nav_is_contact}}" href="/contact">Contact</a>
        </nav>
        <div class="mt-4 flex items-center gap-4 text-[0.875em] font-medium text-muted-light">
          <a class="hover:text-primary transition-colors" href="{{linkedin_url}}" rel="noreferrer" target="_blank">LinkedIn</a>
          <a class="hover:text-primary transition-colors" href="{{github_url}}" rel="noreferrer" target="_blank">GitHub</a>
        </div>
      </div>
    </details>
  </div>
</header>
`;
