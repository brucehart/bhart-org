CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  from_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  confirmed_at TEXT,
  forwarded_at TEXT,
  sender_ip TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON contact_messages (created_at);
