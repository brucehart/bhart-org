export const publicHeaderTemplate = `
<header class="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-border-light bg-background-light/90 backdrop-blur-sm px-6 py-4 lg:px-40">
  <div class="flex items-center gap-4 text-text-light">
    <div class="size-8 flex items-center justify-center text-primary">
      <span class="material-symbols-outlined !text-[32px]">terminal</span>
    </div>
    <h2 class="text-xl font-bold leading-tight tracking-[-0.015em] font-display">Bruce Hart</h2>
  </div>
  <div class="hidden md:flex flex-1 items-center justify-end gap-6">
    <nav class="flex items-center gap-6">
      <a class="{{#nav_is_home}}text-primary text-sm font-bold leading-normal{{/nav_is_home}}{{^nav_is_home}}text-text-light text-sm font-medium leading-normal hover:text-primary transition-colors{{/nav_is_home}}" href="/">Home</a>
      <a class="{{#nav_is_about}}text-primary text-sm font-bold leading-normal{{/nav_is_about}}{{^nav_is_about}}text-text-light text-sm font-medium leading-normal hover:text-primary transition-colors{{/nav_is_about}}" href="/about">About</a>
      <a class="{{#nav_is_projects}}text-primary text-sm font-bold leading-normal{{/nav_is_projects}}{{^nav_is_projects}}text-text-light text-sm font-medium leading-normal hover:text-primary transition-colors{{/nav_is_projects}}" href="/projects">Projects</a>
      <a class="{{#nav_is_news}}text-primary text-sm font-bold leading-normal{{/nav_is_news}}{{^nav_is_news}}text-text-light text-sm font-medium leading-normal hover:text-primary transition-colors{{/nav_is_news}}" href="/news">News</a>
      <a class="{{#nav_is_work}}text-primary text-sm font-bold leading-normal{{/nav_is_work}}{{^nav_is_work}}text-text-light text-sm font-medium leading-normal hover:text-primary transition-colors{{/nav_is_work}}" href="/work-with-me">Work With Me</a>
      <a class="{{#nav_is_contact}}text-primary text-sm font-bold leading-normal{{/nav_is_contact}}{{^nav_is_contact}}text-text-light text-sm font-medium leading-normal hover:text-primary transition-colors{{/nav_is_contact}}" href="/contact">Contact</a>
    </nav>
    <div class="flex items-center gap-4 text-sm font-medium text-muted-light">
      <a class="flex items-center text-text-light hover:text-primary transition-colors" href="{{rss_url}}" aria-label="RSS feed">
        <span class="material-symbols-outlined text-[20px]">rss_feed</span>
      </a>
      <a class="hover:text-primary transition-colors" href="{{linkedin_url}}" rel="noreferrer" target="_blank">LinkedIn</a>
      <a class="hover:text-primary transition-colors" href="{{github_url}}" rel="noreferrer" target="_blank">GitHub</a>
    </div>
  </div>
  <div class="md:hidden flex items-center gap-3 text-text-light">
    <a class="flex items-center text-text-light hover:text-primary transition-colors" href="{{rss_url}}" aria-label="RSS feed">
      <span class="material-symbols-outlined text-[22px]">rss_feed</span>
    </a>
    <span class="material-symbols-outlined cursor-pointer">menu</span>
  </div>
</header>
`;
