export const adminEditTemplate = `<!DOCTYPE html>
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
          <div class="flex items-center gap-2">
            {{#show_preview}}
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="{{preview_url}}" target="_blank" rel="noreferrer">Preview Draft</a>
            {{/show_preview}}
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="/admin/news">News</a>
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
      <main class="mx-auto w-full max-w-6xl px-6 py-10 flex-grow">
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
                  <input class="w-full rounded-lg border-gray-200" id="hero_image_url" name="hero_image_url" type="text" inputmode="url" autocomplete="url" value="{{hero_image_url}}" />
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
                  <div class="flex items-center justify-between text-[11px] font-semibold text-text-sub">
                    <div>Showing 5 most recent • Page {{media_page}}</div>
                    <div class="flex items-center gap-2">
                      {{#show_media_prev}}
                      <a class="text-primary" href="{{media_prev_url}}">Newer</a>
                      {{/show_media_prev}}
                      {{#show_media_next}}
                      <a class="text-primary" href="{{media_next_url}}">Older</a>
                      {{/show_media_next}}
                    </div>
                  </div>
                  {{#media_items}}
                  <div class="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3">
                    <img class="h-16 w-20 rounded-lg object-cover border border-gray-100" src="{{url}}" alt="{{alt}}" />
                    <div class="flex flex-col gap-2">
                      <button class="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-text-main" type="button" data-insert-url="{{url}}" data-insert-alt="{{alt}}">Insert</button>
                      <button class="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-text-main" type="button" data-insert-figure-url="{{url}}" data-insert-figure-alt="{{alt}}" data-insert-figure-caption="{{caption}}">Insert w/ caption</button>
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
      {{> publicFooterCompact}}
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

      const escapeHtml = (value) => {
        return String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      };

      const escapeAttribute = (value) => {
        return escapeHtml(value).replace(/\"/g, '&quot;');
      };

      document.querySelectorAll('[data-insert-figure-url]').forEach((button) => {
        button.addEventListener('click', () => {
          const url = button.getAttribute('data-insert-figure-url');
          const alt = button.getAttribute('data-insert-figure-alt') || 'Image';
          const caption = button.getAttribute('data-insert-figure-caption') || '';
          if (!url) {
            return;
          }
          const figure =
            '<figure>\\n' +
            '  <img src=\"' + escapeAttribute(url) + '\" alt=\"' + escapeAttribute(alt) + '\" />\\n' +
            '  <figcaption>' + escapeHtml(caption) + '</figcaption>\\n' +
            '</figure>\\n';
          insertAtCursor(bodyField, figure);
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
`;
