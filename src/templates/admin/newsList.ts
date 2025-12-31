export const adminNewsListTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Admin - News</title>
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
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="/admin">Posts</a>
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
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">News</h2>
          <a class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white" href="/admin/news/new">New News Item</a>
        </div>
        <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th class="px-6 py-4">Title</th>
                <th class="px-6 py-4">Category</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Published</th>
                <th class="px-6 py-4">Updated</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {{#news_items}}
              <tr class="border-t border-gray-100">
                <td class="px-6 py-4">
                  <div class="font-semibold text-text-main">{{title}}</div>
                </td>
                <td class="px-6 py-4 text-xs text-text-sub">{{category}}</td>
                <td class="px-6 py-4">
                  <span class="rounded-full px-2 py-1 text-xs font-semibold {{status_class}}">{{status_label}}</span>
                </td>
                <td class="px-6 py-4 text-xs text-text-sub">{{published_date}}</td>
                <td class="px-6 py-4 text-xs text-text-sub">{{updated_date}}</td>
                <td class="px-6 py-4 text-right">
                  <a class="text-primary font-semibold text-sm mr-3" href="/admin/news/{{id}}">Edit</a>
                  <form action="/admin/news/{{id}}/delete" method="post" class="inline">
                    <button class="text-red-600 text-sm font-semibold" type="submit">Delete</button>
                  </form>
                </td>
              </tr>
              {{/news_items}}
              {{^news_items}}
              <tr>
                <td class="px-6 py-6 text-sm text-text-sub" colspan="6">No news items yet.</td>
              </tr>
              {{/news_items}}
            </tbody>
          </table>
        </div>
      </main>
      {{> publicFooterCompact}}
    </div>
  </body>
</html>
`;
