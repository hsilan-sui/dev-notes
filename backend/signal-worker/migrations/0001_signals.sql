-- Same shape as backend/MyTide.Api (SignalStore.cs), so data can move between them.
CREATE TABLE IF NOT EXISTS signals (
    id TEXT PRIMARY KEY,
    thread_id TEXT NULL REFERENCES signals(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    from_bank TEXT NOT NULL CHECK(from_bank IN ('past', 'today')),
    created_at INTEGER NOT NULL,
    departed TEXT NOT NULL,
    source_title TEXT NULL,
    source_day_key TEXT NULL
);
CREATE INDEX IF NOT EXISTS ix_signals_thread_created ON signals(thread_id, created_at);
CREATE INDEX IF NOT EXISTS ix_signals_created ON signals(created_at);

-- Per-visitor write counts for the rate limit (one row per IP per minute).
CREATE TABLE IF NOT EXISTS write_limits (
    client TEXT NOT NULL,
    window_start INTEGER NOT NULL,
    count INTEGER NOT NULL,
    PRIMARY KEY (client, window_start)
);
