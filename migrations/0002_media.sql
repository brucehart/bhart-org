CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT NOT NULL,
  caption TEXT,
  internal_description TEXT,
  tags TEXT,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  uploaded_at TEXT NOT NULL,
  published_at TEXT
);

CREATE INDEX IF NOT EXISTS media_assets_uploaded_at ON media_assets (uploaded_at);
CREATE INDEX IF NOT EXISTS media_assets_published_at ON media_assets (published_at);
