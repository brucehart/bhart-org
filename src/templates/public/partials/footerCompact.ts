export const publicFooterCompactTemplate = `
<footer class="border-t border-gray-200 bg-white">
  <div class="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 text-sm text-text-sub sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
    <p class="font-semibold text-text-main">bhart.org</p>
    <div class="flex items-center gap-4 font-medium">
      <a class="hover:text-primary transition-colors" href="{{linkedin_url}}" rel="noreferrer" target="_blank">LinkedIn</a>
      <a class="hover:text-primary transition-colors" href="{{github_url}}" rel="noreferrer" target="_blank">GitHub</a>
    </div>
    <p class="text-xs text-text-sub">(c) 2026 Bruce Hart. All rights reserved.</p>
  </div>
</footer>
`;
