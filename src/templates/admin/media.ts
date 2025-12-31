export const adminMediaTemplate = `<!DOCTYPE html>
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
    <div class="min-h-screen flex flex-col">
      <header class="border-b border-gray-200 bg-white">
        <div class="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">Media Library</h1>
            <p class="text-sm text-text-sub">Upload and manage images for the blog.</p>
          </div>
          <div class="flex items-center gap-3">
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="/admin">Posts</a>
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="/admin/news">News</a>
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="/">View Site</a>
          </div>
        </div>
      </header>
      <main class="mx-auto w-full max-w-6xl px-6 py-10 space-y-6 flex-grow">
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
      {{> publicFooterCompact}}
    </div>
  </body>
</html>
`;
