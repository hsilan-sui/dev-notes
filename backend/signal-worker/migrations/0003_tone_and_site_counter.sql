-- 語氣 (tone): a short word shown before a signal, like 說 or 想. NULL means 說.
ALTER TABLE signals ADD COLUMN tone TEXT NULL;

-- Site counter, 無名小站 style: visits and page views per day (Asia/Taipei).
CREATE TABLE IF NOT EXISTS site_counts (
    day TEXT NOT NULL,
    kind TEXT NOT NULL CHECK(kind IN ('visit', 'view')),
    count INTEGER NOT NULL,
    PRIMARY KEY (day, kind)
);

-- Who is here now: one random id per open tab, never an IP address.
CREATE TABLE IF NOT EXISTS presence (
    session TEXT PRIMARY KEY,
    seen_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_presence_seen ON presence(seen_at);
