export const loginTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Admin Login</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@200..700&display=swap"
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
      <div class="relative flex flex-grow items-center justify-center px-6 py-16">
        <div class="pointer-events-none absolute inset-0">
          <div class="absolute left-[-120px] top-[-120px] h-64 w-64 rounded-full bg-blue-100 blur-3xl"></div>
          <div class="absolute bottom-[-120px] right-[-120px] h-72 w-72 rounded-full bg-sky-100 blur-3xl"></div>
        </div>
        <div class="relative max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-primary">
            <span class="material-symbols-outlined text-[28px]" aria-hidden="true">lock</span>
          </div>
          <h1 class="text-2xl font-bold mb-2">Admin Access</h1>
          <p class="text-sm text-text-sub mb-6">Sign in with your authorized Google account.</p>
          <a class="inline-flex w-full items-center justify-center gap-3 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700" href="/admin/login/start">
            <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white">
              <svg aria-hidden="true" viewBox="0 0 48 48" class="h-4 w-4">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.02 1.53 7.4 2.81l5.45-5.45C33.2 3.28 28.97 1 24 1 14.7 1 6.64 6.52 2.64 14.66l6.36 4.95C11.06 13.47 16.08 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24.5c0-1.43-.12-2.8-.35-4.13H24v7.82h12.7c-.55 2.95-2.2 5.46-4.68 7.14l7.22 5.6c4.23-3.9 6.26-9.65 6.26-16.43z"/>
                <path fill="#FBBC05" d="M9 28.61c-1.07-3.2-1.07-6.63 0-9.83l-6.36-4.95C-1.22 20.7-1.22 27.3 2.64 34.17L9 28.61z"/>
                <path fill="#34A853" d="M24 47c5.96 0 10.97-1.97 14.62-5.35l-7.22-5.6c-2 1.35-4.56 2.14-7.4 2.14-7.92 0-12.94-3.97-15-10.11l-6.36 4.95C6.64 41.48 14.7 47 24 47z"/>
              </svg>
            </span>
            Continue with Google
          </a>
          <div class="mt-6 text-xs text-text-sub">Only accounts in the authorized users table may access the admin.</div>
        </div>
      </div>
      {{> publicFooterCompact}}
    </div>
  </body>
</html>
`;
