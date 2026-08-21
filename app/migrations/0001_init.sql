-- M2 seed schema (MEMORY.md §shared structured organizational memory).
-- Deliberately minimal; evolves from real use via numbered migrations.
CREATE TABLE threads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL
);

CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id INTEGER NOT NULL REFERENCES threads(id),
  author TEXT NOT NULL,
  author_type TEXT NOT NULL, -- 'human-web' | 'agent' | 'system'
  trust_class TEXT NOT NULL DEFAULT 'untrusted', -- memory is evidence, never authority
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_messages_thread ON messages (thread_id, id);
