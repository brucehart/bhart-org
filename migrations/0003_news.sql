CREATE TABLE IF NOT EXISTS news_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS news_items_status_published ON news_items (status, published_at);
CREATE INDEX IF NOT EXISTS news_items_updated_at ON news_items (updated_at);

INSERT INTO news_items (
  id,
  category,
  title,
  body_markdown,
  status,
  published_at,
  created_at,
  updated_at
)
SELECT
  'news_launch',
  'Launch',
  'The blog is live!',
  'I will be sharing practical notes on AI, automation, and building software with real tradeoffs.\nWishing everyone a happy, safe, and productive 2026. Exciting time to be alive!',
  'published',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE NOT EXISTS (SELECT 1 FROM news_items);
