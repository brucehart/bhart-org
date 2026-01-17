export const adminListTemplate = `<!DOCTYPE html>
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
    <div class="min-h-screen flex flex-col">
      <header class="border-b border-gray-200 bg-white">
        <div class="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">Admin Dashboard</h1>
            <p class="text-sm text-text-sub">Signed in as {{user_email}}</p>
          </div>
          <div class="flex items-center gap-3">
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="/admin/news">News</a>
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="/admin/media">Media</a>
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="/">View Site</a>
            <form action="/admin/logout" method="post">
              <button class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white" type="submit">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main class="mx-auto w-full max-w-6xl px-6 py-10 flex-grow">
        <div class="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 class="text-xl font-bold">Posts</h2>
            <p class="text-xs text-text-sub mt-1">{{results_label}}</p>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <form action="/admin" method="get" class="flex w-full max-w-md items-center gap-2">
              <input
                class="w-full rounded-lg border-gray-200 text-sm focus:border-primary focus:ring-primary"
                type="search"
                name="q"
                placeholder="Search title, content, stub, or tags"
                value="{{search_query}}"
              />
              <input type="hidden" name="sort" value="{{sort_field}}" />
              <input type="hidden" name="dir" value="{{sort_dir}}" />
              <button class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" type="submit">
                Search
              </button>
              {{#has_search}}
              <a class="text-xs font-semibold text-text-sub hover:text-primary" href="{{clear_search_url}}">Clear</a>
              {{/has_search}}
            </form>
            <a class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white" href="/admin/posts/new">New Post</a>
          </div>
        </div>
        <div class="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table class="w-full min-w-[900px] text-left text-sm">
            <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th class="px-6 py-4">
                  <a class="inline-flex items-center gap-1" href="{{title_sort_url}}">Title<span class="text-[10px] text-gray-400">{{title_sort_indicator}}</span></a>
                </th>
                <th class="px-6 py-4">
                  <a class="inline-flex items-center gap-1" href="{{status_sort_url}}">Status<span class="text-[10px] text-gray-400">{{status_sort_indicator}}</span></a>
                </th>
                <th class="px-6 py-4">
                  <a class="inline-flex items-center gap-1" href="{{tags_sort_url}}">Tags<span class="text-[10px] text-gray-400">{{tags_sort_indicator}}</span></a>
                </th>
                <th class="px-6 py-4">
                  <a class="inline-flex items-center gap-1" href="{{published_sort_url}}">Published<span class="text-[10px] text-gray-400">{{published_sort_indicator}}</span></a>
                </th>
                <th class="px-6 py-4">
                  <a class="inline-flex items-center gap-1" href="{{updated_sort_url}}">Updated<span class="text-[10px] text-gray-400">{{updated_sort_indicator}}</span></a>
                </th>
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
                <td class="px-6 py-4 text-xs text-text-sub">{{published_date}}</td>
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
          <div class="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 text-sm text-text-sub sm:flex-row sm:items-center sm:justify-between">
            <div>Page {{current_page}} of {{total_pages}} · Total posts: {{total_posts}}</div>
            <div class="flex items-center gap-3">
              {{#show_prev}}
              <a class="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-text-main" href="{{prev_page_url}}">Previous</a>
              {{/show_prev}}
              {{#show_next}}
              <a class="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-text-main" href="{{next_page_url}}">Next</a>
              {{/show_next}}
            </div>
          </div>
        </div>
      </main>
      {{> publicFooterCompact}}
    </div>
  </body>
</html>
`;
