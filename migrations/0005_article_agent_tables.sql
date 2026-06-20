CREATE TABLE IF NOT EXISTS article_agent_jobs (
  id                  TEXT PRIMARY KEY,
  requested_by        TEXT NOT NULL,
  prompt              TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'queued',
  sprite_name         TEXT NOT NULL,
  post_id             TEXT,
  post_slug           TEXT,
  title               TEXT,
  error               TEXT,
  callback_token_hash TEXT NOT NULL,
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL,
  started_at          TEXT,
  completed_at        TEXT
);

CREATE INDEX IF NOT EXISTS idx_article_agent_jobs_requested_by
  ON article_agent_jobs (requested_by, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_article_agent_jobs_status
  ON article_agent_jobs (status, created_at DESC);

CREATE TABLE IF NOT EXISTS article_agent_refs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id       TEXT NOT NULL,
  r2_key       TEXT NOT NULL,
  filename     TEXT NOT NULL,
  content_type TEXT NOT NULL,
  created_at   TEXT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES article_agent_jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_article_agent_refs_job_id
  ON article_agent_refs (job_id, id);

CREATE TABLE IF NOT EXISTS article_agent_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id     TEXT NOT NULL,
  event_type TEXT NOT NULL,
  message    TEXT NOT NULL,
  metadata   TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES article_agent_jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_article_agent_events_job_id
  ON article_agent_events (job_id, id);

CREATE TABLE IF NOT EXISTS article_agent_messages (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id       TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content      TEXT NOT NULL,
  created_at   TEXT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES article_agent_jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_article_agent_messages_job_id
  ON article_agent_messages (job_id, id);
