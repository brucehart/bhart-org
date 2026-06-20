ALTER TABLE article_agent_jobs
  ADD COLUMN content_type TEXT NOT NULL DEFAULT 'article';

ALTER TABLE article_agent_jobs
  ADD COLUMN news_id TEXT;

ALTER TABLE article_agent_jobs
  ADD COLUMN news_category TEXT;

CREATE INDEX IF NOT EXISTS idx_article_agent_jobs_content_type
  ON article_agent_jobs (content_type, created_at DESC);
