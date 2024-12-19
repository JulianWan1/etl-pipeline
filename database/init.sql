CREATE TABLE IF NOT EXISTS commits (
    id SERIAL PRIMARY KEY,
    sha TEXT NOT NULL UNIQUE,
    committer_name TEXT,
    committer_id TEXT,
    commit_date TIMESTAMP
);
