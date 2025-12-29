export const errorTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Server Error</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries,typography"></script>
  </head>
  <body class="bg-background-light text-text-main font-display">
    <div class="min-h-screen flex items-center justify-center px-6">
      <div class="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <h1 class="text-2xl font-bold mb-2">Something went wrong</h1>
        <p class="text-sm text-text-sub mb-6">{{message}}</p>
        <a class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white" href="/">
          Return Home
        </a>
      </div>
    </div>
  </body>
</html>
`;
