export const adminDraftArticleTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Draft Article - Admin</title>
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
        <div class="mx-auto max-w-6xl px-6 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="text-2xl font-bold">Draft Article</h1>
            <p class="text-sm text-text-sub">Signed in as {{user_email}}</p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="/admin">Posts</a>
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="/admin/news">News</a>
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="/admin/media">Media</a>
            <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-text-main" href="/">View Site</a>
          </div>
        </div>
      </header>

      <main class="mx-auto w-full max-w-6xl px-6 py-10 flex-grow">
        <div id="agent-alert" class="mb-6 hidden rounded-lg border px-4 py-3 text-sm"></div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section class="rounded-lg border border-gray-200 bg-white p-6">
            <form id="draft-form" class="space-y-5">
              <div>
                <label class="block text-sm font-semibold mb-2" for="prompt">Article prompt</label>
                <textarea
                  class="min-h-64 w-full rounded-lg border-gray-200 text-sm focus:border-primary focus:ring-primary"
                  id="prompt"
                  name="prompt"
                  maxlength="4000"
                  required
                ></textarea>
                <div class="mt-2 flex items-center justify-between text-xs text-text-sub">
                  <span>Codex will submit a draft through the existing Blog Automation API.</span>
                  <span><span id="prompt-count">0</span>/4000</span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold mb-2" for="refs">Reference files</label>
                <input
                  class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                  id="refs"
                  name="refs"
                  type="file"
                  multiple
                  accept="image/*,.txt,.md,.markdown,.pdf,.json,.csv"
                />
                <div id="file-summary" class="mt-2 text-xs text-text-sub">No files selected.</div>
              </div>

              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <a class="text-sm font-semibold text-text-sub" href="/admin">Back to posts</a>
                <button
                  id="submit-button"
                  class="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                >
                  Start Draft
                </button>
              </div>
            </form>
          </section>

          <aside class="space-y-6">
            <section class="rounded-lg border border-gray-200 bg-white p-5">
              <div class="mb-4 flex items-center justify-between">
                <h2 class="text-lg font-bold">Recent Jobs</h2>
                <button id="refresh-jobs" class="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-text-main" type="button">Refresh</button>
              </div>
              <div id="jobs-list" class="space-y-3 text-sm"></div>
            </section>

            <section class="rounded-lg border border-gray-200 bg-white p-5">
              <div class="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 class="text-lg font-bold">Job Detail</h2>
                  <div id="job-status" class="mt-1 text-xs font-semibold text-text-sub">No job selected</div>
                </div>
                <button id="cancel-job" class="hidden rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-700" type="button">Cancel</button>
              </div>
              <div id="job-links" class="mb-4 hidden flex flex-wrap gap-2 text-xs font-semibold"></div>
              <div id="job-error" class="mb-4 hidden rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"></div>
              <div id="log-box" class="h-80 overflow-auto rounded-lg border border-gray-200 bg-gray-950 p-3 font-mono text-xs leading-5 text-gray-100"></div>
              <form id="feedback-form" class="mt-4 flex gap-2">
                <input
                  id="feedback"
                  class="min-w-0 flex-1 rounded-lg border-gray-200 text-sm focus:border-primary focus:ring-primary"
                  type="text"
                  maxlength="2000"
                  placeholder="Add feedback"
                  disabled
                />
                <button id="feedback-button" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-text-main disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled>Send</button>
              </form>
            </section>
          </aside>
        </div>
      </main>
      {{> publicFooterCompact}}
    </div>

    <script>
      const state = {
        jobs: [],
        selectedId: null,
        eventSource: null,
        lastEventId: 0
      };
      const terminalStatuses = new Set(['complete', 'failed', 'canceled']);
      const promptField = document.getElementById('prompt');
      const promptCount = document.getElementById('prompt-count');
      const refsInput = document.getElementById('refs');
      const fileSummary = document.getElementById('file-summary');
      const alertBox = document.getElementById('agent-alert');
      const jobsList = document.getElementById('jobs-list');
      const jobStatus = document.getElementById('job-status');
      const jobLinks = document.getElementById('job-links');
      const jobError = document.getElementById('job-error');
      const logBox = document.getElementById('log-box');
      const feedbackInput = document.getElementById('feedback');
      const feedbackButton = document.getElementById('feedback-button');
      const cancelButton = document.getElementById('cancel-job');
      const submitButton = document.getElementById('submit-button');

      const showAlert = (message, kind) => {
        alertBox.textContent = message;
        alertBox.className = 'mb-6 rounded-lg border px-4 py-3 text-sm ' +
          (kind === 'error'
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700');
      };

      const hideAlert = () => {
        alertBox.className = 'mb-6 hidden rounded-lg border px-4 py-3 text-sm';
        alertBox.textContent = '';
      };

      const cleanError = async (response) => {
        let text = '';
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const payload = await response.json();
            text = payload && payload.error && payload.error.message ? payload.error.message : JSON.stringify(payload);
          } else {
            text = await response.text();
          }
        } catch {
          text = '';
        }
        text = String(text || '').replace(/\\s+/g, ' ').trim();
        if (!text || /<\\s*(!doctype|html|body|head)\\b/i.test(text)) {
          return 'Request failed.';
        }
        return text.slice(0, 500);
      };

      const formatDate = (value) => {
        if (!value) {
          return '';
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
          return value;
        }
        return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      };

      const statusClass = (status) => {
        if (status === 'complete') {
          return 'bg-emerald-100 text-emerald-700';
        }
        if (status === 'failed' || status === 'canceled') {
          return 'bg-red-100 text-red-700';
        }
        if (status === 'running' || status === 'starting') {
          return 'bg-blue-100 text-blue-700';
        }
        return 'bg-yellow-100 text-yellow-700';
      };

      const updateFileSummary = () => {
        const files = Array.from(refsInput.files || []);
        if (!files.length) {
          fileSummary.textContent = 'No files selected.';
          return;
        }
        const total = files.reduce((sum, file) => sum + file.size, 0);
        fileSummary.textContent = files.length + ' file' + (files.length === 1 ? '' : 's') + ' selected, ' + Math.ceil(total / 1024) + ' KB total.';
      };

      const appendLog = (message, type) => {
        const line = document.createElement('div');
        line.className =
          type === 'error' || type === 'failed'
            ? 'text-red-300'
            : type === 'warning'
              ? 'text-yellow-200'
              : type === 'complete'
                ? 'text-emerald-300'
                : 'text-gray-100';
        line.textContent = message;
        logBox.appendChild(line);
        logBox.scrollTop = logBox.scrollHeight;
      };

      const renderJobs = () => {
        jobsList.textContent = '';
        if (!state.jobs.length) {
          const empty = document.createElement('div');
          empty.className = 'rounded-lg border border-dashed border-gray-200 p-4 text-xs text-text-sub';
          empty.textContent = 'No article draft jobs yet.';
          jobsList.appendChild(empty);
          return;
        }
        state.jobs.forEach((job) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'block w-full rounded-lg border p-3 text-left transition ' +
            (job.id === state.selectedId ? 'border-primary bg-blue-50' : 'border-gray-200 bg-white hover:border-primary');
          button.dataset.jobId = job.id;

          const title = document.createElement('div');
          title.className = 'mb-2 line-clamp-2 text-sm font-semibold text-text-main';
          title.textContent = job.title || job.prompt || job.id;

          const meta = document.createElement('div');
          meta.className = 'flex items-center justify-between gap-2 text-xs text-text-sub';
          const status = document.createElement('span');
          status.className = 'rounded-full px-2 py-1 font-semibold ' + statusClass(job.status);
          status.textContent = job.status;
          const date = document.createElement('span');
          date.textContent = formatDate(job.created_at);
          meta.append(status, date);
          button.append(title, meta);
          button.addEventListener('click', () => selectJob(job.id));
          jobsList.appendChild(button);
        });
      };

      const renderSelectedJob = (job) => {
        if (!job) {
          jobStatus.textContent = 'No job selected';
          jobLinks.className = 'mb-4 hidden flex flex-wrap gap-2 text-xs font-semibold';
          jobError.className = 'mb-4 hidden rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700';
          feedbackInput.disabled = true;
          feedbackButton.disabled = true;
          cancelButton.className = 'hidden rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-700';
          return;
        }

        jobStatus.innerHTML = '';
        const badge = document.createElement('span');
        badge.className = 'rounded-full px-2 py-1 ' + statusClass(job.status);
        badge.textContent = job.status;
        const sprite = document.createElement('span');
        sprite.className = 'ml-2 text-text-sub';
        sprite.textContent = job.sprite_name || '';
        jobStatus.append(badge, sprite);

        jobLinks.textContent = '';
        const links = [
          job.preview_url ? ['Preview Draft', job.preview_url] : null,
          job.edit_url ? ['Edit Post', job.edit_url] : null,
          job.article_url ? ['Article URL', job.article_url] : null
        ].filter(Boolean);
        if (links.length) {
          links.forEach(([label, href]) => {
            const link = document.createElement('a');
            link.className = 'rounded-lg border border-gray-200 px-3 py-1 text-primary';
            link.href = href;
            link.textContent = label;
            if (label === 'Article URL') {
              link.target = '_blank';
              link.rel = 'noreferrer';
            }
            jobLinks.appendChild(link);
          });
          jobLinks.className = 'mb-4 flex flex-wrap gap-2 text-xs font-semibold';
        } else {
          jobLinks.className = 'mb-4 hidden flex flex-wrap gap-2 text-xs font-semibold';
        }

        if (job.error) {
          jobError.textContent = String(job.error).replace(/\\s+/g, ' ').slice(0, 500);
          jobError.className = 'mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700';
        } else {
          jobError.className = 'mb-4 hidden rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700';
        }

        const active = !terminalStatuses.has(job.status);
        feedbackInput.disabled = !active;
        feedbackButton.disabled = !active;
        cancelButton.className = active
          ? 'rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-700'
          : 'hidden rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-700';
      };

      const loadJobs = async () => {
        const response = await fetch('/admin/article-agent/jobs', { headers: { Accept: 'application/json' } });
        if (!response.ok) {
          throw new Error(await cleanError(response));
        }
        const payload = await response.json();
        state.jobs = payload.jobs || [];
        if (!state.selectedId && state.jobs.length) {
          state.selectedId = state.jobs[0].id;
        }
        renderJobs();
        renderSelectedJob(state.jobs.find((job) => job.id === state.selectedId));
      };

      const refreshSelectedJob = async () => {
        if (!state.selectedId) {
          return;
        }
        const response = await fetch('/admin/article-agent/jobs/' + encodeURIComponent(state.selectedId), { headers: { Accept: 'application/json' } });
        if (!response.ok) {
          showAlert(await cleanError(response), 'error');
          return;
        }
        const payload = await response.json();
        const index = state.jobs.findIndex((job) => job.id === payload.job.id);
        if (index >= 0) {
          state.jobs[index] = payload.job;
        } else {
          state.jobs.unshift(payload.job);
        }
        renderJobs();
        renderSelectedJob(payload.job);
      };

      const connectEvents = (jobId) => {
        if (state.eventSource) {
          state.eventSource.close();
        }
        state.lastEventId = 0;
        logBox.textContent = '';
        const open = () => {
          const source = new EventSource('/admin/article-agent/jobs/' + encodeURIComponent(jobId) + '/events?after=' + state.lastEventId);
          state.eventSource = source;
          const handleEvent = (type) => (event) => {
            state.lastEventId = Math.max(state.lastEventId, Number(event.lastEventId || 0));
            let payload = {};
            try {
              payload = JSON.parse(event.data || '{}');
            } catch {
              payload = { message: event.data || '' };
            }
            const message = payload.message || '';
            if (message) {
              appendLog(message, type);
            }
            if (['complete', 'failed', 'canceled', 'running', 'starting', 'status'].includes(type)) {
              refreshSelectedJob();
            }
          };
          ['status', 'log', 'warning', 'error', 'failed', 'complete', 'feedback', 'canceled', 'running', 'starting'].forEach((type) => {
            source.addEventListener(type, handleEvent(type));
          });
          source.onerror = () => {
            source.close();
            if (state.selectedId === jobId) {
              setTimeout(open, 2500);
            }
          };
        };
        open();
      };

      const selectJob = (jobId) => {
        state.selectedId = jobId;
        renderJobs();
        renderSelectedJob(state.jobs.find((job) => job.id === jobId));
        connectEvents(jobId);
        refreshSelectedJob();
      };

      promptField.addEventListener('input', () => {
        promptCount.textContent = String(promptField.value.length);
      });

      refsInput.addEventListener('change', updateFileSummary);

      document.addEventListener('paste', (event) => {
        const pastedFiles = Array.from((event.clipboardData && event.clipboardData.files) || []);
        if (!pastedFiles.length || typeof DataTransfer === 'undefined') {
          return;
        }
        const transfer = new DataTransfer();
        Array.from(refsInput.files || []).forEach((file) => transfer.items.add(file));
        pastedFiles.forEach((file) => transfer.items.add(file));
        refsInput.files = transfer.files;
        updateFileSummary();
      });

      document.getElementById('draft-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        hideAlert();
        submitButton.disabled = true;
        submitButton.textContent = 'Starting...';
        try {
          const data = new FormData(event.currentTarget);
          const response = await fetch('/admin/article-agent/jobs', {
            method: 'POST',
            body: data,
            headers: { Accept: 'application/json' }
          });
          if (!response.ok) {
            throw new Error(await cleanError(response));
          }
          const payload = await response.json();
          state.jobs.unshift(payload.job);
          state.selectedId = payload.job.id;
          renderJobs();
          renderSelectedJob(payload.job);
          connectEvents(payload.job.id);
          showAlert('Draft job started.', 'success');
          event.currentTarget.reset();
          promptCount.textContent = '0';
          updateFileSummary();
        } catch (error) {
          showAlert(error instanceof Error ? error.message : 'Unable to start draft job.', 'error');
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = 'Start Draft';
        }
      });

      document.getElementById('refresh-jobs').addEventListener('click', () => {
        loadJobs().catch((error) => showAlert(error instanceof Error ? error.message : 'Unable to load jobs.', 'error'));
      });

      document.getElementById('feedback-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!state.selectedId || !feedbackInput.value.trim()) {
          return;
        }
        feedbackButton.disabled = true;
        try {
          const response = await fetch('/admin/article-agent/jobs/' + encodeURIComponent(state.selectedId) + '/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ content: feedbackInput.value.trim() })
          });
          if (!response.ok) {
            throw new Error(await cleanError(response));
          }
          feedbackInput.value = '';
          appendLog('Feedback queued for Codex.', 'feedback');
        } catch (error) {
          showAlert(error instanceof Error ? error.message : 'Unable to send feedback.', 'error');
        } finally {
          feedbackButton.disabled = feedbackInput.disabled;
        }
      });

      cancelButton.addEventListener('click', async () => {
        if (!state.selectedId) {
          return;
        }
        cancelButton.disabled = true;
        try {
          const response = await fetch('/admin/article-agent/jobs/' + encodeURIComponent(state.selectedId) + '/cancel', {
            method: 'POST',
            headers: { Accept: 'application/json' }
          });
          if (!response.ok) {
            throw new Error(await cleanError(response));
          }
          await refreshSelectedJob();
        } catch (error) {
          showAlert(error instanceof Error ? error.message : 'Unable to cancel job.', 'error');
        } finally {
          cancelButton.disabled = false;
        }
      });

      loadJobs()
        .then(() => {
          if (state.selectedId) {
            connectEvents(state.selectedId);
          }
        })
        .catch((error) => showAlert(error instanceof Error ? error.message : 'Unable to load jobs.', 'error'));
    </script>
  </body>
</html>
`;
