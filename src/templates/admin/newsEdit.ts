export const adminNewsEditTemplate = `<!DOCTYPE html>
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
    <div class="min-h-screen flex flex-col">
      <header class="border-b border-gray-200 bg-white">
        <div class="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">{{page_heading}}</h1>
            <p class="text-sm text-text-sub">{{page_subtitle}}</p>
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
      <main class="mx-auto w-full max-w-4xl px-6 py-10 flex-grow">
        {{#save_success}}
        <div class="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Saved successfully.
        </div>
        {{/save_success}}
        {{#errors}}
        <div class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{.}}
        </div>
        {{/errors}}
        <form action="{{form_action}}" method="post" class="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <label class="block text-sm font-semibold text-text-main" for="category">Category</label>
            <input
              class="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              id="category"
              name="category"
              placeholder="Launch, Update, Note"
              type="text"
              value="{{category}}"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-text-main" for="title">Title</label>
            <input
              class="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              id="title"
              name="title"
              type="text"
              value="{{title}}"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-text-main" for="body_markdown">Body</label>
            <textarea
              class="mt-2 min-h-[160px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              id="body_markdown"
              name="body_markdown"
            >{{body_markdown}}</textarea>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-semibold text-text-main" for="status">Status</label>
              <select
                class="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                id="status"
                name="status"
              >
                <option value="draft" {{#status_draft_selected}}selected{{/status_draft_selected}}>Draft</option>
                <option value="published" {{#status_published_selected}}selected{{/status_published_selected}}>Published</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-text-main" for="published_at">Publish time</label>
              <input
                class="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                id="published_at"
                name="published_at"
                type="datetime-local"
                value="{{published_at}}"
              />
            </div>
          </div>
          <div class="flex items-center justify-between">
            <a class="text-sm font-semibold text-text-sub hover:text-primary" href="/admin/news">Back to news</a>
            <div class="flex items-center gap-3">
              {{#show_delete}}
              <button
                class="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                type="submit"
                formmethod="post"
                formaction="{{delete_action}}"
                formnovalidate
              >
                Delete
              </button>
              {{/show_delete}}
              <button class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white" type="submit">Save</button>
            </div>
          </div>
        </form>
      </main>
      {{> publicFooterCompact}}
    </div>
  </body>
</html>
`;
